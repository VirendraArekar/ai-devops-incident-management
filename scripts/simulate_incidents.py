#!/usr/bin/env python3
"""
DevOps Incident Management & Autonomous RCA Simulator
Simulates 8 production-grade failure scenarios against the system.

Usage:
    python scripts/simulate_incidents.py --scenario 1
    python scripts/simulate_incidents.py --scenario http_500
    python scripts/simulate_incidents.py --all
    python scripts/simulate_incidents.py --reset
"""

import argparse
import sys
import time
import json
import urllib.request
import urllib.error

BACKEND_URL = "http://localhost:8080/api/v1"
PAYMENT_SERVICE_URL = "http://localhost:8083"
NOTIFICATION_SERVICE_URL = "http://localhost:8084"

SCENARIOS = {
    "1": {
        "key": "http_500",
        "title": "Payment Service HTTP 500 Error Surge",
        "severity": "SEV-1",
        "desc": "Simulates 45% HTTP 500 failure rate on /api/v1/payments/process after buggy v4.0.2 deployment.",
        "fault_url": f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/http500"
    },
    "2": {
        "key": "db_exhaustion",
        "title": "HikariCP Database Connection Pool Exhaustion",
        "severity": "SEV-1",
        "desc": "Simulates 0 idle connections out of 20 with queue timeouts > 30s.",
        "fault_url": f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/leak-db"
    },
    "3": {
        "key": "latency_spike",
        "title": "API P99 Latency SLA Violation (4.8s)",
        "severity": "SEV-2",
        "desc": "Simulates 4000ms upstream database lock causing downstream cascade.",
        "fault_url": f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/latency"
    },
    "4": {
        "key": "high_cpu",
        "title": "Order Service CPU Saturation (>94%)",
        "severity": "SEV-2",
        "desc": "Simulates cryptographic hash loop pegging 4 CPU cores.",
        "fault_url": f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/cpu-spike"
    },
    "5": {
        "key": "oom_killed",
        "title": "Container Memory Leak & OOMKilled (Exit 137)",
        "severity": "SEV-1",
        "desc": "Simulates uncontrolled heap growth exceeding 2.0GB cgroup limit.",
        "fault_url": f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/oom"
    },
    "6": {
        "key": "crashloop",
        "title": "Kubernetes Pod CrashLoopBackOff",
        "severity": "SEV-1",
        "desc": "Simulates container liveness probe failure causing repeat pod termination.",
        "fault_url": f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/crash"
    },
    "7": {
        "key": "failed_deployment",
        "title": "Canary Deployment Regression (v4.0.3)",
        "severity": "SEV-2",
        "desc": "Simulates automated canary rollback triggered by 38% synthetic probe failure.",
        "fault_url": None
    },
    "8": {
        "key": "kafka_lag",
        "title": "Kafka Consumer Group Lag Spill (>18,000 msgs)",
        "severity": "SEV-3",
        "desc": "Simulates uncommitted offsets on notification-workers consumer group.",
        "fault_url": f"{NOTIFICATION_SERVICE_URL}/api/v1/notifications/fault/kafka-lag"
    }
}

COLORS = {
    "HEADER": "\033[95m",
    "BLUE": "\033[94m",
    "CYAN": "\033[96m",
    "GREEN": "\033[92m",
    "WARNING": "\033[93m",
    "FAIL": "\033[91m",
    "BOLD": "\033[1m",
    "RESET": "\033[0m"
}

def log(msg, color="RESET"):
    print(f"{COLORS.get(color, '')}{msg}{COLORS['RESET']}")

def post_json(url, payload=None, timeout=5.0):
    data = json.dumps(payload or {}).encode('utf-8')
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.status, json.loads(res.read().decode('utf-8'))

def trigger_scenario(scenario_key):
    # Find matching scenario
    sc = None
    for k, v in SCENARIOS.items():
        if k == str(scenario_key) or v["key"] == str(scenario_key):
            sc = v
            break

    if not sc:
        log(f"Error: Unknown scenario '{scenario_key}'", "FAIL")
        log("Available scenarios:", "WARNING")
        for k, v in SCENARIOS.items():
            log(f"  [{k}] {v['key']} - {v['title']} ({v['severity']})")
        return False

    log("\n" + "=" * 70, "CYAN")
    log(f"🚨 TRIGGERING INCIDENT SCENARIO: {sc['title']}", "BOLD")
    log(f"   Severity: {sc['severity']}", "WARNING")
    log(f"   Description: {sc['desc']}", "CYAN")
    log("=" * 70, "CYAN")

    # 1. Trigger microservice fault if reachable
    if sc["fault_url"]:
        log(f"[*] Injecting fault into microservice: {sc['fault_url']}...", "BLUE")
        try:
            status, res_json = post_json(sc["fault_url"], timeout=3.0)
            if status == 200:
                log(f"[✓] Microservice fault acknowledged: {res_json.get('message', 'OK')}", "GREEN")
            else:
                log(f"[!] Microservice responded with status {status}", "WARNING")
        except Exception as e:
            log(f"[-] Microservice not running or unreachable: {e} (proceeding to backend simulation)", "WARNING")

    # 2. Trigger backend alert & detection engine
    log(f"[*] Posting simulated alert to backend detection engine...", "BLUE")
    try:
        status, res_json = post_json(f"{BACKEND_URL}/alerts/simulate?scenario={sc['key']}", timeout=5.0)
        if status == 200:
            data = res_json.get("data", {})
            log("\n✅ INCIDENT SUCCESSFULLY CREATED AND CORRELATED BY ENGINE!", "GREEN")
            log(f"   Incident ID:     {data.get('incidentId')}", "BOLD")
            log(f"   Incident Number: {data.get('incidentNumber')}", "BOLD")
            log(f"   Alert Title:     {data.get('alertTitle')}", "CYAN")
            log(f"   Severity:        {data.get('severity')}", "WARNING")
            log(f"   Status:          {data.get('status')}", "CYAN")
            log(f"   Triggered At:    {data.get('timestamp')}", "BLUE")
            log("\n💡 View real-time investigation DAG and RCA in the UI console:", "HEADER")
            log(f"   http://localhost:5173/incidents/{data.get('incidentId')}\n")
            return True
        else:
            log(f"[-] Backend returned status {status}: {res_json}", "FAIL")
            return False
    except urllib.error.URLError as e:
        log(f"[-] Backend is not running on localhost:8080 ({e}).", "FAIL")
        log("    To run backend: cd backend && mvn spring-boot:run", "WARNING")
        return False
    except Exception as e:
        log(f"[-] Simulation failed: {e}", "FAIL")
        return False

def reset_all_faults():
    log("\n[🔄] Resetting all microservice faults to healthy baselines...", "CYAN")
    try:
        post_json(f"{PAYMENT_SERVICE_URL}/api/v1/payments/fault/reset", timeout=2.0)
        log("[✓] Payment service reset to healthy", "GREEN")
    except Exception:
        pass
    try:
        post_json(f"{NOTIFICATION_SERVICE_URL}/api/v1/notifications/fault/reset", timeout=2.0)
        log("[✓] Notification service reset to healthy", "GREEN")
    except Exception:
        pass
    log("All faults cleared.", "GREEN")

def main():
    parser = argparse.ArgumentParser(description="AI DevOps Incident Management Simulator")
    parser.add_argument("--scenario", "-s", help="Scenario number (1-8) or key (e.g. http_500, db_exhaustion)")
    parser.add_argument("--all", "-a", action="store_true", help="Trigger all 8 scenarios sequentially")
    parser.add_argument("--reset", "-r", action="store_true", help="Reset all microservice faults")
    parser.add_argument("--list", "-l", action="store_true", help="List all available scenarios")

    args = parser.parse_args()

    if args.list or len(sys.argv) == 1:
        log("\n📋 AVAILABLE INCIDENT SIMULATION SCENARIOS:\n", "BOLD")
        for k, v in SCENARIOS.items():
            log(f"  [{k}] {v['severity']:<5} | {v['key']:<18} | {v['title']}")
        log("\nRun with: python scripts/simulate_incidents.py --scenario <id>\n")
        return

    if args.reset:
        reset_all_faults()
        return

    if args.all:
        for k in SCENARIOS:
            trigger_scenario(k)
            time.sleep(1)
        return

    if args.scenario:
        trigger_scenario(args.scenario)

if __name__ == "__main__":
    main()
