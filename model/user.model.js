import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique:true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format.'],

    },
    password:{
        type:String,
        require:true
    },
    profileImage: {type:String, default:"https://res.cloudinary.com/ddqif698j/image/upload/v1717357608/credentials%20data/xnyyjvwinbf2iwanpmdg.jpg"},
    coverImage: {type:String, default:"https://res.cloudinary.com/ddqif698j/image/upload/v1717357662/credentials%20data/cfiorkdqlqanhrw711al.jpg"},
    bio: { type: String, default: '' },     
     createdAt: { type: Date, default: Date.now }
   
})


//hashing
userSchema.pre("save", async function (next){
    if (!this.isModified("password")){ return next()}
    try{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password,salt)
    this.password = hashedPassword;
    next()
    }
    catch(error){
    throw new error("Error during hasing password : ", error)
    }
    })
    // debugging
    userSchema.methods.isPasswordCorrect = async function(password){
        return await bcrypt.compare(password,this.password)
    }

// Generating access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_ACCESS_PASSWORD, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    });
};

// Generating refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id
    }, process.env.JWT_REFRESH_PASSWORD, {
        expiresIn: process.env.ACCESS_REFRESH_EXPIRES_IN
    });
};
const User = mongoose.model("User",userSchema)
export default User;