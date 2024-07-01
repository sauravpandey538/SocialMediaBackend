// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import User from "../model/user.model.js"
import Follow from '../model/follow.model.js';
import Post from "../model/post.model.js"
import Story from '../model/story.model.js';
import Like from '../model/like.model.js';
import Comment from '../model/comment.model.js';
import upload from '../middleware/multer.js';
import { validateSignup } from '../middleware/validateSignup.js';

import uploadCloudinary from "../utilities/cloudinary.js"
import bcrypt from "bcrypt"
const app = express();
const port = process.env.PORT;
import mongoose from 'mongoose';
import verifyJWT from '../middleware/token.middleware.js';
import cors from "cors"
import bodyParser from 'body-parser';

mongoose.connect(process.env.MONGO_ATLAS_URL)
.then(()=>{console.log("Connected to mongoDB")})
.catch((error)=>{console.log(" Error connecting to mongoDB", error)})

app.use(
  cors({
    origin: "https://social-media-frontend-sage.vercel.app", 
    credentials: true, 
  })
);
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./uploads'));
// app.use(bodyParser.json());
//  app.use(bodyParser.urlencoded({ extended: true }));

//hello
// Define a route handler for the default home page
app.get('/', (req, res) => {res.send('Hello, Express 3.0!');
});
app.post('/signup', validateSignup ,async(req,res)=>{
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
        sameSite:'None',
        path:'/',
        domain:'https://social-media-frontend-sage.vercel.app'
      };
  
      res
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(200)
        .json({ message: "Login successful", user: existingUser, accessToken, refreshToken });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
}); // working
app.post('/logout', verifyJWT, async (req, res) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
  // working
  app.post('/bio', verifyJWT, async (req, res) => {
    const { bio } = req.body;
  
    if (bio === "") {
      return res.json({ message: "Enter a bio" });
    }
  
    try {
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      user.bio = bio;
  
      await user.save();
      const updatedUser = await User.findById(req.user.id);  
      return res.status(200).json({ message: "Bio updated successfully", user: updatedUser });
    } catch (error) {
      return res.status(400).json({ message: "Error during adding bio", error });
    }
  }); // working in json only
  
    // working  // accepting only json body...
app.post('/profileimage',verifyJWT, upload.single('image'), async (req, res) => {
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
app.post('/coverimage',verifyJWT, upload.single('image'), async (req, res) => {
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
app.get('/myprofile', verifyJWT, async(req,res)=>{
try {
  const user = await User.findById(req.user.id);
  return res.status(200).json({user})
} catch (error) {
  return res.status(400).json({message:"user couldn't find", error})
}
}) // working
app.get('/:userId/profile', verifyJWT, async (req, res) => {
  try {
      let { userId } = req.params;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ message: "Invalid userId" });
      }

      // Convert userId to ObjectId
      const objectIdUserId = new mongoose.Types.ObjectId(userId);


      // Use Mongoose aggregation to populate the followers and following arrays
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
                  coverImage: 1,
                  bio: 1,
                  followCount: { $size: "$followersList" },
                  followingCount: { $size: "$followingList" },
                  followers: {
                      email: "$followerDetails.email",
                      profileImage: "$followerDetails.profileImage"
                  },
                  following: {
                      email: "$followingDetails.email",
                      profileImage: "$followingDetails.profileImage"
                  }
              }
          }
      ]);

      // Fetch posts and post count
      const posts = await Post.find({ uploader: userId }).sort({ customTimestamp: -1 });
      const postCount = await Post.countDocuments({ uploader: userId });

      if (users.length === 0) {
          return res.status(404).json({ message: "User not found", data: {} });
      }

      const user = users[0];
    //  const thisUser = await User.findById(userId);
     const isExist = await Follow.findOne({follower: req.user.id, following: userId})

if(! isExist && req.user.id === userId){
  return res.status(200).json({ message: "This is my own profile", data: user,posts, postCount });

}

    else if(verifyJWT){
      const isFollowing = isExist ? true : false;
      return res.status(200).json({ message: "User fetched successfully", data: user, isFollowing,posts, postCount });
     }
else{
  return res.status(200).json({ message: "User fetched successfully", data: user,posts, postCount });

}
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
  user.password = newpassword;
  await user.save();
  return res.status(200).json({mesage:"User password changed correctlty", user, newpassword})
} catch (error) {
  return res.status(400).json({message:"Error during changing password"})
}
}) // working

// about post
app.post('/upload/post', verifyJWT, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    const imageUrl = await uploadCloudinary(req.file?.path);

    // Fetch the user object using the user ID
    const user = await User.findById(req.user.id);

    // Ensure that the user object exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the ObjectId of the user as the uploader
    // const uploader = user.email;
    const uploaderPP = user.profileImage;
    const post = await Post.create({
      uploader: req.user._id,
      postImage: imageUrl?.url || null,
      caption,
      uploaderPP,
      customTimestamp: Date.now()
    });

    return res.status(200).json({ message: 'Post uploaded successfully', post });
  } catch (error) {
    return res.status(400).json({ message: 'Internal server error', error });
  }
});

app.get("/post/:postId", async(req,res)=>{
  try {
    const {postId}= req.params;
    const post = await Post.findById(postId)
    const likeCount = await Like.countDocuments({postId});
    const commentCount = await Comment.countDocuments({postId});
    post.likeCount = likeCount
    post.commentCount = commentCount
    await post.save()
    return res.status(200).json({message:"Post fetched sucessfully", post})
  } catch (error) {
    return res.status(400).json({message:"Internal server error", error})
  }
})


 // working  // checked with image and caption
app.delete('/post/:id',verifyJWT,async(req,res)=>{
try {
  const postId = req.params.id;
  const postUpoader = await Post.findById(postId);
  const loggedinUser = await User.findById(req.user.id)
  if (postUpoader.uploader.toString() == loggedinUser._id.toString()){ // to string is mandatory
    const deletePost = await Post.findByIdAndDelete(postId);
    return res.status(200).json({message: "post deleted sucessfully", deletedPost: deletePost})
  }
  return res.status(400).json({message: "Uploader didn't match with you"})
} catch (error) {
  return res.status(400).json({message:"internal server error"})
}
}) // working
app.get('/posts', async (req, res) => {
  const { page = 1, limit = 2 } = req.query; // Default to page 1 and limit 2 posts per page
  try {
    const posts = await Post.find({})
      .populate('uploader', 'email profileImage') // Populate uploader field with specific user fields
      .sort({ customTimestamp: -1 }) // Sort posts by custom timestamp in descending order
      .skip((page - 1) * limit) // Skip appropriate number of posts based on page number and limit
      .limit(parseInt(limit)); // Limit the number of posts fetched per page
    
    // Get the total count of posts
    const totalPosts = await Post.countDocuments();

    // Return posts and total count as JSON response
    return res.status(200).json({ posts, totalPosts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}); // working
app.get('/:userId/posts',async(req,res)=>{
  const {userId} = req.params;
  const isUserExist  = await User.findById(userId);
  if(!isUserExist) {
    return res.status(400).json({message:"user is not valid"})
  }
try {
    const userspost = await Post.find({uploader:userId});
    return res.status(200).json({message:"user's post fetched sucessfully", userspost})
} catch (error) {
  return res.status(400).json({error})
}
}) // working
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
}); // working
 app.get('/suggestions/:count',verifyJWT, async(req,res)=>{
  
  const count  = parseInt(req.params.count) || 5;
  try {
    const following = await Follow.find({ follower: req.user.id }).select('following');
    const followingIds = following.map(f => f.following);
    const fetchUser = await User.find({ _id: { $ne: req.user.id, $nin: followingIds } }).limit(count).sort({ createdAt: -1 });
    return res.status(200).json({suggestions:fetchUser})
  } catch (error) {
    return res.status(400).json({message: "internal server error", error})
  }
 });  // working
 app.post('/upload/story', verifyJWT, upload.single('image'), async(req,res)=>{
  try {
    const imageUrl = await uploadCloudinary(req.file?.path)
    // Fetch the user object using the user ID
    const user = await User.findById(req.user.id);
    // Ensure that the user object exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the ObjectId of the user as the uploader
    const uploader = user.email;
    const uploaderPP = user.profileImage;

    const story = await Story.create({
      uploader,
      storyImage : imageUrl.url,
      uploaderPP,
      customTimestamp: Date.now() // added now
    })
    return res.status(200).json({message:"story uploaded sucessfully", story})
  } catch (error) {
    return res.status(400).json({message:"internal server error", error})
  }
  })
  app.get('/story/:count',verifyJWT, async(req,res)=>{
    const count  = parseInt(req.params.count) || 9;
    const fetchUser = await Story.find().limit(count).sort({ createdAt: -1 });
    return res.status(200).json({suggestions:fetchUser})
   });
app.get("/:userId/followings", async(req,res)=>{
  const {userId} = req.params;
  const user = await User.findById(userId);
  if(!user){ return res.status(404).json({ message:"User is not registered yet"})}
  try {
    const followingList = await Follow.find({follower : userId}).populate("following");
    return res.status(200).json({message:"Following list fetched sucessfully", followingList})
  } catch (error) {
    return res.status(400).json({message:"Internal server error"})
  }
})

app.delete("/delete/posts", verifyJWT, async(req,res)=>{
const user = await User.findById(req.user.id)
if(!user){
  return res.status(404).json({message:"invalid user access"})
}
try {
  const posts = await Post.deleteMany({uploader : req.user.id})
  return res.status(200).json({message:"All posts are deleted sucessfully"})
} catch (error) {
  return res.status(401).json({message:"Error during deleting posts"})
}
})
app.delete("/delete/account", verifyJWT, async(req,res)=>{
  const user = await User.findById(req.user.id)
  if(!user){
    return res.status(404).json({message:"invalid user access"})
  }
  try {
    const user = await User.deleteMany({_id : req.user.id})
    return res.status(200).json({message:"User is deleted sucessfully"})
  } catch (error) {
    return res.status(401).json({message:"Error during deleting user"})
  }
  })
  app.delete("/suggestion/:userId/delete", verifyJWT, async (req, res) => {
    const { userId } = req.params;
  
    try {
      // Find and delete the follow suggestion
      const deletedSuggestion = await Follow.findOneAndDelete({
        follower: req.user.id,
        following: userId,
      });
  
      if (!deletedSuggestion) {
        return res.status(404).json({ message: "User is not following you" });
      }
  
      return res.status(200).json({ message: "User successfully removed from following list" });
    } catch (error) {
      console.error("Error deleting follow suggestion:", error);
      return res.status(500).json({ message: "Internal server error",error });
    }
  });
app.post("/:postId/like", verifyJWT, async(req,res)=>{
const {postId} = req.params;
const isValid = await Post.findById(postId);
if (!isValid){
  return res.status(404).json({message:"Post is not valid"})
}
try {
  const alreadyLiked = await Like.findOne({liker: req.user.id, postId}); // finds if it is in document . which mean it cheks whether it is already
  if(!alreadyLiked){
    const like = new Like({
  postId,
  liker:req.user.id,
  customTimestamp: Date.now()
    })
    await like.save()
    const totalLike = await Like.countDocuments(postId)
    return res.status(200).json({message:"Liked sucessfully", like, totalLike, isLiked : false})
  }
  else{
    const unlike = await Like.findOneAndDelete({liker: req.user.id, postId});
    return res.status(200).json({message:"Unliked sucessfully", unlike, isLiked :true})
  
  }
} catch (error) {
  console.log(error)
  return res.status(400).json({message:"Internal error", error})
}
}) // working as expected
app.post("/:postId/comment", verifyJWT, async(req,res)=>{
  const {postId} = req.params;
  const {comment}= req.body;
  if (comment === " "){
    return res.status(400).json({message:" Comment can't be empty"})
  }
  const validPost = await Post.findById(postId);
  if(!validPost){
    return res.status(404).json({message:"Post is not valid"})
  }
try {
    const newComment = new Comment({
      postId,
      commentor:req.user.id,
      comment,
      customTimestamp: Date.now()
    })
    await newComment.save();
    return res.status(200).json({message:"Comment done sucessfully", newComment})
} catch (error) {
  return res.status(400).json({message:"Internal server error", error})
}
}) // working as expected
app.delete("/:commentId/undocomment", verifyJWT, async(req,res)=>{
  const {commentId} = req.params;
  const verifiedId = await Comment.findById(commentId);
  if(!verifiedId){
    return res.status(404).json({message:"Comment don't exit yet."})
  }
  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({message: "Comment deleted sucessfully", deletedComment})
  } catch (error) {
    return res.status(400).json({message:"Internal server error"})
  }
}) // working as expected
app.get("/:postId/likes", verifyJWT, async(req,res)=>{
  const {postId} = req.params;
  const validPost = await Post.findById(postId);
  if(!validPost){
    return res.status(404).json({message:"Post don't exit yet."})
  }
  const likes = await Like.find({postId}).populate("liker");
  const likesList = likes.map((item)=> item.liker.email) // fetching names only for now.
  return res.status(200).json({message:"Likes fetched sucessfully", likesList})
  // isliked : true || false , problem solved...
}) // working as expected
app.get("/:postId/comments",  async(req,res)=>{
  const {postId} = req.params;
  const validPost = await Post.findById(postId);
  if(!validPost){
    return res.status(404).json({message:"Post don't exit yet."})
  }
  const comments = await Comment.find({postId:postId}).populate("commentor").sort({ customTimestamp: -1 })
  ;
  return res.status(200).json({message:"comments fetched sucessfully", comments})
}) // working as expected









app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

export default app;