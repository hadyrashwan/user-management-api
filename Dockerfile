# You can deploy the application using a service like Google Cloud Run. 
# Alternatively, you can avoid using containers and deploy it on AWS Lambda using AWS SAM or the Serverless Framework (SLS).

# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the port that the application will run on
EXPOSE 3000

# Set environment variables (can be overridden at runtime)
ENV MONGO_URI=mongodb+srv://<user>:<db_password>@<cluster>.<account>.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
ENV RABBITMQ_URI=amqp://localhost:5672
ENV SFTP_EMAIL=something@ethereal.email
ENV SFTP_PASSWORD=your-ethereal-password
ENV SFTP_HOST=smtp.ethereal.email
ENV SFTP_PORT=587

# Command to run the application
CMD ["npm", "run", "start:prod"]
