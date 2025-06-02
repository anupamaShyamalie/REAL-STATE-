import jwt from "jsonwebtoken";
import { promisify } from 'util';

const verifyJWT = promisify(jwt.verify);

export const shouldBeLoggedIn = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        await verifyJWT(token, process.env.JWT_SECRET_KEY);
        res.status(200).json({ message: "You are Authenticated!" });
    } catch (error) {
        return res.status(403).json({ message: "Token is not valid" });
    }
}

export const shouldBeAdmin = async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const payload = await verifyJWT(token, process.env.JWT_SECRET_KEY);
        
        if (!payload.isAdmin) {
            return res.status(403).json({ message: "Not authorized as admin" });
        }
        
        res.status(200).json({ message: "You are Authenticated!" });
    } catch (error) {
        return res.status(403).json({ message: "Token is not valid" });
    }
}