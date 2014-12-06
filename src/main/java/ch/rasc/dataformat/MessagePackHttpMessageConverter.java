package ch.rasc.dataformat;

import java.io.IOException;
import java.lang.reflect.Type;

import org.msgpack.MessagePack;
import org.msgpack.MessageTypeException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.GenericHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

public class MessagePackHttpMessageConverter extends AbstractHttpMessageConverter<Object>
		implements GenericHttpMessageConverter<Object> {

	private final MessagePack messagePack;

	public MessagePackHttpMessageConverter(MessagePack messagePack) {
		super(new MediaType("application", "x-msgpack"));
		this.messagePack = messagePack;
	}

	@Override
	public boolean canRead(Class<?> clazz, MediaType mediaType) {
		return canRead(clazz, null, mediaType);
	}

	@Override
	public boolean canRead(Type type, Class<?> contextClass, MediaType mediaType) {
		try {
			return canRead(mediaType) && messagePack.lookup(type) != null;
		}
		catch (MessageTypeException ex) {
			throw new HttpMessageNotReadableException("Could not read MessagePack: "
					+ ex.getMessage(), ex);
		}
	}

	@Override
	public boolean canWrite(Class<?> clazz, MediaType mediaType) {
		try {
			return canWrite(mediaType) && messagePack.lookup(clazz) != null;
		}
		catch (MessageTypeException ex) {
			throw new HttpMessageNotWritableException("Could not write MessagePack: "
					+ ex.getMessage(), ex);
		}
	}

	@Override
	protected boolean supports(Class<?> clazz) {
		// should not be called, since we override canRead/Write instead
		throw new UnsupportedOperationException();
	}

	@Override
	protected Object readInternal(Class<?> clazz, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException {
		return messagePack.read(inputMessage.getBody(), clazz);
	}

	@Override
	public Object read(Type type, Class<?> contextClass, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException {
		return messagePack.read(inputMessage.getBody(), type.getClass() /* ??? */);
	}

	@Override
	protected void writeInternal(Object object, HttpOutputMessage outputMessage)
			throws IOException {
		messagePack.write(outputMessage.getBody(), object);
	}

}
