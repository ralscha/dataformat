// automatically generated by the FlatBuffers compiler, do not modify

package ch.rasc.dataformat.fb;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;

import com.google.flatbuffers.FlatBufferBuilder;
import com.google.flatbuffers.Table;

@SuppressWarnings("unused")
public final class Address extends Table {
	public static Address getRootAsAddress(ByteBuffer _bb) {
		return getRootAsAddress(_bb, new Address());
	}

	public static Address getRootAsAddress(ByteBuffer _bb, Address obj) {
		_bb.order(ByteOrder.LITTLE_ENDIAN);
		return obj.__init(_bb.getInt(_bb.position()) + _bb.position(), _bb);
	}

	public Address __init(int _i, ByteBuffer _bb) {
		this.bb_pos = _i;
		this.bb = _bb;
		return this;
	}

	public long id() {
		int o = __offset(4);
		return o != 0 ? this.bb.getInt(o + this.bb_pos) & 0xFFFFFFFFL : 0;
	}

	public String lastName() {
		int o = __offset(6);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer lastNameAsByteBuffer() {
		return __vector_as_bytebuffer(6, 1);
	}

	public String firstName() {
		int o = __offset(8);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer firstNameAsByteBuffer() {
		return __vector_as_bytebuffer(8, 1);
	}

	public String street() {
		int o = __offset(10);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer streetAsByteBuffer() {
		return __vector_as_bytebuffer(10, 1);
	}

	public String zip() {
		int o = __offset(12);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer zipAsByteBuffer() {
		return __vector_as_bytebuffer(12, 1);
	}

	public String city() {
		int o = __offset(14);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer cityAsByteBuffer() {
		return __vector_as_bytebuffer(14, 1);
	}

	public String country() {
		int o = __offset(16);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer countryAsByteBuffer() {
		return __vector_as_bytebuffer(16, 1);
	}

	public float lat() {
		int o = __offset(18);
		return o != 0 ? this.bb.getFloat(o + this.bb_pos) : 0.0f;
	}

	public float lng() {
		int o = __offset(20);
		return o != 0 ? this.bb.getFloat(o + this.bb_pos) : 0.0f;
	}

	public String email() {
		int o = __offset(22);
		return o != 0 ? __string(o + this.bb_pos) : null;
	}

	public ByteBuffer emailAsByteBuffer() {
		return __vector_as_bytebuffer(22, 1);
	}

	public int dob() {
		int o = __offset(24);
		return o != 0 ? this.bb.getInt(o + this.bb_pos) : 0;
	}

	public static int createAddress(FlatBufferBuilder builder, long id,
			int lastNameOffset, int firstNameOffset, int streetOffset, int zipOffset,
			int cityOffset, int countryOffset, float lat, float lng, int emailOffset,
			int dob) {
		builder.startObject(11);
		Address.addDob(builder, dob);
		Address.addEmail(builder, emailOffset);
		Address.addLng(builder, lng);
		Address.addLat(builder, lat);
		Address.addCountry(builder, countryOffset);
		Address.addCity(builder, cityOffset);
		Address.addZip(builder, zipOffset);
		Address.addStreet(builder, streetOffset);
		Address.addFirstName(builder, firstNameOffset);
		Address.addLastName(builder, lastNameOffset);
		Address.addId(builder, id);
		return Address.endAddress(builder);
	}

	public static void startAddress(FlatBufferBuilder builder) {
		builder.startObject(11);
	}

	public static void addId(FlatBufferBuilder builder, long id) {
		builder.addInt(0, (int) id, 0);
	}

	public static void addLastName(FlatBufferBuilder builder, int lastNameOffset) {
		builder.addOffset(1, lastNameOffset, 0);
	}

	public static void addFirstName(FlatBufferBuilder builder, int firstNameOffset) {
		builder.addOffset(2, firstNameOffset, 0);
	}

	public static void addStreet(FlatBufferBuilder builder, int streetOffset) {
		builder.addOffset(3, streetOffset, 0);
	}

	public static void addZip(FlatBufferBuilder builder, int zipOffset) {
		builder.addOffset(4, zipOffset, 0);
	}

	public static void addCity(FlatBufferBuilder builder, int cityOffset) {
		builder.addOffset(5, cityOffset, 0);
	}

	public static void addCountry(FlatBufferBuilder builder, int countryOffset) {
		builder.addOffset(6, countryOffset, 0);
	}

	public static void addLat(FlatBufferBuilder builder, float lat) {
		builder.addFloat(7, lat, 0.0f);
	}

	public static void addLng(FlatBufferBuilder builder, float lng) {
		builder.addFloat(8, lng, 0.0f);
	}

	public static void addEmail(FlatBufferBuilder builder, int emailOffset) {
		builder.addOffset(9, emailOffset, 0);
	}

	public static void addDob(FlatBufferBuilder builder, int dob) {
		builder.addInt(10, dob, 0);
	}

	public static int endAddress(FlatBufferBuilder builder) {
		int o = builder.endObject();
		return o;
	}
}
