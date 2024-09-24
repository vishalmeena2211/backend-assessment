import express, { Request, Response } from 'express';
import routes from './routes/route';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dovenv from 'dotenv'

dovenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CLIENT_URL,
        credentials: true,
    }
));

app.use(routes);

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, world!');
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});