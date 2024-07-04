import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from 'morgan';
import cors from "cors"
import os from "os"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(morgan('tiny'));




app.get("/", (req: Request, res: Response) => {
    const message = `API is working as expected - API gateway: ${os.hostname()}`
    console.log(message)
    res.status(200).json({ message });
});


// If API doesn't exsist
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error("requested URL not found.");
    res.status(404);
    next(error);
});


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});