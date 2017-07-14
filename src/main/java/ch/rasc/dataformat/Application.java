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
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@SpringBootApplication
public class Application extends WebMvcConfigurerAdapter {

	public static void main(String[] args) {
		// -Dspring.profiles.active=development
		// System.setProperty("spring.profiles.active", "development");
		SpringApplication.run(Application.class, args);
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
	public MappingJackson2SmileHttpMessageConverter mappingJackson2SmileHttpMessageConverter() {
		return new MappingJackson2SmileHttpMessageConverter();
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
	public Protobuf3HttpMessageConverter protobufHttpMessageConverter() {
		return new Protobuf3HttpMessageConverter();
	}

	@Bean
	public MessagePack messagePack() {
		MessagePack msgpack = new MessagePack();
		msgpack.register(LocalDate.class, LocalDateTemplate.instance);
		return msgpack;
	}

	@Override
	public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
		configurer.mediaType("cbor", MediaType.valueOf("application/cbor"))
				.mediaType("msgpack", MediaType.valueOf("application/x-msgpack"))
				.mediaType("csv", MediaType.valueOf("text/csv"))
				.mediaType("protobuf", MediaType.valueOf("application/x-protobuf"))
				.mediaType("flatbuffers", MediaType.valueOf("application/x-flatbuffers"))
				.mediaType("smile", MediaType.valueOf("application/x-jackson-smile"));
	}

}
