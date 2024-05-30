// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import User from "../model/user.model.js"
import Follow from '../model/follow.model.js';
import upload from '../middleware/multer.js';
import uploadCloudinary from "../utilities/cloudinary.js"
import bcrypt from "bcrypt"
const app = express();
const port = process.env.PORT;
import mongoose from 'mongoose';
import verifyJWT from '../middleware/token.middleware.js';
mongoose.connect('mongodb://localhost:27017/socialMediaBackend')
.then(()=>{console.log("Connected to mongoDB")})
.catch((error)=>{console.log(" Error connecting to mongoDB", error)})

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./uploads'));

// Define a route handler for the default home page
app.get('/', (_, res) => {res.send('Hello, Express 3.0!');
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
app.post('/logout', verifyJWT, async (_,res)=>{
try {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(200).json({message:"Sugcessfully logout"})
} catch (error) {
  return res.status(400).json({message:"problem came during login", error})
}
})   // working
app.post('/bio',verifyJWT, async(req,res)=>{
  const {bio} = req.body;
  if( bio === ""){ return res.json({message:"Enter a bio"})}
  try {
     const bioFromBody = bio;
    const user = await User.findById(req.user.id)
    user.bio = bioFromBody;
    user.save()
    return res.status(200).json({message:"Bio updated Sucessfully", user})
  } catch (error) {
    return res.status(400).json({message:"Error during adding bio", error})
  }

});  // working  // accepting only json body...
app.post('/profileimage',verifyJWT, upload.single('profileImage'), async (req, res) => {
    try {
        // Find the user by ID (assuming you're using some form of authentication middleware)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // console.log("req.file is : ", req.file)
        if (!req.file) {
          return res.json({ Error: "No file uploaded" });
        }
    const cloudinaryResult = await uploadCloudinary(req.file?.path)
user.profileImage = cloudinaryResult.url;
        await user.save();

        return res.status(200).json({ message: 'Profile picture uploaded successfully', user });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
}); // working
app.post('/coverimage',verifyJWT, upload.single('coverImage'), async (req, res) => {
  try {
      // Find the user by ID (assuming you're using some form of authentication middleware)
      const user = await User.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ error: "User not found" });
      }
      // console.log("req.file is : ", req.file)
      if (!req.file) {
        return res.json({ Error: "No file uploaded" });
      }
  const cloudinaryResult = await uploadCloudinary(req.file?.path)
user.coverImage = cloudinaryResult.url;
      await user.save();

      return res.status(200).json({ message: 'Cover image uploaded successfully', user });
  } catch (error) {
      console.error('Error uploading cover image:', error);
      return res.status(500).json({ error: "Internal server error" });
  }
}); // working
app.post('/myprofile', verifyJWT, async(req,res)=>{
try {
  const user = await User.findById(req.user.id);
  return res.status(200).json({user})
} catch (error) {
  return res.status(400).json({message:"user couldn't find", error})
}
}) // working
app.post('/:userId/profile', async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        // Convert userId to ObjectId
        const objectIdUserId = new mongoose.Types.ObjectId(userId);

        // Use Mongoose query chaining to populate the followers and following arrays
        const users = await User.aggregate([
          {
              $match: { _id: objectIdUserId }
          },
          {
              $lookup: {
                  from: "follows",
                  localField: "_id",
                  foreignField: "follower",
                  as: "followingList"
              }
          },
          {
              $lookup: {
                  from: "follows",
                  localField: "_id",
                  foreignField: "following",
                  as: "followersList"
              }
          },
          {
              $lookup: {
                  from: "users",
                  localField: "followersList.follower",
                  foreignField: "_id",
                  as: "followerDetails"
              }
          },
          {
              $lookup: {
                  from: "users",
                  localField: "followingList.following",
                  foreignField: "_id",
                  as: "followingDetails"
              }
          },
          {
              $project: {
                  name: 1,
                  email: 1,
                  profileImage: 1,
                  bio: 1,
                  followCount: { $size: "$followersList" },
                  followingCount: { $size: "$followingList" },
                  "followers.email": { $arrayElemAt: ["$followerDetails.email", 0] },
                  "followers.profileImage": { $arrayElemAt: ["$followerDetails.profileImage", 0] },
                  following: {
                      email: { $arrayElemAt: ["$followingDetails.email", 0] },
                      profileImage: { $arrayElemAt: ["$followingDetails.profileImage", 0] }
                  }
              }
          }
      ]);
      
      

        if (users.length === 0) {
            return res.status(404).json({ message: "User not found", data: {} });
        }

        const user = users[0];

        return res.status(200).json({ message: "User fetched successfully", data: user });
    } catch (error) {
        console.error("Error in fetching user profile:", error);
        return res.status(500).json({ message: "Internal server error", error });
    }
}); // working





app.patch('/update/password',verifyJWT, async(req,res)=>{
  const {newpassword,oldpassword} = req.body;
  if(newpassword === "") {
    return res.status(400).json({message:"Enter your new password correctly "})
  }
  if(oldpassword === "") {
  return res.status(400).json({message:"Enter your old password correctly "})
}
try {
  const user = await User.findById(req.user.id)
  const passwordCheck = await user.isPasswordCorrect(oldpassword)
  if (!passwordCheck){
    return res.status(400).json({message:"Enter your old password correctly"})
  }
  const hashedPassword = await bcrypt.hash(newpassword,10)

  user.password = hashedPassword;
  user.save();
  return res.status(200).json({mesage:"User password changed correctlty", user})
} catch (error) {
  return res.status(400).json({message:"Error during changing password"})
}
}) // worlimg


// about post
app.post('/upload/post',()=>{})
app.delete('/post/:id',()=>{})
app.get('/post/:id',()=>{}) // jwt don't require

// about like and comment
app.post('/post/:id/like', ()=>{});
app.post('/post/:id/comment', ()=>{});

// about following and followers

app.post('/:user/follow',verifyJWT, async(req,res)=>{

  try {
    const followingId = req.params.user;
    console.log(followingId)
    const followerId = req.user.id
    const alreadyFollowed = await Follow.findOne({follower: followerId, following:followingId})
    if (alreadyFollowed){
      return res.status(400).json({message:" Already followed"})
    }
    const operation = new Follow({
      follower: followerId,
      following:followingId,
    })
  await operation.save()
  return res.status(200).json({message: "Followed sucessfully"})
  } catch (error) {
    return res.status(400).json({message:"internal server error", error})
  }
});

// app.post('/following', ()=>{}); //may be deleted later



// Start the server and listen on port 3000
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
