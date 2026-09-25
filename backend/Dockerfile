# Use an official Node.js runtime as the base image
FROM node:26-alpine
# Set the working directory in the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Install dependencies without dev dependencies
RUN npm ci --omit=dev
# Copy the rest of the application code
COPY . .
# Set the environment variable for the frontend origin
EXPOSE 3000
# Start the server using the index.js file
CMD ["node", "index.js"] 
