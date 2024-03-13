import 'dotenv/config'
import {NextFunction, Request, Response} from 'express'
import express from 'express';
import cors from 'cors';
import {AnyZodObject, z} from "zod";
import {createSubscription} from "./repository/SubscriptionRepositoryService";
import {sendPushNotification} from "./service/PushNotificationService";
import {authMiddleware} from "./middleware/AuthMiddleware";

const app = express()
app.use(cors())
app.use(express.json())
const port = 3001

app.get('/_health', (req: Request, res: Response) => {
    res.send(JSON.stringify({status: 'UP'}))
})

/**
 * Return VAPID public key
 */
app.get('/key', (req: Request, res: Response) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
        return res.status(500).json({message: 'Internal server error'});
    }

    return res.json({publicKey});
})

const subscriptionSchema = z.object({
    body: z.object({
        email: z.string().email(),
        endpoint: z.string().url(),
        keys: z.object({
            p256dh: z.string(),
            auth: z.string(),
        }),
        expirationTime: z.string().nullish().optional(),
    })
})

const pushNotificationSchema = z.object({
    body: z.object({
        senderEmail: z.string().email(),
        title: z.string(),
        body: z.string(),
        icon: z.string().optional(),
    })
})

const validate = (schema: AnyZodObject) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            return next();
        } catch (error) {
            return res.status(400).json(error);
        }
    };

/**
 * New subscription
 */
app.post('/subscribe', validate(subscriptionSchema), async (req: Request, res: Response) => {
    try {
        await createSubscription(req.body.email, req.body.endpoint, req.body.keys.auth, req.body.keys.p256dh);
        return res.status(201).json({message: 'Subscription created'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Internal server error'});
    }
})

/**
 * Push notification
 */
app.post('/push', authMiddleware, validate(pushNotificationSchema), async (req: Request, res: Response) => {
    try {
        await sendPushNotification(req.body.senderEmail, req.body.title, req.body.body, req.body.icon);
        return res.status(201).json({message: 'Push notification sent'});
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: 'Internal server error'});
    }
})


const start = (): void => {
    try {
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
start();
