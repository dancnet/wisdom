import express from 'express';
import path from 'node:path';
import api from './api.js';
import "dotenv/config";

const app = express();
const HOST = process.env.HOST || "localhost";
const PORT = Number(process.env.PORT ?? 3000);

const __dirname = import.meta.dirname;

app.use(express.json());

// API
app.use('/api', api);

// React production build
app.use(express.static(path.join(__dirname, 'client/dist')));

app.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});