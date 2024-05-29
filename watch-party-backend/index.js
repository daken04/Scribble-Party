import express from "express";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import http from "http";
import env from "dotenv";
import bcrypt from "bcrypt";

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

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

app.use(bodyParser.json());
app.use(cors());

app.post('/register', async (req,res)=>{
    const {username , password } =  req.body;
    try{
        const hash = await bcrypt.hash(password, saltRounds);
        const result = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, hash]
            );
        res.status(201).json(result.rows[0]);
    } catch (error){
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const result = await db.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
  
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const user = result.rows[0];
  
      const match = await bcrypt.compare(password, user.password);
  
      if (match) {
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(400).json({ message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


