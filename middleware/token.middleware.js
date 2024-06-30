import jwt from "jsonwebtoken"
import User from "../model/user.model.js";
import dotenv from 'dotenv';
dotenv.config();
const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ error: "No token found" });
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_PASSWORD);
        const user = await User.findById(decodedToken.id);
        
        if (!user) {
            return res.status(401).json({ error: "Invalid access token" });
        }

        // Attach user object to the request for further processing
        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Invalid access token" });
    }
};

export default verifyJWT;
