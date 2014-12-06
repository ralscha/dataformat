@XmlJavaTypeAdapters({ @XmlJavaTypeAdapter(type = LocalDate.class,
		value = LocalDateAdapter.class), })
package ch.rasc.dataformat;

import java.time.LocalDate;

import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapter;
import javax.xml.bind.annotation.adapters.XmlJavaTypeAdapters;

