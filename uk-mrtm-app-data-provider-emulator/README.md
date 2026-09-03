# Maritime Data Provider Emulator

**This application is intended for testing and development purposes only. It should NOT be used in production environments.**

This emulator contains operations that are only suitable for controlled test environments.

# Overview
This is a Spring Boot emulator for end-to-end testing of Private Key JWTClient Authentication flow with Keycloak.
This emulator exposes the following HTTP endpoints used by tests and other services:

- GET /data-emulator/health — Spring Boot Actuator health check (no auth). Used by DevOps to verify the application is up and running.
- GET /data-emulator/jwks — returns the public JWK Set (JWKS) containing the public keys used to verify JWTs issued by this emulator.
- GET /data-emulator/retrieve-access-token/{client-id} — generates and signs a client-assertion JWT for the given client id, posts it to the configured Keycloak token endpoint and returns Keycloak's token response.
- GET /data-emulator/jwks/{key-pair-no} — returns the public JWK Set (JWKS) for a specific key pair number.
- GET /data-emulator/retrieve-access-token/{key-pair-no}/{client-id} — generates and signs a client-assertion JWT using the specified key pair for the given client id, posts it to the configured Keycloak token endpoint and returns Keycloak's token response.


The following environment variables must be configured for running the application.

- KEYCLOAK_BASE_URL the base url of the Keycloak server
- KEYCLOAK_AUDIENCE_URL the audience url for the client-assertion JWT
- JWK_SET the JWK Set (JWKS) in JSON format containing the private keys used to sign the client-assertion JWTs.
- USERNAME the username for basic authentication to access the /retrieve-access-token/* endpoint.
- PASSWORD the password for basic authentication to access the /retrieve-access-token/* endpoint.



# How to Run the Application Locally Using Docker

This setup is useful for end-to-end testing of the data flow through external APIs in a development environment.
It's especially necessary because Keycloak is also running within Docker's network.

## Step 1: Build the JAR with Maven

Ensure Maven is installed, then run:

```bash
mvn clean package -DskipTests
```

This will generate a JAR file in the `target/` directory.

## Step 2: Build the Docker Image

Build the Docker image using:

```bash
docker build --no-cache -t uk-mrtm-app-data-provider-emulator .
```

## Step 3: Start the Container Using `uk-netz-env-development` Docker Compose

Add the following service definition to your `uk-netz-env-development` `docker-compose.yml` file:

```yaml
uk-mrtm-app-data-provider-emulator:
  image: uk-mrtm-app-data-provider-emulator:latest
  container_name: uk-mrtm-app-data-provider-emulator
  ports:
    - "9109:9109"
```

Then, from the folder containing `docker-compose.yml`, start the container with:

```bash
docker-compose up -d uk-mrtm-app-data-provider-emulator
```
## Step 4: Setup a data provider in keycloak using as JWKS URL: http://uk-mrtm-app-data-provider-emulator:9109/data-emulator/jwks

## Step 5: Send an HTTP GET request to http://localhost:9109/data-emulator/retrieve-access-token/{key-pair-no}/{clientID}
using basic authentication with username and password configured in application.properties file. Replace {key-pair-no} with the key pair number (e.g., 0, 1, 2) and {clientID} with your client ID.
