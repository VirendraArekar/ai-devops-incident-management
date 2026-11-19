package com.devops.agent.monitoring;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class MonitoringService {

    private final PrometheusAdapter prometheusAdapter;

    public MonitoringService(PrometheusAdapter prometheusAdapter) {
        this.prometheusAdapter = prometheusAdapter;
    }

    public Map<String, Object> getDashboardOverview() {
        Map<String, Object> overview = new HashMap<>();

        overview.put("activeIncidentsCount", 1);
        overview.put("resolvedIncidentsCount", 14);
        overview.put("criticalAlertsCount", 2);
        overview.put("mttdMinutes", 2.4);
        overview.put("mttaMinutes", 4.1);
        overview.put("mttrMinutes", 28.5);
        overview.put("overallSlaCompliance", 99.92);
        overview.put("totalMonitoredServices", 4);
        overview.put("healthyServicesCount", 3);
        overview.put("degradedServicesCount", 1);

        List<Map<String, Object>> servicesStatus = List.of(
            Map.of("id", "70000000-0000-0000-0000-000000000001", "name", "User Service", "slug", "user-service", "status", "HEALTHY", "cpu", "28%", "memory", "44%", "errorRate", "0.02%", "version", "v2.4.1"),
            Map.of("id", "70000000-0000-0000-0000-000000000002", "name", "Order Service", "slug", "order-service", "status", "HEALTHY", "cpu", "35%", "memory", "52%", "errorRate", "0.05%", "version", "v3.1.0"),
            Map.of("id", "70000000-0000-0000-0000-000000000003", "name", "Payment Service", "slug", "payment-service", "status", "DEGRADED", "cpu", "89%", "memory", "88%", "errorRate", "42.8%", "version", "v4.0.2"),
            Map.of("id", "70000000-0000-0000-0000-000000000004", "name", "Notification Service", "slug", "notification-service", "status", "HEALTHY", "cpu", "18%", "memory", "38%", "errorRate", "0.01%", "version", "v1.9.0")
        );
        overview.put("services", servicesStatus);

        return overview;
    }

    public List<MetricSnapshot> getServiceMetrics(String serviceName) {
        return prometheusAdapter.fetchCurrentMetrics(serviceName);
    }

    public List<Map<String, Object>> getHistoricalTimeSeries(String metricName, int points) {
        int count = points > 0 ? points : 200;
        List<Map<String, Object>> series = new ArrayList<>();
        Instant base = Instant.now().minusSeconds(count * 60L);
        Random r = new Random();

        for (int i = 0; i < count; i++) {
            Instant t = base.plusSeconds(i * 60L);
            double val;
            if (i > count - 15) {
                // simulated spike during last 15 minutes
                val = "cpu".equalsIgnoreCase(metricName) ? 80 + r.nextDouble() * 15 :
                      "http_500".equalsIgnoreCase(metricName) ? 35 + r.nextDouble() * 15 :
                      "latency".equalsIgnoreCase(metricName) ? 2800 + r.nextDouble() * 600 :
                      85 + r.nextDouble() * 10;
            } else {
                val = "cpu".equalsIgnoreCase(metricName) ? 25 + r.nextDouble() * 10 :
                      "http_500".equalsIgnoreCase(metricName) ? 0.05 + r.nextDouble() * 0.1 :
                      "latency".equalsIgnoreCase(metricName) ? 120 + r.nextDouble() * 40 :
                      40 + r.nextDouble() * 8;
            }

            Map<String, Object> point = new HashMap<>();
            point.put("timestamp", t.toString());
            point.put("time", String.format("%02d:%02d", (t.getEpochSecond() / 3600) % 24, (t.getEpochSecond() / 60) % 60));
            point.put("value", Math.round(val * 10.0) / 10.0);
            point.put("paymentService", Math.round(val * 10.0) / 10.0);
            point.put("orderService", Math.round((20 + r.nextDouble() * 15) * 10.0) / 10.0);
            point.put("userService", Math.round((18 + r.nextDouble() * 12) * 10.0) / 10.0);
            series.add(point);
        }
        return series;
    }
}
