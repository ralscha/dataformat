package ch.rasc.dataformat;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.coyote.http11.AbstractHttp11Protocol;
import org.msgpack.MessagePack;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@SpringBootApplication
public class Application extends WebMvcConfigurerAdapter {

	// -Dspring.profiles.active=compression
	public static void main(String[] args) {
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
	public MessagePackHttpMessageConverter messagePackHttpMessageConverter() {
		return new MessagePackHttpMessageConverter(messagePack());
	}

	@Bean
	public CsvHttpMessageConverter csvHttpMessageConverter() {
		return new CsvHttpMessageConverter();
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
				.mediaType("csv", MediaType.valueOf("text/csv"));
	}

	@Bean
	@Profile("compression")
	public EmbeddedServletContainerCustomizer servletContainerCustomizer() {
		return servletContainer -> ((TomcatEmbeddedServletContainerFactory) servletContainer)
				.addConnectorCustomizers(connector -> {
					AbstractHttp11Protocol<?> httpProtocol = (AbstractHttp11Protocol<?>) connector
							.getProtocolHandler();
					httpProtocol.setCompression("on");
					httpProtocol.setCompressionMinSize(512);
					String mimeTypes = httpProtocol.getCompressableMimeTypes();
					String additionalMimeTypes = mimeTypes + ","
							+ MediaType.APPLICATION_JSON_VALUE + ","
							+ MediaType.APPLICATION_XML_VALUE + ","
							+ "application/cbor,application/x-msgpack,text/csv";

					httpProtocol.setCompressableMimeTypes(additionalMimeTypes);
				});
	}

}
