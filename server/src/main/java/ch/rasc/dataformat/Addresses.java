package ch.rasc.dataformat;

import java.util.List;

import jakarta.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class Addresses {
	private List<Address> address;

	public Addresses() {
	}

	public Addresses(List<Address> address) {
		this.address = address;
	}

	public List<Address> getAddress() {
		return this.address;
	}

	public void setAddress(List<Address> address) {
		this.address = address;
	}

}