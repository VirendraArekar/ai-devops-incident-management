package com.devops.agent.kubernetes;

import java.time.Instant;

public record PodInfo(
    String name,
    String namespace,
    String status, // Running, CrashLoopBackOff, Pending, OOMKilled, Error
    int restartCount,
    String nodeName,
    String ip,
    String cpuUsage,
    String memoryUsage,
    Instant startTime,
    boolean ready
) {}
