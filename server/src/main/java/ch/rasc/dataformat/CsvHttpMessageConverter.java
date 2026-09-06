package ch.rasc.dataformat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectWriter;
import tools.jackson.dataformat.csv.CsvMapper;

/** Writes addresses in the documented column order, without a header. */
public class CsvHttpMessageConverter extends AbstractHttpMessageConverter<List<Address>> {

	private final ObjectWriter writer;

	public CsvHttpMessageConverter() {
		super(StandardCharsets.UTF_8, new MediaType("text", "csv"));
		CsvMapper mapper = new CsvMapper();
		this.writer = mapper.writer(mapper.schemaFor(Address.class));
	}

	@Override
	protected boolean supports(Class<?> clazz) {
		return List.class.isAssignableFrom(clazz);
	}

	@Override
	public boolean canRead(Class<?> clazz, MediaType mediaType) {
		return false;
	}

	@Override
	protected List<Address> readInternal(Class<? extends List<Address>> clazz,
			HttpInputMessage inputMessage) {
		throw new HttpMessageNotReadableException("CSV input is not supported", inputMessage);
	}

	@Override
	protected void writeInternal(List<Address> addresses, HttpOutputMessage outputMessage)
			throws IOException {
		try {
			this.writer.writeValue(outputMessage.getBody(), addresses);
		}
		catch (JacksonException ex) {
			throw new HttpMessageNotWritableException("Could not write CSV: " + ex.getMessage(), ex);
		}
	}
}
