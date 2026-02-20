@XmlJavaTypeAdapters({
		@XmlJavaTypeAdapter(type = LocalDate.class, value = LocalDateAdapter.class), })
package ch.rasc.dataformat;

import java.time.LocalDate;

import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import jakarta.xml.bind.annotation.adapters.XmlJavaTypeAdapters;
