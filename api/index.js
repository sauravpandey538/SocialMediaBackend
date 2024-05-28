// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import User from "../model/user.model.js"

const app = express();
const port = process.env.PORT;
import mongoose from 'mongoose';
import { verifyAccessToken } from '../middleware/token.middleware.js';
mongoose.connect('mongodb://localhost:27017/socialMediaBackend')
.then(()=>{console.log("Connected to mongoDB")})
.catch((error)=>{console.log(" Error connecting to mongoDB", error)})

app.use(express.json())
app.use(cookieParser())


// Define a route handler for the default home page
app.get('/', (req, res) => {
    res.send('Hello, Express 3.0!');
});
app.post('/signup',async(req,res)=>{
    const {email,password} = req.body;
    if(!(email && password)){
        return res.status(400).json({message:"Provide both email and password"})
    }
    const isUserExistAlready = await User.findOne({email})
    if (isUserExistAlready){return res.json({message:"User already exist"})}
    try {
        const user = await User.create({email,password})
        return res.status(200).json({message:"User created sucessfully", user})
    } catch (error) {
        return res.status(500).json("message: error during signup", error)

    }

})  // working
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (!(email && password)) {
      return res.status(400).json({ error: "Please provide complete information" });
    }
  
    try {
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const passwordMatch = await existingUser.isPasswordCorrect(password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Password is incorrect" });
      }
  
      const accessToken = await existingUser.generateAccessToken(existingUser._id);
      const refreshToken = await existingUser.generateRefreshToken(existingUser._id);
      existingUser.refreshToken = refreshToken;
      await existingUser.save();
  
      const options = {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      };
  
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(200)
        .json({ message: "Login successful", user: existingUser, accessToken });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }); // working
app.post('/bio',verifyAccessToken, async(req,res)=>{
  const {bio} = req.body;
  if( bio === ""){ return res.json({message:"Enter a bio"})}
  try {

    const user = await User.findById(req.user.id)
    user.bio = bio;
    user.save()
    return res.status(200).json({message:"Bio updated Sucessfully", user})
  } catch (error) {
    return res.status(400).json({message:"Error during adding bio", error})
  }

});  // working





// Start the server and listen on port 3000
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
