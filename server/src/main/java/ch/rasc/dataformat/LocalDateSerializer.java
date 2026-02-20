package ch.rasc.dataformat;

import java.time.LocalDate;

import tools.jackson.core.JsonGenerator;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ValueSerializer;
import tools.jackson.databind.SerializationContext;

public class LocalDateSerializer extends ValueSerializer<LocalDate> {

	@Override
	public void serialize(LocalDate value, JsonGenerator jgen,
			SerializationContext provider) throws JacksonException {
		jgen.writeNumber((int) value.toEpochDay());
	}

}
