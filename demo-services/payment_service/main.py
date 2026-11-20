from fastapi import FastAPI, HTTPException, Response
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from pydantic import BaseModel
import httpx
import uvicorn
import os
import sys
import time
import threading

app = FastAPI(title="Payment Service (Fault Tolerant & Injectable)", version="4.0.2")

NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://localhost:8084")

# Prometheus Metrics
PAYMENT_REQUESTS = Counter('payment_service_requests_total', 'Total Payment Requests', ['status'])
PAYMENT_LATENCY = Histogram('payment_service_latency_seconds', 'Payment processing latency')
ACTIVE_DB_CONNECTIONS = Gauge('hikaricp_active_connections', 'Active database connections in Hikari pool')
MEMORY_BYTES_ALLOCATED = Gauge('container_memory_bytes_allocated', 'Allocated memory simulation')

# Dynamic Fault State
FAULTS = {
    "http500": False,
    "latency_ms": 0,
    "db_exhausted": False,
    "cpu_spike": False,
    "oom_chunks": []
}

ACTIVE_DB_CONNECTIONS.set(4)

class PaymentRequest(BaseModel):
    order_id: str
    amount: float
    currency: str = "USD"

@app.get("/health")
def health():
    if FAULTS["db_exhausted"]:
        raise HTTPException(status_code=500, detail="Database connection pool exhausted. HikariPool-1 timeout.")
    return {"status": "UP", "version": "4.0.2", "faults_active": {k: bool(v) for k, v in FAULTS.items()}}

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/payments/process")
async def process_payment(req: PaymentRequest):
    start = time.time()

    # Fault 1: Latency injection
    if FAULTS["latency_ms"] > 0:
        time.sleep(FAULTS["latency_ms"] / 1000.0)

    # Fault 2: Database exhaustion
    if FAULTS["db_exhausted"]:
        ACTIVE_DB_CONNECTIONS.set(20)
        PAYMENT_REQUESTS.labels("500").inc()
        raise HTTPException(status_code=500, detail="HikariPool-1: Connection acquisition timed out after 30000ms")

    # Fault 3: HTTP 500 error spike
    if FAULTS["http500"]:
        PAYMENT_REQUESTS.labels("500").inc()
        raise HTTPException(status_code=500, detail="Internal Server Error: NullPointerException in PaymentGatewayAdapter.stripeSync()")

    ACTIVE_DB_CONNECTIONS.set(5)
    PAYMENT_REQUESTS.labels("200").inc()
    duration = time.time() - start
    PAYMENT_LATENCY.observe(duration)

    # Notify asynchronously
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            await client.post(f"{NOTIFICATION_SERVICE_URL}/api/v1/notifications/send", json={
                "recipient": "customer@example.com",
                "message": f"Payment of {req.amount} {req.currency} processed successfully for {req.order_id}"
            })
    except Exception:
        pass

    return {
        "payment_id": f"pay_{int(time.time() * 1000)}",
        "order_id": req.order_id,
        "amount": req.amount,
        "status": "SUCCESS",
        "gateway": "STRIPE",
        "processed_at": time.time()
    }

# ----------------- FAULT INJECTION ENDPOINTS -----------------

@app.post("/api/v1/payments/fault/http500")
def trigger_http500(enabled: bool = True):
    FAULTS["http500"] = enabled
    return {"message": f"HTTP 500 error spike {'enabled' if enabled else 'disabled'}"}

@app.post("/api/v1/payments/fault/latency")
def trigger_latency(delay_ms: int = 4000):
    FAULTS["latency_ms"] = delay_ms
    return {"message": f"API latency set to {delay_ms}ms"}

@app.post("/api/v1/payments/fault/leak-db")
def trigger_leak_db(enabled: bool = True):
    FAULTS["db_exhausted"] = enabled
    ACTIVE_DB_CONNECTIONS.set(20 if enabled else 4)
    return {"message": f"Database pool exhaustion {'enabled' if enabled else 'disabled'}"}

@app.post("/api/v1/payments/fault/cpu-spike")
def trigger_cpu_spike(duration_sec: int = 15):
    FAULTS["cpu_spike"] = True
    def burn_cpu():
        t_end = time.time() + duration_sec
        while time.time() < t_end:
            _ = [x * x for x in range(10000)]
        FAULTS["cpu_spike"] = False
    for _ in range(4):
        threading.Thread(target=burn_cpu, daemon=True).start()
    return {"message": f"CPU spike launched across 4 threads for {duration_sec}s"}

@app.post("/api/v1/payments/fault/oom")
def trigger_oom(megabytes: int = 256):
    try:
        chunk = bytearray(megabytes * 1024 * 1024)
        FAULTS["oom_chunks"].append(chunk)
        total = sum(len(c) for c in FAULTS["oom_chunks"])
        MEMORY_BYTES_ALLOCATED.set(total)
        return {"message": f"Allocated {megabytes}MB. Total in memory: {total / (1024*1024)}MB"}
    except MemoryError:
        raise HTTPException(status_code=500, detail="Container Memory Error: OOMKilled simulation triggered")

@app.post("/api/v1/payments/fault/crash")
def trigger_crash():
    def crash_later():
        time.sleep(0.5)
        sys.exit(137)
    threading.Thread(target=crash_later).start()
    return {"message": "Service terminating with exit code 137 (OOMKilled simulation)..."}

@app.post("/api/v1/payments/fault/reset")
def reset_faults():
    FAULTS["http500"] = False
    FAULTS["latency_ms"] = 0
    FAULTS["db_exhausted"] = False
    FAULTS["cpu_spike"] = False
    FAULTS["oom_chunks"].clear()
    ACTIVE_DB_CONNECTIONS.set(4)
    MEMORY_BYTES_ALLOCATED.set(0)
    return {"message": "All faults cleared. Service restored to healthy baseline."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8083)
