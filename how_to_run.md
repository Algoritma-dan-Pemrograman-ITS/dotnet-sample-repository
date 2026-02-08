# How to Run Food Delivery Modular Monolith

This guide provides step-by-step instructions to run the Food Delivery Modular Monolith application.

## Prerequisites

Ensure you have the following installed on your machine:

1.  **Docker Desktop**: Required to run the infrastructure services (Postgres, MongoDB, RabbitMQ).
2.  **[.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)**: Required to build and run the API application.

## Steps to Run

### 1. Start Infrastructure Services

The application relies on several external services. We use Docker Compose to spin them up.

1.  Open a terminal (PowerShell, Command Prompt, or Git Bash).
2.  Navigate to the `deployments/docker-compose` directory:
    ```bash
    cd deployments/docker-compose
    ```
3.  Start the containers in detached mode:
    
    First, copy the sample environment file:
    ```bash
    cp .env.sample .env
    ```

    Then start the services:
    ```bash
    docker-compose -f docker-compose.infrastructure.yaml up -d
    ```

    Wait for a few moments for all containers (Postgres, RabbitMQ, MongoDB, etc.) to start and become ready.

### 2. Run the API Application

1.  Open a new terminal window or navigate back to the root of the repository:
    ```bash
    cd ../..
    ```
2.  Run the API project using the .NET CLI:
    ```bash
    dotnet run --project src/Api/FoodDelivery.Api/FoodDelivery.Api.csproj
    ```

    Alternatively, if you are using Visual Studio:
    *   Open `food-delivery-modular-monolith.sln`.
    *   Set `FoodDelivery.Api` as the **Startup Project**.
    *   Press `F5` or click "Start Debugging".

### 3. Access the Application

Once the application is running, you can access it at:

*   **API Root**: [http://localhost:5000](http://localhost:5000) (Returns a welcome message)
*   **Swagger UI**: [http://localhost:5000/swagger](http://localhost:5000/swagger) (Interactive API documentation)

## Troubleshooting

*   **Port Conflicts**: Ensure ports `5432` (Postgres), `27017` (Mongo), `5672` (RabbitMQ), and `5000` (API) are not being used by other applications.
*   **Database Connection Issues**: If the application fails to connect to the database, verify that the Docker containers are running using `docker ps`.
