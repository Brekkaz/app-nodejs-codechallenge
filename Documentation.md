# Yape Code Challenge 🚀

Welcome to my solution for the Yape Code Challenge! This README provides an overview of the implementation and instructions on how to get started.


## Tech Stack
The following technologies were used to implement this solution:

- **NestJS:** A progressive Node.js framework
- **Hexagonal Architecture:** For a maintainable and scalable application structure
- **GraphQL:** To enable flexible data queries
- **Dataloader:** For efficient and optimized data loading
- **Unit Tests:** Ensuring code reliability
- **Seeders:** For populating the database with initial data
- **Protobuf:** For defining message formats
- **Mongoose:** An elegant MongoDB object modeling tool
- **Redis:** For caching and message brokering
- **Health Checker:** For monitoring the application's health
- **Linting**: Ensuring code quality and consistency


## Implementation Overview
The implementation of the solution follows a well-structured flow:

1. **Creating a Transaction via GraphQL API:** Transactions are created through a GraphQL API, which ensures flexible and efficient data querying and mutation.
2. **Saving the Transaction in the Database and Producing it via Kafka:** Once a transaction is created, it is saved in the database. Simultaneously, a message about the transaction is produced and sent to Kafka for further processing.
3. **Consuming and Validating the Transaction:** The same service or another microservice consumes the Kafka message and validates the transaction according to the predefined rules (e.g., rejecting transactions with values greater than 1000).
4. **Updating the Transaction Status in the Database:** After validation, the transaction status is updated in the database.

This approach was designed to implement Kafka consumers and producers, projecting the segmentation of responsibilities. 
The events include the `value` field, which might seem unnecessary at first glance, but is essential for implementing CQRS (Command Query Responsibility Segregation). In a more complex scenario, the microservice responsible for validation would not necessarily update the database directly but might delegate this task to another service.


## Getting Started

### Prerequisites
Ensure you have the following installed:

- Node.js
- Docker (for containerized development environment)


### Installation
1. **Clone the Repository**
    ```bash
    git clone git@github.com:Brekkaz/app-nodejs-codechallenge.git
    cd app-nodejs-codechallenge
    ```

2. **Install the dependencies**  
    ```bash
    npm install 
    ```

3. **Setup Environment Variables**  
    Create a `.env` file in the root directory and add the necessary environment variables. Refer to `.env.example` for guidance.

4. **Run Docker Containers**  
    ```bash
    docker-compose up
    ```

### Running the Application
1. **Start the Server**
    ```bash
    npm run start:dev 
    ```

2. **Seed the Database**  
The database seeders are executed automatically when the application starts. These seeders are idempotent, meaning they can be run multiple times without causing duplicate entries or inconsistencies in the database.

## Usage

### Playground
Navigate to `http://localhost:3000/graphql` where you can find the application's playground.

### Health Check
Send a GET request to `http://localhost:3000` to check the application's health status. This will provide information on the current state of the application and its dependencies.

## Database Choice Explanation

### Redis
Redis was chosen as the primary database for transaction processing due to its key-value store architecture and ability to handle high concurrency. This makes it particularly well-suited for scenarios where rapid reads and writes are necessary, and where transaction retrieval is predominantly based on unique keys.

### Alternative Database for Complex Queries
If the requirements included more complex queries beyond simple key-value retrievals, a clustered database architecture such as ScyllaDB, CockroachDB, or MongoDB would be considered. These databases provide robust query capabilities and are designed to handle distributed data with high availability and scalability.

### MongoDB Usage
For this challenge, MongoDB was used to store the transaction type entity. MongoDB's document-oriented model is flexible and allows for efficient storage and retrieval of transaction-related metadata.

## Global Enum for Transaction Statuses
A global enum was declared to store the three transaction statuses (`pending`, `approved`, `rejected`). This approach saves database queries and provides a consistent data source for transaction status references throughout the application.

### Benefits of Using a Global Enum:
- **Reduced Database Queries:** Eliminates the need to query the database for transaction statuses, improving performance.
- **Consistency:** Ensures that the transaction statuses are uniformly referenced across the application.
- **Simplicity:** Simplifies the codebase by providing a single source of truth for transaction statuses.

The global enum serves as the data source for the transaction status repository, ensuring efficient and consistent status handling.

## Hexagonal Architecture
Hexagonal Architecture, also known as Ports and Adapters, was employed to create a maintainable and scalable application. This architecture separates the core logic of the application from external services and infrastructure.

### Key Benefits:
- **Isolation of Business Logic:** Core application logic is decoupled from external dependencies, making it easier to manage and test.
- **Flexibility:** Allows for easy integration with different frameworks, databases, and other external services by changing the adapters.
- **Testability:** Core logic can be tested independently from external services, ensuring thorough unit testing.

### Structure
- **Application**: Contains business logic and use cases.
- **Domain**: Contains domain entities and business rules.
- **Infrastructure**: Adapts external frameworks and libraries to the application layer.


## Unit Testing
Unit tests were implemented to ensure the reliability and correctness of the code. These tests focus on individual components of the application, verifying that each part functions as expected in isolation.  
To run the unit tests, use the following command:

    npm run test

or with coverage

    npm run test:cov


## Linting
Linting tools were used to maintain code quality and consistency throughout the project. ESLint was configured to enforce coding standards and best practices.

To run the linter, use the following command:

    npm run lint


## Contributors
- Breyner Mola \<breyner.mola.9@gmail.com\>


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
