package ch.rasc.dataformat;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.converter.protobuf.ProtobufHttpMessageConverter;

@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}

	@Bean
	public List<Address> testData() throws IOException {
		Resource resource = new ClassPathResource("addresses.csv");

		try (InputStream is = resource.getInputStream();
				BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
			return reader.lines().map(Address::new).toList();
		}
	}

	@Bean
	public MessagePackHttpMessageConverter messagePackHttpMessageConverter() {
		return new MessagePackHttpMessageConverter();
	}

	@Bean
	public CsvHttpMessageConverter csvHttpMessageConverter() {
		return new CsvHttpMessageConverter();
	}

	@Bean
	public ProtobufHttpMessageConverter protobufHttpMessageConverter() {
		return new ProtobufHttpMessageConverter();
	}

}
