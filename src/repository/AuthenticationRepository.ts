import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient()

/**
 * Check if the API Key is valid and not expired
 * @param apiKey
 * @returns null if valid, error message if not
 */
export const checkAccessToken = async (apiKey: string) => {
    const accessToken = await prisma.accessToken.findFirst({
        where: {
            token: apiKey
        },
        select: {
            expirationDateTime: true
        }
    });

    if (!accessToken) {
        return 'Invalid API Key';
    }

    if (accessToken.expirationDateTime > new Date()) {
        await updateLastUsed(apiKey);
        return null;
    } else {
        return 'API Key expired';
    }
}

/**
 * Update last used date of API Key
 * @param apiKey
 */
async function updateLastUsed(apiKey: string) {
    try {
        await prisma.accessToken.update({
            where: {
                token: apiKey
            },
            data: {
                lastUsed: new Date()
            }
        });
        return true;
    } catch (err) {
        console.error('Error while updating last used', err);
        return false;
    }
}
