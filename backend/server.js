import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Load Environment Variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
  res.send('CampusCart API is running...');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});