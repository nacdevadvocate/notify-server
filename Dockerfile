# Use an official Node.js runtime as the base image
FROM node:20

# Set the working directory
WORKDIR /backend

# Copy package.json and package-lock.json to the working directory
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install TypeScript globally
RUN npm install -g typescript

# Compile the TypeScript code to JavaScript
RUN npm run build

# Expose the port (read from .env, default is 8000)
EXPOSE 8000

# Start the app using the compiled JavaScript
CMD ["npm", "run", "start"]