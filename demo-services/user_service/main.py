from fastapi import FastAPI, HTTPException, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import uvicorn
import time

app = FastAPI(title="User Service", version="1.0.0")

REQUEST_COUNT = Counter('user_service_http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('user_service_http_request_duration_seconds', 'HTTP latency', ['endpoint'])

USERS = {
    "usr_001": {"id": "usr_001", "name": "Alice Johnson", "email": "alice@example.com", "tier": "ENTERPRISE"},
    "usr_002": {"id": "usr_002", "name": "Bob Smith", "email": "bob@example.com", "tier": "PRO"},
    "usr_003": {"id": "usr_003", "name": "Charlie Brown", "email": "charlie@example.com", "tier": "FREE"}
}

@app.get("/health")
def health():
    return {"status": "UP", "service": "user-service", "timestamp": time.time()}

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/api/v1/users/{user_id}")
def get_user(user_id: str):
    start = time.time()
    try:
        if user_id not in USERS:
            REQUEST_COUNT.labels("GET", "/api/v1/users/{id}", "404").inc()
            raise HTTPException(status_code=404, detail="User not found")
        REQUEST_COUNT.labels("GET", "/api/v1/users/{id}", "200").inc()
        return USERS[user_id]
    finally:
        REQUEST_LATENCY.labels("/api/v1/users/{id}").observe(time.time() - start)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8081)
