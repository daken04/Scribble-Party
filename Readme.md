# Scribble Party

## Description

Scribble Party is a web application designed to facilitate virtual parties where users can join rooms, chat, and collaboratively draw on a shared canvas. The application is built using React for the frontend, Node.js for the backend, PostgreSQL as the database, and utilizes Socket.IO for real-time communication.

## Technologies Used
- **Backend**: Node.js, Express, PostgreSQL, Socket.io
- **Frontend**: React, Tailwind CSS, Socket.io-client
- **Containerization**: Docker

## Features
- Real-time collaborative drawing
- Real-time chat functionality
- User authentication
- Party management (create, join, leave, delete)
- Responsive design with Tailwind CSS

## Prerequisites

- Docker (if running using Docker)
- Node.js and npm
- PostgreSQL

## Running the Project

### With Docker

1. **Ensure Docker is installed** on your machine.
2. **Clone the repository** and navigate to the project directory.
3. **Create a `.env` file** in the backend directory and add your PostgreSQL credentials:
    ```env
    POSTGRES_USER=your_postgres_user
    POSTGRES_PASSWORD=your_postgres_password
    POSTGRES_DB=your_postgres_db
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
    ```
4. **Run Docker Compose** to build and start the containers:
    ```sh
    docker-compose up --build
    ```

This command will start the backend, frontend, and PostgreSQL database in Docker containers.

### Running Locally

#### Backend

1. **Ensure PostgreSQL is installed** and running on your machine.
2. **Create a `.env` file** in the backend directory and add your PostgreSQL credentials:
    ```env
    POSTGRES_USER=your_postgres_user
    POSTGRES_PASSWORD=your_postgres_password
    POSTGRES_DB=your_postgres_db
    POSTGRES_HOST=localhost
    POSTGRES_PORT=5432
    ```
3. **Navigate to the backend directory** and install dependencies:
    ```sh
    cd backend
    npm install
    ```
4. **Start the backend server**:
    ```sh
    nodemon index.js
    ```

#### Frontend

1. **Navigate to the frontend directory** and install dependencies:
    ```sh
    cd frontend
    npm install
    ```
2. **Start the frontend server**:
    ```sh
    npm start
    ```

You should now be able to access the application at `http://localhost:3000`.
