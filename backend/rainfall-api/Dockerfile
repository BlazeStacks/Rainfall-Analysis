# Build the Spring Boot application with Java 21 and Maven.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

# Run the packaged application on a small Java 21 runtime image.
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/target/rainfall-api-1.0.0.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
