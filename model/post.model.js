import mongoose,{Schema} from "mongoose"
const postSchema = new Schema ({
uploader : {
    type : Schema.Types.ObjectId,
    ref:"User"
},
postImage : String,
caption : {
    type: String, default : "",
}
}, {timestamps : true})
const Post = mongoose.model("Post", postSchema);
export default Post;