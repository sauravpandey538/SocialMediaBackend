import mongoose,{Schema} from "mongoose"
const postSchema = new Schema ({
uploader : {
    type: mongoose.Schema.Types.ObjectId,
     ref: "User",
},
postImage : String,
caption : {
    type: String, default : "",
},
customTimestamp:{type: Number, default :  Date.now()},


})
const Post = mongoose.model("Post", postSchema);
export default Post;