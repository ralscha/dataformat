package ch.rasc.dataformat;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlRootElement;

import org.msgpack.annotation.Message;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import tools.jackson.databind.annotation.JsonSerialize;

import ch.rasc.dataformat.proto.AddressProtos;

@XmlRootElement
@Message
@JsonPropertyOrder({ "id", "lastName", "firstName", "street", "zip", "city", "country",
		"lat", "lng", "email", "dob" })
public class Address {

	private final static DateTimeFormatter dobFormatter = DateTimeFormatter
			.ofPattern("MM/dd/yyyy");

	@XmlElement
	private int id;

	@XmlElement
	private String lastName;

	@XmlElement
	private String firstName;

	@XmlElement
	private String street;

	@XmlElement
	private String zip;

	@XmlElement
	private String city;

	@XmlElement
	private String country;

	@XmlElement
	private float lat;

	@XmlElement
	private float lng;

	@XmlElement
	private String email;

	@XmlElement
	@JsonSerialize(using = LocalDateSerializer.class)
	private LocalDate dob;

	public Object[] toArray() {
		return new Object[] { this.id, this.lastName, this.firstName, this.street,
				this.zip, this.city, this.country, this.lat, this.lng, this.email,
				(int) this.dob.toEpochDay() };
	}

	public Map<String, Object> toMap() {
		Map<String, Object> map = new HashMap<>();
		map.put("id", this.id);
		map.put("lastName", this.lastName);
		map.put("firstName", this.firstName);
		map.put("street", this.street);
		map.put("zip", this.zip);
		map.put("city", this.city);
		map.put("country", this.country);
		map.put("lat", this.lat);
		map.put("lng", this.lng);
		map.put("email", this.email);
		map.put("dob", (int) this.dob.toEpochDay());
		return map;
	}

	public AddressProtos.Address toProto() {
		return AddressProtos.Address.newBuilder().setId(this.id)
				.setLastName(this.lastName).setFirstName(this.firstName)
				.setStreet(this.street).setZip(this.zip).setCity(this.city)
				.setCountry(this.country).setLat(this.lat).setLng(this.lng)
				.setEmail(this.email).setDob((int) this.dob.toEpochDay()).build();
	}

	public Address() {
	}

	public Address(String line) {
		String[] tokens = line.split(";");
		this.id = Integer.parseInt(tokens[0]);
		this.lastName = tokens[1];
		this.firstName = tokens[2];
		this.street = tokens[3];
		this.zip = tokens[4];
		this.city = tokens[5];
		this.country = tokens[6];

		String[] latlng = tokens[7].split(",");
		this.lat = Float.parseFloat(latlng[0].trim());
		this.lng = Float.parseFloat(latlng[1].trim());

		this.email = tokens[8];
		this.dob = LocalDate.parse(tokens[9], dobFormatter);
	}

	public int getId() {
		return this.id;
	}

	public String getLastName() {
		return this.lastName;
	}

	public String getFirstName() {
		return this.firstName;
	}

	public String getStreet() {
		return this.street;
	}

	public String getZip() {
		return this.zip;
	}

	public String getCity() {
		return this.city;
	}

	public String getCountry() {
		return this.country;
	}

	public float getLat() {
		return this.lat;
	}

	public float getLng() {
		return this.lng;
	}

	public String getEmail() {
		return this.email;
	}

	public LocalDate getDob() {
		return this.dob;
	}

}
