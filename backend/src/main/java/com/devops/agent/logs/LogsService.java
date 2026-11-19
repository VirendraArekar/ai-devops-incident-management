package com.devops.agent.logs;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class LogsService {

    private final LokiAdapter lokiAdapter;

    public LogsService(LokiAdapter lokiAdapter) {
        this.lokiAdapter = lokiAdapter;
    }

    public List<LogRecord> searchLogs(String query, String service, String level, String traceId, int limit) {
        return lokiAdapter.queryLogs(query, service, level, traceId, limit);
    }

    public List<LogRecord> getRecentErrors(String service, int limit) {
        return lokiAdapter.queryLogs(null, service, "ERROR", null, limit);
    }

    public Map<String, Object> getLogAnomalyAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("anomalyDetected", true);
        analysis.put("service", "payment-service");
        analysis.put("errorFrequencySpike", "+1,420% over 15-min baseline");
        analysis.put("topException", "PSQLException: Connection pool exhausted");
        analysis.put("correlatedTraceId", "7b3e99f1a2c4e680");
        analysis.put("firstSeenAt", Instant.now().minusSeconds(14 * 60).toString());
        analysis.put("relatedDeploymentCommit", "4f9e2b1c8a01 (v4.0.2)");
        return analysis;
    }
}
