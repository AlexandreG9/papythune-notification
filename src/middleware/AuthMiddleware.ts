import {NextFunction, Request, Response} from 'express'
import {checkAccessToken} from "../repository/AuthenticationRepository";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization;
    if (!auth) {
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        const isValidToken = await checkAccessToken(auth);
        if (isValidToken) {
            return res.status(403).json({message: isValidToken});
        }
        return next();
    } catch (error) {
        return res.status(500).json({message: 'Internal server error'});
    }
}
