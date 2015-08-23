package ch.rasc.dataformat;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractGenericHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;
import org.springframework.util.TypeUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.dataformat.cbor.CBORFactory;

public class CborHttpMessageConverter
		extends AbstractGenericHttpMessageConverter<Object> {

	private final ObjectMapper objectMapper = new ObjectMapper(new CBORFactory());

	public CborHttpMessageConverter() {
		super(new MediaType("application", "cbor"));
	}

	@Override
	public boolean canRead(Class<?> clazz, MediaType mediaType) {
		return canRead(clazz, null, mediaType);
	}

	@Override
	public boolean canRead(Type type, Class<?> contextClass, MediaType mediaType) {
		JavaType javaType = getJavaType(type, contextClass);

		AtomicReference<Throwable> causeRef = new AtomicReference<>();
		if (this.objectMapper.canDeserialize(javaType, causeRef) && canRead(mediaType)) {
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
		if (this.objectMapper.canSerialize(clazz, causeRef) && canWrite(mediaType)) {
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
			return this.objectMapper.readValue(inputMessage.getBody(), javaType);
		}
		catch (IOException ex) {
			throw new HttpMessageNotReadableException(
					"Could not read CBOR: " + ex.getMessage(), ex);
		}
	}

	@Override
	protected void writeInternal(Object o, Type type, HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException {

		try {
			ObjectWriter objectWriter = this.objectMapper.writer();

			JavaType javaType = null;
			if (type != null && o != null && TypeUtils.isAssignable(type, o.getClass())) {
				javaType = getJavaType(type, null);
			}

			if (javaType != null) {
				objectWriter = objectWriter.forType(javaType);
			}
			objectWriter.writeValue(outputMessage.getBody(), o);
		}
		catch (JsonProcessingException ex) {
			throw new HttpMessageNotWritableException(
					"Could not write CBOR: " + ex.getMessage(), ex);
		}
	}

	protected JavaType getJavaType(Type type, Class<?> contextClass) {
		return this.objectMapper.getTypeFactory().constructType(type, contextClass);
	}

}
