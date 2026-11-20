# Multi-stage Dockerfile for Spring Boot 4 / Java 25 Monolith
FROM eclipse-temurin:25-jdk-alpine AS builder
WORKDIR /workspace/app

# Cache dependencies
COPY pom.xml .
COPY src src

# Package application (skip tests in container image build)
RUN apk add --no-cache maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:25-jre-alpine
VOLUME /tmp
WORKDIR /app

RUN addgroup -S devops && adduser -S devops -G devops
USER devops:devops

COPY --from=builder /workspace/app/target/*.jar app.jar

ENV JAVA_OPTS="-XX:+UseZGC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
