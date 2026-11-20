from fastapi import FastAPI, Response
from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST
from pydantic import BaseModel
import uvicorn
import time

app = FastAPI(title="Notification Service", version="1.0.0")

NOTIFICATIONS_SENT = Counter('notification_service_sent_total', 'Total Notifications Sent', ['channel'])
KAFKA_CONSUMER_LAG = Gauge('kafka_consumergroup_lag', 'Notification worker Kafka lag', ['topic', 'consumergroup'])

KAFKA_CONSUMER_LAG.labels(topic="order-events", consumergroup="notification-workers").set(0)

class NotificationRequest(BaseModel):
    recipient: str
    message: str
    channel: str = "EMAIL"

@app.get("/health")
def health():
    return {"status": "UP", "service": "notification-service", "timestamp": time.time()}

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.post("/api/v1/notifications/send")
def send_notification(req: NotificationRequest):
    NOTIFICATIONS_SENT.labels(req.channel).inc()
    return {
        "status": "QUEUED",
        "notification_id": f"notif_{int(time.time() * 1000)}",
        "recipient": req.recipient,
        "timestamp": time.time()
    }

@app.post("/api/v1/notifications/fault/kafka-lag")
def simulate_kafka_lag(lag: int = 18500):
    KAFKA_CONSUMER_LAG.labels(topic="order-events", consumergroup="notification-workers").set(lag)
    return {"message": f"Kafka consumer lag set to {lag} records for topic order-events"}

@app.post("/api/v1/notifications/fault/reset")
def reset_lag():
    KAFKA_CONSUMER_LAG.labels(topic="order-events", consumergroup="notification-workers").set(0)
    return {"message": "Kafka consumer lag reset to 0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8084)
