package ch.rasc.dataformat;

import java.io.IOException;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.TypeVariable;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.concurrent.atomic.AtomicReference;

import javax.annotation.Nullable;

import org.springframework.core.ResolvableType;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.HttpOutputMessage;
import org.springframework.http.MediaType;
import org.springframework.http.converter.AbstractGenericHttpMessageConverter;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.http.converter.HttpMessageNotWritableException;

import com.fasterxml.jackson.core.JsonEncoding;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.type.TypeFactory;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;

public class CsvHttpMessageConverter extends AbstractGenericHttpMessageConverter<Object> {

	private final CsvMapper csvMapper = new CsvMapper();

	public CsvHttpMessageConverter() {
		super(new MediaType("text", "csv"));
	}

	@Override
	public boolean canRead(Class<?> clazz, MediaType mediaType) {
		return canRead(clazz, null, mediaType);
	}

	@Override
	public boolean canRead(Type type, @Nullable Class<?> contextClass,
			MediaType mediaType) {
		if (!canRead(mediaType)) {
			return false;
		}
		JavaType javaType = getJavaType(type, contextClass);
		if (!this.logger.isWarnEnabled()) {
			return this.csvMapper.canDeserialize(javaType);
		}
		AtomicReference<Throwable> causeRef = new AtomicReference<>();
		if (this.csvMapper.canDeserialize(javaType, causeRef)) {
			return true;
		}
		logWarningIfNecessary(javaType, causeRef.get());
		return false;
	}

	@Override
	public boolean canWrite(Class<?> clazz, MediaType mediaType) {
		if (!canWrite(mediaType)) {
			return false;
		}
		if (!this.logger.isWarnEnabled()) {
			return this.csvMapper.canSerialize(clazz);
		}
		AtomicReference<Throwable> causeRef = new AtomicReference<>();
		if (this.csvMapper.canSerialize(clazz, causeRef)) {
			return true;
		}
		logWarningIfNecessary(clazz, causeRef.get());
		return false;
	}

	protected void logWarningIfNecessary(Type type, Throwable cause) {
		if (cause != null && !(cause instanceof JsonMappingException
				&& cause.getMessage().startsWith("Can not find"))) {
			String msg = "Failed to evaluate Jackson "
					+ (type instanceof JavaType ? "de" : "") + "serialization for type ["
					+ type + "]";
			if (this.logger.isDebugEnabled()) {
				this.logger.warn(msg, cause);
			}
			else {
				this.logger.warn(msg + ": " + cause);
			}
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
			return this.csvMapper.readerFor(javaType).with(schema)
					.readValue(inputMessage.getBody());
		}
		catch (IOException ex) {
			throw new HttpMessageNotReadableException(
					"Could not read CBOR: " + ex.getMessage(), ex, inputMessage);
		}
	}

	@Override
	protected void writeInternal(Object object, Type type,
			HttpOutputMessage outputMessage)
			throws IOException, HttpMessageNotWritableException {

		try {
			CsvSchema schema;

			if (type != null) {
				JavaType javaType = getJavaType(type, null);
				if (javaType.isCollectionLikeType()) {
					schema = this.csvMapper.schemaFor(javaType.getContentType());
				}
				else {
					schema = this.csvMapper.schemaFor(javaType);
				}
			}
			else {
				if (object instanceof Collection) {
					Collection<?> collection = (Collection<?>) object;
					if (!collection.isEmpty()) {
						schema = this.csvMapper
								.schemaFor(collection.iterator().next().getClass());
					}
					else {
						schema = this.csvMapper.schemaFor(object.getClass());
					}
				}
				else {
					schema = this.csvMapper.schemaFor(object.getClass());
				}
			}
			// schema = schema.withoutQuoteChar();

			this.csvMapper.writer(schema).writeValue(outputMessage.getBody(), object);
		}
		catch (JsonProcessingException ex) {
			throw new HttpMessageNotWritableException(
					"Could not write CBOR: " + ex.getMessage(), ex);
		}
	}

	protected JsonEncoding getJsonEncoding(MediaType contentType) {
		if (contentType != null && contentType.getCharset() != null) {
			Charset charset = contentType.getCharset();
			for (JsonEncoding encoding : JsonEncoding.values()) {
				if (charset.name().equals(encoding.getJavaName())) {
					return encoding;
				}
			}
		}
		return JsonEncoding.UTF8;
	}

	protected JavaType getJavaType(Type type, Class<?> contextClass) {
		TypeFactory typeFactory = this.csvMapper.getTypeFactory();
		if (contextClass != null) {
			ResolvableType resolvedType = ResolvableType.forType(type);
			if (type instanceof TypeVariable) {
				ResolvableType resolvedTypeVariable = resolveVariable(
						(TypeVariable<?>) type, ResolvableType.forClass(contextClass));
				if (resolvedTypeVariable != ResolvableType.NONE) {
					return typeFactory.constructType(resolvedTypeVariable.resolve());
				}
			}
			else if (type instanceof ParameterizedType
					&& resolvedType.hasUnresolvableGenerics()) {
				ParameterizedType parameterizedType = (ParameterizedType) type;
				Class<?>[] generics = new Class<?>[parameterizedType
						.getActualTypeArguments().length];
				Type[] typeArguments = parameterizedType.getActualTypeArguments();
				for (int i = 0; i < typeArguments.length; i++) {
					Type typeArgument = typeArguments[i];
					if (typeArgument instanceof TypeVariable) {
						ResolvableType resolvedTypeArgument = resolveVariable(
								(TypeVariable<?>) typeArgument,
								ResolvableType.forClass(contextClass));
						if (resolvedTypeArgument != ResolvableType.NONE) {
							generics[i] = resolvedTypeArgument.resolve();
						}
						else {
							generics[i] = ResolvableType.forType(typeArgument).resolve();
						}
					}
					else {
						generics[i] = ResolvableType.forType(typeArgument).resolve();
					}
				}
				return typeFactory.constructType(ResolvableType
						.forClassWithGenerics(resolvedType.getRawClass(), generics)
						.getType());
			}
		}
		return typeFactory.constructType(type);
	}

	private ResolvableType resolveVariable(TypeVariable<?> typeVariable,
			ResolvableType contextType) {
		ResolvableType resolvedType;
		if (contextType.hasGenerics()) {
			resolvedType = ResolvableType.forType(typeVariable, contextType);
			if (resolvedType.resolve() != null) {
				return resolvedType;
			}
		}
		resolvedType = resolveVariable(typeVariable, contextType.getSuperType());
		if (resolvedType.resolve() != null) {
			return resolvedType;
		}
		for (ResolvableType ifc : contextType.getInterfaces()) {
			resolvedType = resolveVariable(typeVariable, ifc);
			if (resolvedType.resolve() != null) {
				return resolvedType;
			}
		}
		return ResolvableType.NONE;
	}
}
