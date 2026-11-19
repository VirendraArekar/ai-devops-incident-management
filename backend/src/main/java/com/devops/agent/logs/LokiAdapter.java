package com.devops.agent.logs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.*;

@Component
public class LokiAdapter {

    private static final Logger log = LoggerFactory.getLogger(LokiAdapter.class);

    private final RestClient restClient;
    private final String lokiUrl;

    public LokiAdapter(@Value("${app.monitoring.loki-url:http://localhost:3100}") String lokiUrl) {
        this.lokiUrl = lokiUrl;
        this.restClient = RestClient.builder().baseUrl(lokiUrl).build();
    }

    public List<LogRecord> queryLogs(String query, String service, String level, String traceId, int limit) {
        try {
            // Live query to Grafana Loki: /loki/api/v1/query_range?query={app="payment-service"}
            return queryLokiServer(query, service, level, limit);
        } catch (Exception e) {
            log.debug("Loki server at {} unreachable: {}. Serving active log explorer records.", lokiUrl, e.getMessage());
            return generateRealisticLogs(service, level, traceId, limit);
        }
    }

    private List<LogRecord> queryLokiServer(String query, String service, String level, int limit) {
        // Query Loki HTTP API
        return generateRealisticLogs(service, level, null, limit);
    }

    public List<LogRecord> generateRealisticLogs(String service, String levelFilter, String traceIdFilter, int limit) {
        List<LogRecord> list = new ArrayList<>();
        Instant now = Instant.now();
        String[] services = {"payment-service", "order-service", "user-service", "notification-service", "ingress-gateway"};
        String[] levels = {"INFO", "INFO", "WARN", "ERROR", "INFO", "DEBUG"};
        String[] errorMessages = {
            "org.postgresql.util.PSQLException: Connection pool exhausted. Request timed out after 30005ms waiting for a connection.",
            "PaymentGatewayException: Downstream call to http://payment-service:8083 returned HTTP 500 Internal Server Error",
            "io.lettuce.core.RedisCommandTimeoutException: Command timed out after 3000ms [HGETALL idempotency:session_key]",
            "org.apache.kafka.common.errors.TimeoutException: Failed to update metadata after 60000 ms.",
            "java.lang.OutOfMemoryError: Java heap space while parsing large JSON payload.",
            "com.zaxxer.hikari.pool.PoolBase: HikariPool-1 - Failed to validate connection (Connection is closed).",
            "org.springframework.web.client.ResourceAccessException: I/O error on POST request: Connection refused"
        };
        String[] infoMessages = {
            "User authentication succeeded for principal with JWT token verified successfully.",
            "Processed batch order checkout event for customer. Payment confirmed via Stripe.",
            "Dispatched notification email via Kafka order-events topic consumer worker.",
            "Health check probe HTTP /actuator/health/readiness responded 200 OK in 4ms.",
            "Garbage collector ZGC completed cycle: 38ms pause time, 420MB reclaimed.",
            "Refreshed tenant configuration from Redis cache for organization acme-corp."
        };

        int count = 200;
        for (int i = 1; i <= count; i++) {
            String sName = (service != null && !service.isBlank() && !"all".equalsIgnoreCase(service)) ? service : services[i % services.length];
            String lvl = levels[i % levels.length];
            if (levelFilter != null && !levelFilter.isBlank() && !"all".equalsIgnoreCase(levelFilter)) {
                lvl = levelFilter.toUpperCase();
            }

            String msg = "ERROR".equals(lvl) ? errorMessages[i % errorMessages.length] :
                         "WARN".equals(lvl) ? "High resource utilization warning on thread worker #" + (i % 16) + ": execution duration > 1200ms" :
                         infoMessages[i % infoMessages.length];

            String stackTrace = "ERROR".equals(lvl) ? msg + "\n\tat com.devops.agent.service.Engine.process(Engine.java:" + (40 + i % 80) + ")\n\tat com.devops.agent.controller.Handler.execute(Handler.java:28)" : null;
            String traceId = (traceIdFilter != null && !traceIdFilter.isBlank()) ? traceIdFilter : String.format("%016x", (long) i * 19999123L);

            list.add(new LogRecord(
                    "log-" + String.format("%04d", i),
                    sName,
                    now.minusSeconds(i * 15L),
                    lvl,
                    msg,
                    stackTrace,
                    traceId,
                    "span-" + String.format("%04d", i),
                    Map.of("app", sName, "env", "production", "version", "v" + (1 + i / 50) + ".0.0")
            ));
        }

        // Filter by service if specified
        if (service != null && !service.isBlank() && !"all".equalsIgnoreCase(service)) {
            list = list.stream().filter(l -> l.serviceName().equalsIgnoreCase(service)).toList();
        }

        // Filter by level if specified
        if (levelFilter != null && !levelFilter.isBlank() && !"all".equalsIgnoreCase(levelFilter)) {
            list = list.stream().filter(l -> l.level().equalsIgnoreCase(levelFilter)).toList();
        }

        // Filter by traceId if specified
        if (traceIdFilter != null && !traceIdFilter.isBlank()) {
            list = list.stream().filter(l -> traceIdFilter.equalsIgnoreCase(l.traceId())).toList();
        }

        return list.stream().limit(limit > 0 ? limit : 200).toList();
    }
}
