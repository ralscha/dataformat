package ch.rasc.dataformat;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.google.flatbuffers.FlatBufferBuilder;

import ch.rasc.dataformat.proto.AddressProtos;

@RestController
public class AddressController {

	private final List<Address> testData;

	public AddressController(@Value("#{testData}") List<Address> testData) {
		this.testData = List.copyOf(testData);
	}

	@GetMapping(value = "/addresses", produces = { MediaType.APPLICATION_JSON_VALUE,
			"application/cbor", "application/x-jackson-smile", "text/csv" })
	public List<Address> getAddresses() {
		return this.testData;
	}

	@GetMapping(value = "/addressesArray", produces = { MediaType.APPLICATION_JSON_VALUE,
			"application/cbor", "application/x-jackson-smile", "application/x-msgpack" })
	public List<Object[]> getAddressesArray() {
		return this.testData.stream().map(Address::toArray).toList();
	}

	@GetMapping(value = "/addresses", produces = "application/x-msgpack")
	public List<Map<String, Object>> getAddressesMsgpack() {
		return this.testData.stream().map(Address::toMap).toList();
	}

	@GetMapping(value = "/addresses", produces = MediaType.APPLICATION_XML_VALUE)
	public Addresses getAddressesXml() {
		return new Addresses(this.testData);
	}

	@GetMapping(value = "/addresses", produces = "application/x-protobuf")
	public AddressProtos.Addresses getAddressesProto() {
		return AddressProtos.Addresses.newBuilder()
				.addAllAddress(this.testData.stream().map(Address::toProto).toList()).build();
	}

	@GetMapping(value = "/addresses", produces = "application/x-flatbuffers")
	public byte[] getAddressesFlatbuffer() {
		FlatBufferBuilder builder = new FlatBufferBuilder(1_024);
		int[] offsets = new int[this.testData.size()];
		for (int i = 0; i < offsets.length; i++) {
			Address address = this.testData.get(i);
			// Strings must be written before starting their table.
			offsets[i] = ch.rasc.dataformat.fb.Address.createAddress(builder, address.getId(),
					builder.createSharedString(address.getLastName()),
					builder.createSharedString(address.getFirstName()),
					builder.createSharedString(address.getStreet()),
					builder.createSharedString(address.getZip()),
					builder.createSharedString(address.getCity()),
					builder.createSharedString(address.getCountry()),
					address.getLat(), address.getLng(),
					builder.createSharedString(address.getEmail()),
					(int) address.getDob().toEpochDay());
		}
		int vector = ch.rasc.dataformat.fb.Addresses.createAddressVector(builder, offsets);
		int root = ch.rasc.dataformat.fb.Addresses.createAddresses(builder, vector);
		ch.rasc.dataformat.fb.Addresses.finishAddressesBuffer(builder, root);
		return builder.sizedByteArray();
	}
}
