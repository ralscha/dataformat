package ch.rasc.dataformat;

import java.io.IOException;
import java.time.LocalDate;

import org.msgpack.MessageTypeException;
import org.msgpack.packer.Packer;
import org.msgpack.template.AbstractTemplate;
import org.msgpack.unpacker.Unpacker;

public class LocalDateTemplate extends AbstractTemplate<LocalDate> {
	private LocalDateTemplate() {
	}

	@Override
	public void write(Packer pk, LocalDate target, boolean required) throws IOException {
		if (target == null) {
			if (required) {
				throw new MessageTypeException("Attempted to write null");
			}
			pk.writeNil();
			return;
		}
		pk.write(target.toString());
	}

	@Override
	public LocalDate read(Unpacker u, LocalDate to, boolean required) throws IOException {
		if (!required && u.trySkipNil()) {
			return null;
		}
		String temp = u.readString();
		return LocalDate.parse(temp);
	}

	static public LocalDateTemplate getInstance() {
		return instance;
	}

	static final LocalDateTemplate instance = new LocalDateTemplate();
}
