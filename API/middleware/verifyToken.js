import jwt from "jsonwebtoken";
import { promisify } from 'util';

const verifyJWT = promisify(jwt.verify);

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not Authenticated" });
        }

        const payload = await verifyJWT(token, process.env.JWT_SECRET_KEY);
        
        // Store user info in request object for use in route handlers
        req.userId = payload.id;
        req.isAdmin = payload.isAdmin;
        
        // Continue to the next middleware/route handler
        next();
    } catch (error) {
        return res.status(403).json({ message: "Token is not valid" });
    }
}

// Optional: Admin-only middleware
export const requireAdmin = (req, res, next) => {
    if (!req.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
}