package ch.rasc.dataformat;

import java.time.LocalDate;

import javax.xml.bind.annotation.adapters.XmlAdapter;

public class LocalDateAdapter extends XmlAdapter<Integer, LocalDate> {

	@Override
	public LocalDate unmarshal(Integer v) throws Exception {
		return LocalDate.ofEpochDay(v);
	}

	@Override
	public Integer marshal(LocalDate v) throws Exception {
		return (int)v.toEpochDay();
	}

}