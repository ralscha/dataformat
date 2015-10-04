package ch.rasc.dataformat;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.msgpack.MessagePack;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@SpringBootApplication
public class DfApplication extends WebMvcConfigurerAdapter {

	public static void main(String[] args) {
		// -Dspring.profiles.active=development
		// System.setProperty("spring.profiles.active", "development");
		SpringApplication.run(DfApplication.class, args);
	}

	@Bean
	public List<Address> testData() throws IOException {
		Resource resource = new ClassPathResource("addresses.csv");

		try (InputStream is = resource.getInputStream();
				BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
			return reader.lines().map(Address::new).collect(Collectors.toList());
		}
	}

	@Bean
	public CborHttpMessageConverter cborHttpMessageConverter() {
		return new CborHttpMessageConverter();
	}

	@Bean
	public MessagePackHttpMessageConverter messagePackHttpMessageConverter() {
		return new MessagePackHttpMessageConverter(messagePack());
	}

	@Bean
	public CsvHttpMessageConverter csvHttpMessageConverter() {
		return new CsvHttpMessageConverter();
	}

	@Bean
	public ProtobufHttpMessageConverter protobufHttpMessageConverter() {
		return new ProtobufHttpMessageConverter();
	}

	@Bean
	public MessagePack messagePack() {
		MessagePack msgpack = new MessagePack();
		msgpack.register(LocalDate.class, LocalDateTemplate.instance);
		return msgpack;
	}

	@Override
	public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
		configurer.favorPathExtension(true).ignoreAcceptHeader(true).useJaf(false)
				.defaultContentType(MediaType.APPLICATION_JSON)
				.mediaType("json", MediaType.APPLICATION_JSON)
				.mediaType("xml", MediaType.APPLICATION_XML)
				.mediaType("cbor", MediaType.valueOf("application/cbor"))
				.mediaType("msgpack", MediaType.valueOf("application/x-msgpack"))
				.mediaType("csv", MediaType.valueOf("text/csv"))
				.mediaType("protobuf", MediaType.valueOf("application/x-protobuf"));
	}

}
