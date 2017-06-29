package ch.rasc.dataformat;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.flatbuffers.FlatBufferBuilder;

import ch.rasc.dataformat.proto.AddressProtos;

@RestController
public class AddressController {

	private final List<Address> testData;

	@Autowired
	public AddressController(@Value("#{testData}") List<Address> testData) {
		this.testData = Collections.unmodifiableList(testData);
	}

	@GetMapping(value = "/addresses", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Address> getAddressesJson() {
		return this.testData;
	}

	@GetMapping(value = "/addressesArray", produces = MediaType.APPLICATION_JSON_VALUE)
	public List<Object[]> getAddressesJsonArray() {
		return this.testData.stream().map(Address::toArray).collect(Collectors.toList());
	}

	@GetMapping(value = "/addresses", produces = "application/cbor")
	public List<Address> getAddressesCbor() {
		return this.testData;
	}

	@GetMapping(value = "/addressesArray", produces = "application/cbor")
	public List<Object[]> getAddressesCborArray() {
		return this.testData.stream().map(Address::toArray).collect(Collectors.toList());
	}

	@GetMapping(value = "/addresses", produces = "application/x-msgpack")
	public List<Map<String, Object>> getAddressesMsgpack() {
		return this.testData.stream().map(Address::toMap).collect(Collectors.toList());
	}

	@GetMapping(value = "/addressesArray", produces = "application/x-msgpack")
	public List<Address> getAddressesMsgpackArray() {
		return this.testData;
	}

	@GetMapping(value = "/addresses", produces = MediaType.APPLICATION_XML_VALUE)
	public Addresses getAddressesXml() {
		return new Addresses(this.testData);
	}

	@GetMapping(value = "/addresses", produces = "text/csv")
	public List<Address> getAddressesCsv() {
		return this.testData;
	}

	@GetMapping(value = "/addresses", produces = "application/x-protobuf")
	public AddressProtos.Addresses getAddressesProto() {
		List<AddressProtos.Address> addresses = this.testData.stream()
				.map(Address::toProto).collect(Collectors.toList());
		return AddressProtos.Addresses.newBuilder().addAllAddress(addresses).build();
	}

	@GetMapping(value = "/addresses", produces = "application/x-flatbuffers")
	public void getAddressesFlatbuffer(HttpServletResponse response) throws IOException {
		FlatBufferBuilder fbb = new FlatBufferBuilder(1_024 * 1_024);

		Map<String, Integer> dictionary = new HashMap<>();
		for (Address address : this.testData) {
			addStringToDict(dictionary, fbb, address.getLastName());
			addStringToDict(dictionary, fbb, address.getFirstName());
			addStringToDict(dictionary, fbb, address.getStreet());
			addStringToDict(dictionary, fbb, address.getZip());
			addStringToDict(dictionary, fbb, address.getCity());
			addStringToDict(dictionary, fbb, address.getCountry());
			addStringToDict(dictionary, fbb, address.getEmail());
		}

		List<Integer> addressOffsets = new ArrayList<>();
		for (Address address : this.testData) {
			ch.rasc.dataformat.fb.Address.startAddress(fbb);
			ch.rasc.dataformat.fb.Address.addId(fbb, address.getId());

			int offset = getDictOffset(dictionary, address.getLastName());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addLastName(fbb, offset);
			}

			offset = getDictOffset(dictionary, address.getFirstName());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addFirstName(fbb, offset);
			}

			offset = getDictOffset(dictionary, address.getStreet());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addStreet(fbb, offset);
			}

			offset = getDictOffset(dictionary, address.getZip());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addZip(fbb, offset);
			}

			offset = getDictOffset(dictionary, address.getCity());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addCity(fbb, offset);
			}

			offset = getDictOffset(dictionary, address.getCountry());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addCountry(fbb, offset);
			}

			ch.rasc.dataformat.fb.Address.addLat(fbb, address.getLat());
			ch.rasc.dataformat.fb.Address.addLng(fbb, address.getLng());

			offset = getDictOffset(dictionary, address.getEmail());
			if (offset != -1) {
				ch.rasc.dataformat.fb.Address.addEmail(fbb, offset);
			}

			if (address.getDob() != null) {
				ch.rasc.dataformat.fb.Address.addDob(fbb,
						(int) address.getDob().toEpochDay());
			}

			addressOffsets.add(ch.rasc.dataformat.fb.Address.endAddress(fbb));
		}

		int vector = ch.rasc.dataformat.fb.Addresses.createAddressVector(fbb,
				addressOffsets.stream().mapToInt(Integer::intValue).toArray());
		ch.rasc.dataformat.fb.Addresses.startAddresses(fbb);
		ch.rasc.dataformat.fb.Addresses.addAddress(fbb, vector);
		int root = ch.rasc.dataformat.fb.Addresses.endAddresses(fbb);

		ch.rasc.dataformat.fb.Addresses.finishAddressesBuffer(fbb, root);

		response.setContentType("application/x-flatbuffers");
		byte[] bytes = fbb.sizedByteArray();
		response.setContentLength(bytes.length);
		response.getOutputStream().write(bytes);
	}

	private static int getDictOffset(Map<String, Integer> dictionary, String str) {
		Integer offset = dictionary.get(str);
		if (offset != null) {
			return offset.intValue();
		}
		return -1;
	}

	private static void addStringToDict(Map<String, Integer> dictionary,
			FlatBufferBuilder fbb, String str) {
		if (str != null) {
			if (!dictionary.containsKey(str)) {
				int offset = fbb.createString(str);
				dictionary.put(str, offset);
			}
		}
	}
}
