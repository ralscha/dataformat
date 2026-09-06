package ch.rasc.dataformat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.stream.Stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.msgpack.core.MessagePack;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter;

import ch.rasc.dataformat.proto.AddressProtos;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.dataformat.cbor.CBORMapper;
import tools.jackson.dataformat.smile.SmileMapper;

@SpringBootTest
class AddressControllerTest {

	@Autowired
	private WebApplicationContext context;

	private MockMvc mvc;

	@BeforeEach
	void setUp() {
		this.mvc = MockMvcBuilders.webAppContextSetup(this.context).build();
	}

	static Stream<Arguments> formats() {
		return Stream.of(
				Arguments.of("/addresses", "json", "application/json"),
				Arguments.of("/addressesArray", "json", "application/json"),
				Arguments.of("/addresses", "xml", "application/xml"),
				Arguments.of("/addresses", "csv", "text/csv"),
				Arguments.of("/addresses", "cbor", "application/cbor"),
				Arguments.of("/addressesArray", "cbor", "application/cbor"),
				Arguments.of("/addresses", "smile", "application/x-jackson-smile"),
				Arguments.of("/addressesArray", "smile", "application/x-jackson-smile"),
				Arguments.of("/addresses", "msgpack", "application/x-msgpack"),
				Arguments.of("/addressesArray", "msgpack", "application/x-msgpack"),
				Arguments.of("/addresses", "protobuf", "application/x-protobuf"),
				Arguments.of("/addresses", "flatbuffers", "application/x-flatbuffers"));
	}

	@ParameterizedTest
	@MethodSource("formats")
	void negotiatesEveryFormatByParameterAndAccept(String path, String format, String mediaType) throws Exception {
		byte[] byParameter = this.mvc.perform(get(path).param("format", format))
				.andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith(mediaType))
				.andReturn().getResponse().getContentAsByteArray();
		byte[] byAccept = this.mvc.perform(get(path).accept(mediaType))
				.andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith(mediaType))
				.andReturn().getResponse().getContentAsByteArray();
		assertThat(byParameter).isNotEmpty().isEqualTo(byAccept);
	}

	@Test
	void defaultsToJsonAndRejectsUnsupportedFormats() throws Exception {
		this.mvc.perform(get("/addresses")).andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith("application/json"));
		this.mvc.perform(get("/addresses").param("format", "unknown")).andExpect(status().isNotAcceptable());
		this.mvc.perform(get("/addressesArray").param("format", "xml")).andExpect(status().isNotAcceptable());
	}

	@Test
	void binaryAndTextRepresentationsPreserveEpochZeroUnicodeAndZipCodes() throws Exception {
		Address address = new Address("1;Müller;Zoë;12, Main St.;00123;Zürich;CH;0, -1.25;test@example.com;01/01/1970");
		MockMvc fixture = fixture(List.of(address));
		var json = new JsonMapper().readTree(body(fixture, "/addresses", "json"));
		assertThat(json.get(0).get("zip").asString()).isEqualTo("00123");
		assertThat(json.get(0).get("lastName").asString()).isEqualTo("Müller");
		assertThat(json.get(0).get("dob").asInt()).isZero();
		assertThat(new CBORMapper().readTree(body(fixture, "/addresses", "cbor")).toString()).isEqualTo(json.toString());
		assertThat(new SmileMapper().readTree(body(fixture, "/addresses", "smile")).toString()).isEqualTo(json.toString());
		var arrays = new JsonMapper().readTree(body(fixture, "/addressesArray", "json"));
		assertThat(arrays.get(0).size()).isEqualTo(11);
		assertThat(new CBORMapper().readTree(body(fixture, "/addressesArray", "cbor")).toString()).isEqualTo(arrays.toString());
		assertThat(new SmileMapper().readTree(body(fixture, "/addressesArray", "smile")).toString()).isEqualTo(arrays.toString());
		try (var unpacker = MessagePack.newDefaultUnpacker(body(fixture, "/addressesArray", "msgpack"))) {
			var row = unpacker.unpackValue().asArrayValue().get(0).asArrayValue();
			assertThat(row.get(4).asStringValue().asString()).isEqualTo("00123");
			assertThat(row.get(10).asIntegerValue().asInt()).isZero();
		}
		try (var unpacker = MessagePack.newDefaultUnpacker(body(fixture, "/addresses", "msgpack"))) {
			var map = unpacker.unpackValue().asArrayValue().get(0).asMapValue();
			assertThat(new JsonMapper().readTree(map.toJson())).isEqualTo(json.get(0));
		}
		var proto = AddressProtos.Addresses.parseFrom(body(fixture, "/addresses", "protobuf")).getAddress(0);
		assertThat(proto.getZip()).isEqualTo("00123");
		assertThat(proto.getDob()).isZero();
		var flat = ch.rasc.dataformat.fb.Addresses.getRootAsAddresses(
				ByteBuffer.wrap(body(fixture, "/addresses", "flatbuffers"))).address(0);
		assertThat(flat.zip()).isEqualTo("00123");
		assertThat(flat.lastName()).isEqualTo("Müller");
		assertThat(flat.dob()).isZero();
		assertThat(new String(body(fixture, "/addresses", "xml"), StandardCharsets.UTF_8))
				.contains("<zip>00123</zip>", "<dob>0</dob>", "Müller");
		assertThat(new String(body(fixture, "/addresses", "csv"), StandardCharsets.UTF_8))
				.startsWith("1,Müller,Zoë,\"12, Main St.\",00123,").contains("test@example.com,0");
	}

	@ParameterizedTest
	@MethodSource("formats")
	void supportsEmptyCollections(String path, String format, String mediaType) throws Exception {
		fixture(List.of()).perform(get(path).accept(mediaType)).andExpect(status().isOk())
				.andExpect(content().contentTypeCompatibleWith(mediaType));
	}

	private MockMvc fixture(List<Address> addresses) {
		var converters = this.context.getBean(RequestMappingHandlerAdapter.class).getMessageConverters();
		return MockMvcBuilders.standaloneSetup(new AddressController(addresses))
				.setMessageConverters(converters.toArray(HttpMessageConverter<?>[]::new)).build();
	}

	private static byte[] body(MockMvc fixture, String path, String format) throws Exception {
		String mediaType = switch (format) {
			case "json" -> "application/json";
			case "xml" -> "application/xml";
			case "csv" -> "text/csv";
			case "cbor" -> "application/cbor";
			case "smile" -> "application/x-jackson-smile";
			default -> "application/x-" + format;
		};
		return fixture.perform(get(path).accept(mediaType)).andExpect(status().isOk())
				.andReturn().getResponse().getContentAsByteArray();
	}
}
