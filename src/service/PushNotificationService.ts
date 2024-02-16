import webpush from "web-push";
import 'dotenv/config'
import {findSubscriptionsToSend} from "../repository/SubscriptionRepositoryService";

export const sendPushNotification = async (senderEmail: string, title: string, body: string, icon?: string) => {
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

    if(!vapidPrivateKey || !vapidPublicKey) {
        throw new Error('VAPID keys are not set');
    }

    webpush.setVapidDetails(title, vapidPublicKey, vapidPrivateKey);

    const subs = await findSubscriptionsToSend(senderEmail);

    subs.forEach(sub => {
        webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: {
                auth: sub.auth,
                p256dh: sub.p256dh
            }
        }, JSON.stringify({
            title,
            body,
            icon
        }))
    })
}