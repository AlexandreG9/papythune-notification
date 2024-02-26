import {PrismaClient} from "@prisma/client"
import {SubscriptionDomain} from "../domain/SubscriptionDomain";

const prisma = new PrismaClient()

export const createSubscription = async (email: string, endpoint: string, authKey: string, p256dhKey: string, expirationTime?: number) => {
    await prisma.subscription.create({
        data: {
            endpoint,
            createdAt: new Date(),
            expirationTime,
            auth: authKey,
            p256dh: p256dhKey,
            user: {
                connectOrCreate: {
                    create: {email: email},
                    where: {email: email},
                }
            },
        }
    })
}


/**
 * Find subscriptions to send
 * @param email user who sent notification
 */
export const findSubscriptionsToSend = (email: string): Promise<SubscriptionDomain[]> => {
    return prisma.subscription.findMany({
        where: {
            NOT: {user: {email}}
        },
        select: {
            userEmail: true,
            endpoint: true,
            auth: true,
            p256dh: true,
        }
    });
}

export const deleteSubscription = async (endpoint: string) => {
    await prisma.subscription.deleteMany({
        where: {
            endpoint
        }
    })
}
