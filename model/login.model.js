import mongoose, { Schema } from 'mongoose';
import jwt from "jsonwebtoken";

const loginSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
});

// Generating access token
loginSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_ACCESS_PASSWORD, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    });
};

// Generating refresh token
loginSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_REFRESH_PASSWORD, {
        expiresIn: process.env.ACCESS_REFRESH_EXPIRES_IN
    });
};

const Login = mongoose.model("Login", loginSchema);

export default Login;
