import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
    user?: string | JwtPayload;
}

export async function auth(req:AuthRequest, res: Response, next: NextFunction) {
    try {
        //   get the token from the authorization header
        const token = await req.headers.authorization?.split(" ")[1];

        if(!token) return res.status(401).send({
            error: new Error('No auth token!')
        });

        //check if the token matches the supposed origin
        const decodedToken = await jwt.verify(
            token,
            process.env.SECRET_ACCESS_TOKEN as string
        );
        // retrieve the user details of the logged in user
        const user = await decodedToken;

        // pass the the user down to the endpoints here
        req.user = user;

        // pass down functionality to the endpoint
        next();

    } catch (error) {
        res.status(401).json({
            error: new Error("Invalid req!"),
        });
    }
}