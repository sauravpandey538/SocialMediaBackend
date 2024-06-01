import mongoose,{Schema} from "mongoose"
const postSchema = new Schema ({
uploader : String,
postImage : String,
caption : {
    type: String, default : "",
},
uploaderPP:String,
customTimestamp:{type: Number, default :  Date.now()},


})
const Post = mongoose.model("Post", postSchema);
export default Post;