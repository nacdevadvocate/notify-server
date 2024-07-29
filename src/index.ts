import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from 'morgan';
import cors from "cors"
import os from "os"
import axios from "axios";
import { sendToSlack, SlackParams } from "./helpers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
const webhookURL = process.env.SLACK_WEBHOOK_URL || "";


app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", (req: Request, res: Response) => {
    const message = `API is working as expected - API gateway: ${os.hostname()}`
    console.log(message)
    res.status(200).json({ message });
});



app.post('/notifications', async (req: Request, res: Response) => {
    try {
        // Handling the notification payload asynchronously (simulated async operation)
        console.log("show the device");
        console.log(req.body?.event?.eventDetail?.device);

        if (req.body?.event?.eventDetail?.deviceStatus === "REACHABLE") {
            console.log("Device is available");
            console.log(req.body?.event?.eventDetail?.device);

        } else if (req.body?.event?.eventDetail?.deviceStatus === "UNREACHABLE") {
            console.log("Device is not available");
            console.log(req.body?.event?.eventDetail?.device);
        }

        // Sending a response
        res.status(200).json({ message: 'Notification handled successfully' });
    } catch (error) {
        console.error('Error handling notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/notifications-auth', async (req: Request, res: Response) => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key missing' });
        }

        console.log(apiKey);
        const authToken = apiKey.split(' ')[0];

        // Checking if the Bearer Token matches the provided token
        if (authToken !== 'nacauth') {
            return res.status(401).json({ error: 'Invalid Bearer Token' });
        }

        // Handling the notification payload asynchronously (simulated async operation)
        console.log("show the device");
        console.log(req.body?.event?.eventDetail?.device);

        if (req.body?.event?.eventDetail?.deviceStatus === "REACHABLE") {
            console.log("Device is available");
            console.log(req.body?.event?.eventDetail?.device);

        } else if (req.body?.event?.eventDetail?.deviceStatus === "UNREACHABLE") {
            console.log("Device is not available");
            console.log(req.body?.event?.eventDetail?.device);
        }

        // Sending a response
        res.status(200).json({ message: 'Notification handled successfully' });
    } catch (error) {
        console.error('Error handling notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/notifications-slack', async (req: Request, res: Response) => {
    try {
        console.log(req.body)



        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return res.status(400).json({ error: 'API key missing' });
        }

        console.log(apiKey);
        const authToken = apiKey.split(' ')[0];

        // Checking if the Bearer Token matches the provided token
        if (authToken !== 'nacauth') {
            return res.status(401).json({ error: 'Invalid Bearer Token' });
        }
        const data: SlackParams = {
            id: req.body.id,
            source: req.body.source,
            type: req.body.type,
            device: req.body.data.device.networkAccessIdentifier
                ? req.body.data.device.networkAccessIdentifier
                : req.body.data.device.phoneNumber,
            deviceStatus: req.body.event.eventDetail.deviceStatus,
            eventType: req.body.event.eventType,
            eventTime: req.body.event.eventTime
        };


        const response = await axios.post(webhookURL, {
            attachments: sendToSlack(data)
        });

        console.log('Message sent successfully to Slack:', response.data);


        // Handling the notification payload asynchronously (simulated async operation)
        console.log("show the device");
        console.log(req.body?.event?.eventDetail?.device);

        if (req.body?.event?.eventDetail?.deviceStatus === "REACHABLE") {
            console.log("Device is available");
            console.log(req.body?.event?.eventDetail?.device);

        } else if (req.body?.event?.eventDetail?.deviceStatus === "UNREACHABLE") {
            console.log("Device is not available");
            console.log(req.body?.event?.eventDetail?.device);
        }

        // Sending a response
        res.status(200).json({ message: 'Notification handled successfully' });
    } catch (error) {
        console.error('Error handling notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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