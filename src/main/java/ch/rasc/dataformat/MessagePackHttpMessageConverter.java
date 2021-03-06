package ch.rasc.dataformat;

import java.io.IOException;
import java.lang.reflect.Type;

import javax.annotation.Nullable;

import org.msgpack.MessagePack;
import org.msgpack.MessageTypeException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractGenericHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

public class MessagePackHttpMessageConverter
		extends AbstractGenericHttpMessageConverter<Object> {

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
	public boolean canRead(Type type, @Nullable Class<?> contextClass,
			MediaType mediaType) {
		try {
			return canRead(mediaType) && this.messagePack.lookup(type) != null;
		}
		catch (MessageTypeException ex) {
			throw new HttpMessageNotReadableException(
					"Could not read MessagePack: " + ex.getMessage(), ex);
		}
	}

	@Override
	public boolean canWrite(Class<?> clazz, MediaType mediaType) {
		try {
			return canWrite(mediaType) && this.messagePack.lookup(clazz) != null;
		}
		catch (MessageTypeException ex) {
			throw new HttpMessageNotWritableException(
					"Could not write MessagePack: " + ex.getMessage(), ex);
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
		return this.messagePack.read(inputMessage.getBody(), clazz);
	}

	@Override
	public Object read(Type type, Class<?> contextClass, HttpInputMessage inputMessage)
			throws IOException, HttpMessageNotReadableException {
		return this.messagePack.read(inputMessage.getBody(), type.getClass() /* ??? */);
	}

	@Override
	protected void writeInternal(Object object, Type type,
			HttpOutputMessage outputMessage) throws IOException {
		this.messagePack.write(outputMessage.getBody(), object);
	}

}
