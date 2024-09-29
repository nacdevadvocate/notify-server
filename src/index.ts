import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from 'morgan';
import cors from "cors"
import os from "os"
import axios from "axios";
import WebSocket, { WebSocketServer } from 'ws';
import { parse } from 'url';
import { sendToSlack, SlackParams } from "./helpers";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;
const webhookURL = process.env.SLACK_WEBHOOK_URL || "";


app.use(cors());
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

const wss = new WebSocketServer({ noServer: true });
const clients = new Map<string, WebSocket>(); // Map to store connected clients and their IDs

server.on('upgrade', (request, socket, head) => {
    const pathname = parse(request.url!).pathname;

    if (pathname) {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request, pathname);
        });
    } else {
        socket.destroy();
    }
});

wss.on('connection', (ws: WebSocket, request: Request, pathname: string) => {
    const userId = pathname.split('/').pop();
    if (userId) {
        clients.set(userId, ws);

        console.log(`Client connected: ${userId}`);
        ws.send(JSON.stringify({ type: 'USER_ID', userId })); // Send user ID to the client

        ws.on('message', (message: string) => {
            console.log(`Received message from ${userId}: ${message}`);
            // Broadcast the message to all clients
            clients.forEach((client, id) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            console.log(`Client disconnected: ${userId}`);
            clients.delete(userId);
        });
    }
});





// Endpoint for testing
app.get("/", (req: Request, res: Response) => {
    // const message = `API is working as expected - API gateway: ${os.hostname()}`
    const message = `Unauthorized`
    console.log(message)
    res.status(200).json({ message });
});


// Endpoint to get the count of connected users
app.get('/connected-users-count', (req: Request, res: Response) => {
    res.json({ count: clients.size });
});

// Endpoint to get the list of connected user IDs 
app.get('/connected-user-ids', (req: Request, res: Response) => {
    const userIds = Array.from(clients.keys());
    res.json({ userIds });
});



app.post('/notifications/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const client = clients.get(userId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(req.body)); // Send the JSON object as a string
            res.status(200).json({ message: 'Notification sent successfully' });
        } else {
            res.status(404).json({ message: 'User not connected' });
        }

        console.log("show the device");
        console.log(req.body);

    } catch (error) {
        console.error('Error handling notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/notifications', async (req: Request, res: Response) => {
    try {
        console.log("show the device");
        console.log(req.body);

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
        console.log(req.body);

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
        console.log(req.body);

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


