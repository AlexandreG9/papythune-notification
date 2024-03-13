import {describe, expect, test} from '@jest/globals';
import {PrismaClient} from "@prisma/client";
import {checkAccessToken} from "../../src/repository/AuthenticationRepository";

const prisma = new PrismaClient()

const validAccessToken = "e623c795-0032-48cd-8a96-b6e4dabca7f2";
const expiredAccessToken = "4539136a-ccc9-4000-a1bf-2f19e8a370a2";

beforeAll(() => {
    return initAccessTokenDB();
});

afterAll(() => {
    return clearDB();
});

describe("AuthenticationRepository", () => {
    test("should accept token", async () => {
        const isAllowed = await checkAccessToken(validAccessToken);
        expect(isAllowed).toBeNull();
    })

    test("should throw an error for an expired access token", async () => {
        const result = await checkAccessToken(expiredAccessToken);
        expect(result).toBe('API Key expired');
    })

    test("should throw an error for an invalid access token", async () => {
        const result = await checkAccessToken('invalid');
        expect(result).toBe('Invalid API Key');
    })
})


const initAccessTokenDB = async () => {
    try {
        try {
            return await prisma.accessToken.createMany({
                data: [
                    {
                        token: validAccessToken,
                        note: "Valid access token",
                        expirationDateTime: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 30),
                        updatedAt: new Date(),
                    }, {
                        token: expiredAccessToken,
                        note: "Expired test token",
                        expirationDateTime: new Date(2000, 1, 1),
                        updatedAt: new Date(),
                    }
                ]
            });
        } catch (e) {
            return console.error(e);
        }
    } finally {
        return prisma.$disconnect();
    }
}

const clearDB = async () => {
    await prisma.accessToken.deleteMany({
        where: {
            token: {
                in: [validAccessToken, expiredAccessToken]
            }
        }
    }).finally(() => prisma.$disconnect());
}
