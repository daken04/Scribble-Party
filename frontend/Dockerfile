# Use the official Node.js image with your version.
FROM node:22.2.0

# Set the working directory inside the container.
WORKDIR /app

# Install app dependencies.
COPY package*.json ./

# Install Python 3 and pip
# RUN apt-get update && apt-get install -y python3-pip

RUN npm install

# Copy the rest of the app code.
COPY . .

# Expose the port the app runs on.
EXPOSE 3000

# Run the app.
CMD ["npm", "start"]
