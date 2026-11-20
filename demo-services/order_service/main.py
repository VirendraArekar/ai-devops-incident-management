from fastapi import FastAPI, HTTPException, Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from pydantic import BaseModel
import httpx
import uvicorn
import os
import time

app = FastAPI(title="Order Service", version="1.0.0")

USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8081")
PAYMENT_SERVICE_URL = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8083")

REQUEST_COUNT = Counter('order_service_http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('order_service_http_request_duration_seconds', 'HTTP latency', ['endpoint'])

class OrderRequest(BaseModel):
    user_id: str
    amount: float
    currency: str = "USD"
    items: list[dict] = []

@app.get("/health")
def health():
    return {"status": "UP", "service": "order-service", "timestamp": time.time()}

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/orders/checkout")
async def checkout(order: OrderRequest):
    start = time.time()
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1. Verify User
        try:
            user_res = await client.get(f"{USER_SERVICE_URL}/api/v1/users/{order.user_id}")
            if user_res.status_code != 200:
                REQUEST_COUNT.labels("POST", "/api/v1/orders/checkout", "400").inc()
                raise HTTPException(status_code=400, detail="Invalid user")
        except httpx.RequestError as exc:
            REQUEST_COUNT.labels("POST", "/api/v1/orders/checkout", "503").inc()
            raise HTTPException(status_code=503, detail=f"User service unreachable: {str(exc)}")

        # 2. Charge Payment
        try:
            pay_res = await client.post(
                f"{PAYMENT_SERVICE_URL}/api/v1/payments/process",
                json={"order_id": f"ord_{int(time.time())}", "amount": order.amount, "currency": order.currency}
            )
            if pay_res.status_code != 200:
                REQUEST_COUNT.labels("POST", "/api/v1/orders/checkout", str(pay_res.status_code)).inc()
                raise HTTPException(status_code=pay_res.status_code, detail=f"Payment processing failed: {pay_res.text}")
        except httpx.RequestError as exc:
            REQUEST_COUNT.labels("POST", "/api/v1/orders/checkout", "504").inc()
            raise HTTPException(status_code=504, detail=f"Payment service timeout/error: {str(exc)}")

    duration = time.time() - start
    REQUEST_LATENCY.labels("/api/v1/orders/checkout").observe(duration)
    REQUEST_COUNT.labels("POST", "/api/v1/orders/checkout", "200").inc()

    return {
        "order_id": f"ord_{int(time.time())}",
        "status": "CONFIRMED",
        "user_id": order.user_id,
        "amount": order.amount,
        "payment": pay_res.json(),
        "processed_at": time.time(),
        "latency_ms": round(duration * 1000, 2)
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8082)
