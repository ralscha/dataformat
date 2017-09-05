package ch.rasc.dataformat;

import java.util.Collections;

import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.filter.CorsFilter;

@Configuration
@Profile("development")
class DevelopmentConfig {

	@SuppressWarnings({ "rawtypes", "null" })
	@Bean
	public FilterRegistrationBean corsFilterRegistration() {
		FilterRegistrationBean<CorsFilter> filter = new FilterRegistrationBean<>();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOrigins(Collections.singletonList(CorsConfiguration.ALL));
		config.setAllowedMethods(Collections.singletonList(CorsConfiguration.ALL));
		config.setAllowedHeaders(Collections.singletonList(CorsConfiguration.ALL));
		config.setAllowCredentials(true);
		filter.setFilter(new CorsFilter(r -> config));
		filter.setUrlPatterns(Collections.singleton("/*"));
		filter.setOrder(SecurityProperties.DEFAULT_FILTER_ORDER - 1);
		return filter;
	}

}
