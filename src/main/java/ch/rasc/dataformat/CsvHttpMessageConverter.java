package ch.rasc.dataformat;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.GenericHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

public class CsvHttpMessageConverter extends AbstractHttpMessageConverter<Object>
		implements GenericHttpMessageConverter<Object> {

	private final CsvMapper csvMapper = new CsvMapper();

	public CsvHttpMessageConverter() {
		super(new MediaType("text", "csv"));
	}

	@Override
	public boolean canRead(Class<?> clazz, MediaType mediaType) {
		return canRead(clazz, null, mediaType);
	}

	@Override
	public boolean canRead(Type type, Class<?> contextClass, MediaType mediaType) {
		JavaType javaType = getJavaType(type, contextClass);

		AtomicReference<Throwable> causeRef = new AtomicReference<>();
		if (this.csvMapper.canDeserialize(javaType, causeRef) && canRead(mediaType)) {
			return true;
		}
		Throwable cause = causeRef.get();
		if (cause != null) {
			String msg = "Failed to evaluate deserialization for type " + javaType;
			if (this.logger.isDebugEnabled()) {
				this.logger.warn(msg, cause);
			}
			else {
				this.logger.warn(msg + ": " + cause);
			}
		}
		return false;
	}

	@Override
	public boolean canWrite(Class<?> clazz, MediaType mediaType) {

		AtomicReference<Throwable> causeRef = new AtomicReference<>();
		if (this.csvMapper.canSerialize(clazz, causeRef) && canWrite(mediaType)) {
			return true;
		}
		Throwable cause = causeRef.get();
		if (cause != null) {
			String msg = "Failed to evaluate serialization for type [" + clazz + "]";
			if (this.logger.isDebugEnabled()) {
				this.logger.warn(msg, cause);
			}
			else {
				this.logger.warn(msg + ": " + cause);
			}
		}
		return false;
	}

	@Override
	protected boolean supports(Class<?> clazz) {
		// should not be called, since we override canRead/Write instead
		throw new UnsupportedOperationException();
	}

	@Override
	protected Object readInternal(Class<?> clazz, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException {

		JavaType javaType = getJavaType(clazz, null);
		return readJavaType(javaType, inputMessage);
	}

	@Override
	public Object read(Type type, Class<?> contextClass, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException {

		JavaType javaType = getJavaType(type, contextClass);
		return readJavaType(javaType, inputMessage);
	}

	private Object readJavaType(JavaType javaType, HttpInputMessage inputMessage) {
		try {
			CsvSchema schema = this.csvMapper.schemaFor(javaType);
			return this.csvMapper.reader(javaType).with(schema)
					.readValue(inputMessage.getBody());
		}
		catch (IOException ex) {
			throw new HttpMessageNotReadableException("Could not read CBOR: "
					+ ex.getMessage(), ex);
		}
	}

	@Override
	protected void writeInternal(Object object, HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException {

		try {
			CsvSchema schema;
			if (object instanceof Collection) {
				Collection<?> collection = (Collection<?>) object;
				if (!collection.isEmpty()) {
					schema = this.csvMapper.schemaFor(collection.iterator().next()
							.getClass());
				}
				else {
					schema = this.csvMapper.schemaFor(object.getClass());
				}
			}
			else {
				schema = this.csvMapper.schemaFor(object.getClass());
			}
			// schema = schema.withoutQuoteChar();

			this.csvMapper.writer(schema).writeValue(outputMessage.getBody(), object);
		}
		catch (JsonProcessingException ex) {
			throw new HttpMessageNotWritableException("Could not write CBOR: "
					+ ex.getMessage(), ex);
		}
	}

	protected JavaType getJavaType(Type type, Class<?> contextClass) {
		return this.csvMapper.getTypeFactory().constructType(type, contextClass);
	}

}
