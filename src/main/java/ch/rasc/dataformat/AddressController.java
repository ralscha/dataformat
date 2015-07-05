package ch.rasc.dataformat;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import ch.rasc.dataformat.proto.AddressProtos;

@RestController
public class AddressController {

	private final List<Address> testData;

	@Autowired
	public AddressController(@Value("#{testData}") List<Address> testData) {
		this.testData = Collections.unmodifiableList(testData);
	}

	@RequestMapping(value = "/addresses", method = RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Address> getAddressesJson() {
		return this.testData;
	}

	@RequestMapping(value = "/addressesArray", method = RequestMethod.GET,
			produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Object[]> getAddressesJsonArray() {
		return this.testData.stream().map(Address::toArray).collect(Collectors.toList());
	}

	@RequestMapping(value = "/addresses", method = RequestMethod.GET,
			produces = "application/cbor")
	public List<Address> getAddressesCbor() {
		return this.testData;
	}

	@RequestMapping(value = "/addressesArray", method = RequestMethod.GET,
			produces = "application/cbor")
	public List<Object[]> getAddressesCborArray() {
		return this.testData.stream().map(Address::toArray).collect(Collectors.toList());
	}

	@RequestMapping(value = "/addresses", method = RequestMethod.GET,
			produces = "application/x-msgpack")
	public List<Map<String, Object>> getAddressesMsgpack() {
		return this.testData.stream().map(Address::toMap).collect(Collectors.toList());
	}

	@RequestMapping(value = "/addressesArray", method = RequestMethod.GET,
			produces = "application/x-msgpack")
	public List<Address> getAddressesMsgpackArray() {
		return this.testData;
	}

	@RequestMapping(value = "/addresses", method = RequestMethod.GET,
			produces = MediaType.APPLICATION_XML_VALUE)
	public Addresses getAddressesXml() {
		return new Addresses(this.testData);
	}

	@RequestMapping(value = "/addresses", method = RequestMethod.GET,
			produces = "text/csv")
	public List<Address> getAddressesCsv() {
		return this.testData;
	}

	@RequestMapping(value = "/addresses", method = RequestMethod.GET,
			produces = "application/x-protobuf")
	public AddressProtos.Addresses getAddressesProto() {
		List<AddressProtos.Address> addresses = this.testData.stream()
				.map(Address::toProto).collect(Collectors.toList());
		return AddressProtos.Addresses.newBuilder().addAllAddress(addresses).build();
	}
}
