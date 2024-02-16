import { PrismaClient } from "@prisma/client"

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