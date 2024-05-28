import mongoose, { Schema } from "mongoose";
const profileSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type:String,
        require:true
    },
    profileImage: {type:String, default:""},
    coverImage: {type:String, default:""},
    bio:{type:String, default:""},
    following:[{
        type:Schema.Types.ObjectId,
        ref: 'Profile'
    }],
    follow:[{
        type:Schema.Types.ObjectId,
        ref: 'Profile'
    }]
})
const Profile = mongoose.model("Profile",profileSchema)
export default Profile;