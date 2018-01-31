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
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class Application implements WebMvcConfigurer {

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

}
