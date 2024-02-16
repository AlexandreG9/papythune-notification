import {NextFunction, Request, Response} from 'express'
import express from 'express';
import {AnyZodObject, z} from "zod";
import {createSubscription} from "./repository/SubscriptionRepositoryService";

const app = express()
app.use(express.json())
const port = 3001

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!')
})

const subscriptionSchema = z.object({
    body: z.object({
        email: z.string().email(),
        endpoint: z.string().url(),
        authKey: z.string(),
        p256dh: z.string(),
        expirationTime: z.string().optional(),
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
        await createSubscription(req.body.email, req.body.endpoint, req.body.authKey, req.body.p256dh);
        return res.status(201).json({message: 'Subscription created'});
    } catch (error) {
        console.error(error);
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