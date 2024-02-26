import webpush from "web-push";
import 'dotenv/config'
import {deleteSubscription, findSubscriptionsToSend} from "../repository/SubscriptionRepositoryService";

export const sendPushNotification = async (senderEmail: string, title: string, body: string, icon?: string) => {
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const pushNotificationSubject = process.env.PUSH_NOTIFICATION_SUBJECT;

    if (!vapidPrivateKey || !vapidPublicKey) {
        throw new Error('VAPID keys are not set');
    }

    if (!pushNotificationSubject) {
        throw new Error('Push notification subject is not set');
    }

    webpush.setVapidDetails(pushNotificationSubject, vapidPublicKey, vapidPrivateKey);

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
        })).catch(async e => {
            if (e.statusCode === 410) {
                console.log(`Subscription expired for ${sub.userEmail}`);
                await deleteSubscription(sub.endpoint);
            }
            console.error(`Error while sending push notification to ${sub.userEmail}`, e);
        })
    })
}
