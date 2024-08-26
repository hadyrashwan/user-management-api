# User Management API

## Overview

The User Management API is a NestJS-based service designed for managing user avatars. It provides functionalities to interact with user avatars, including saving, retrieving, and deleting avatars, and fetching user details from an external API.

## Features

- **Get Avatar from Database:** Retrieve the user's avatar from MongoDB and return it in base64 format.
- **Save Avatar to Database:** Download an avatar image from a provided URL, save it to the filesystem, and store metadata in MongoDB.
- **Delete Avatar:** Remove the avatar image from the filesystem and delete its metadata from MongoDB.
- **Fetch User by ID:** Obtain user details from an external API.

## Installation

### Prerequisites

- Node.js (>=14.x.x)
- MongoDB (>=4.x.x)

### Setup

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/your-repository.git
   cd your-repository
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Configuration:**

   Create a `.env` file in the root directory of the project with the following content:

   ```env
   MONGO_URI=mongodb+srv://<user>:<db_password>@<cluster>.<account>.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   RABBITMQ_URI=amqp://id.cloudamqp:5672 amqps://<user>:<db_password>@<cluster>.<account>.cloudamqp.com/<user>
   SFTP_EMAIL=something@ethereal.email
   SFTP_PASSWORD=your-ethereal-password
   SFTP_HOST=smtp.ethereal.email
   SFTP_PORT=587
   ```

4. **Run the Application:**

   ```bash
   npm run start
   ```

5. **Run Tests:**

   To ensure everything is working correctly, run the tests:

   ```bash
   npm test
   ```
## Deployment

### Docker

To deploy the application using Docker, create a Docker image and run the container using the included Dockerfile.

### Cloud Deployment

You can deploy the application using various cloud services:

#### Google Cloud Run

Google Cloud Run allows you to deploy and manage containerized applications. Follow the [Google Cloud Run documentation](https://cloud.google.com/run/docs) for details on deployment.

#### AWS Lambda

If you prefer to avoid using containers, you can deploy the application on AWS Lambda. Utilize AWS SAM or the Serverless Framework (SLS) for this purpose. For guidance on deploying with AWS Lambda, refer to the [AWS SAM documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/) or the [Serverless Framework documentation](https://www.serverless.com/framework/docs/).

## Documentation

API documentation is available in the `open-api.json` file located in the root directory of the project. This file describes the API endpoints, request and response formats, and other details.

## Contact

For any questions or feedback, please contact [h2rashwan@gmail.com](mailto:h2rashwan@gmail.com).

