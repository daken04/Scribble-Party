import express from "express";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import http from "http";
import env from "dotenv";
import bcrypt from "bcrypt";

env.config();

const PORT = 5000;
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
    user: "postgres",
    host: "db",
    database: "watchparty",
    password: "password",
    port: 5432,
});

const initializeTables = async () => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS parties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        admin_id INTEGER REFERENCES users(id),
        party_code VARCHAR(7) NOT NULL
      );
      CREATE TABLE IF NOT EXISTS party_users (
        id SERIAL PRIMARY KEY,
        party_id INTEGER REFERENCES parties(id),
        user_id INTEGER REFERENCES users(id)
      );
    `);
  };

db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));

app.use(bodyParser.json());
app.use(cors());

function generatePartyCode() {
  return Math.random().toString(36).substring(2, 9).toUpperCase();
}

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        const result = await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *",
            [username, hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
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

app.post('/create-party', async (req, res) => {
    const { name, adminId } = req.body;
    const partyCode = generatePartyCode();

    try {
        const result = await db.query(
            "INSERT INTO parties (name, admin_id, party_code) VALUES ($1, $2, $3) RETURNING *",
            [name, adminId, partyCode]
        );

        const partyId = result.rows[0].id;

        // Add the creator to the party_users table
        await db.query(
          "INSERT INTO party_users (party_id, user_id) VALUES ($1, $2)",
          [partyId, adminId]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/join-party', async (req, res) => {
    const { partyCode, userId } = req.body;
    try {
        const partyResult = await db.query(
            'SELECT * FROM parties WHERE party_code = $1',
            [partyCode]
        );

        if (partyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Party not found' });
        }

        const partyId = partyResult.rows[0].id;
        const result = await db.query(
            'INSERT INTO party_users (party_id, user_id) VALUES ($1, $2) RETURNING *',
            [partyId, userId]
        );

        const membersResult = await db.query(
            'SELECT users.id, users.username FROM users INNER JOIN party_users ON users.id = party_users.user_id WHERE party_users.party_id = $1',
            [partyId]
        );

        const members = membersResult.rows;
        io.to(partyCode).emit('membersUpdate', members);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/leave-party', async (req, res) => {
    const { partyCode, userId } = req.body;
    try {
        const partyResult = await db.query('SELECT * FROM parties WHERE party_code = $1 AND admin_id = $2', [partyCode, userId]);

        if (partyResult.rows.length > 0) {
            await db.query('DELETE FROM party_users WHERE party_id = $1', [partyResult.rows[0].id]);
            await db.query('DELETE FROM parties WHERE party_code = $1', [partyCode]);
            //console.log("'Party deleted successfully'");
            io.to(partyCode).emit('partyDeleted');
            return res.status(200).json({ message: 'Party deleted successfully' });
        } else {
            await db.query('DELETE FROM party_users WHERE party_id = (SELECT id FROM parties WHERE party_code = $1) AND user_id = $2', [partyCode, userId]);
            const membersResult = await db.query(
                'SELECT users.id, users.username FROM users INNER JOIN party_users ON users.id = party_users.user_id WHERE party_users.party_id = (SELECT id FROM parties WHERE party_code = $1)',
                [partyCode]
            );

            const members = membersResult.rows;
            io.to(partyCode).emit('membersUpdate', members);
            return res.status(200).json({ message: 'Left the party successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/party-members/:partyCode', async (req, res) => {
    const { partyCode } = req.params;
    try {
        const partyResult = await db.query('SELECT * FROM parties WHERE party_code = $1', [partyCode]);

        if (partyResult.rows.length === 0) {
            return res.status(404).json({ message: 'Party not found' });
        }

        const partyId = partyResult.rows[0].id;
        const membersResult = await db.query('SELECT users.id, users.username FROM party_users JOIN users ON party_users.user_id = users.id WHERE party_id = $1', [partyId]);

        const partyDetails = {
            ...partyResult.rows[0],
            members: membersResult.rows
        };

        res.status(200).json(partyDetails);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Socket.IO event handling
io.on('connection', (socket) => {
    //console.log('New client connected');

    socket.on('join', (data) => {
        //console.log(`User ${data.userId} joined party ${data.partyCode}`);
        socket.join(data.partyCode);
        io.to(data.partyCode).emit('userJoined', data);
    });

    socket.on('chat', (data) => {
        //console.log(`Message from ${data.userId} in party ${data.partyCode}: ${data.message}`);
        io.to(data.partyCode).emit('chat', data);
    });

    socket.on('leave', (data) => {
        //console.log(`User ${data.userId} left party ${data.partyCode}`);
        socket.leave(data.partyCode);
    });

    socket.on('disconnect', () => {
        //console.log('Client disconnected');
    });

    socket.on('drawingData', (data) => {
        //console.log('Broadcasting drawing data:', data);
        socket.to(data.partyCode).emit('drawingData', data);
    });

    socket.on('clearDrawing', (partyCode) => {
        socket.to(partyCode).emit('clearDrawing');
    });
});

server.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`);
});
