import express from "express";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import http from "http";
import env from "dotenv";

env.config();

const PORT = process.env.PORT;
const saltRounds = 10;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
});


const db = new pg.Client({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB ,
    password: process.env.POSTGRES_PASS,
    port: process.env.POSTGRES_PORT,
});

app.use(bodyParser.json());
app.use(cors());

app.post('/register',)


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


