# Etapa 1: Compilar con Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests && cp target/consentido-0.0.1-SNAPSHOT.jar target/consentido.jar

# Etapa 2: Imagen final
FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY --from=build /app/target/consentido.jar consentido.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/consentido.jar"]
