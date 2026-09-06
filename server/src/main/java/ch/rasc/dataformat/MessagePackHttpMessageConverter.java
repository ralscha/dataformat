package ch.rasc.dataformat;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.msgpack.core.MessagePack;
import org.msgpack.core.MessagePacker;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

/** Encodes maps and positional arrays without reflective templates. */
public class MessagePackHttpMessageConverter extends AbstractHttpMessageConverter<List<?>> {

	public MessagePackHttpMessageConverter() {
		super(new MediaType("application", "x-msgpack"));
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
	protected List<?> readInternal(Class<? extends List<?>> clazz, HttpInputMessage inputMessage) {
		throw new HttpMessageNotReadableException("MessagePack input is not supported", inputMessage);
	}

	@Override
	protected void writeInternal(List<?> addresses, HttpOutputMessage outputMessage) throws IOException {
		MessagePacker packer = MessagePack.newDefaultPacker(outputMessage.getBody());
		writeValue(packer, addresses);
		packer.flush();
	}

	private static void writeValue(MessagePacker packer, Object value) throws IOException {
		switch (value) {
			case null -> packer.packNil();
			case String text -> packer.packString(text);
			case Integer number -> packer.packInt(number);
			case Float number -> packer.packFloat(number);
			case List<?> list -> {
				packer.packArrayHeader(list.size());
				for (Object element : list) {
					writeValue(packer, element);
				}
			}
			case Object[] array -> {
				packer.packArrayHeader(array.length);
				for (Object element : array) {
					writeValue(packer, element);
				}
			}
			case Map<?, ?> map -> {
				packer.packMapHeader(map.size());
				for (var entry : map.entrySet()) {
					writeValue(packer, entry.getKey());
					writeValue(packer, entry.getValue());
				}
			}
			default -> throw new HttpMessageNotWritableException("Unsupported MessagePack value: " + value.getClass());
		}
	}
}
