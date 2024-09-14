# Base image
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app
COPY . .

# Build the React app
RUN npm run build



# Expose port 3000
EXPOSE 3000


CMD ["npm", "start"]