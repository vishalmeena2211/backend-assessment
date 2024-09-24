import express, { Request, Response } from 'express';
import routes from './routes/route';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Middleware to enable CORS with specific options
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Use the routes defined in the routes module
app.use(routes);

// Define a simple route to test the server
app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});

// Start the server and listen on the specified port
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});