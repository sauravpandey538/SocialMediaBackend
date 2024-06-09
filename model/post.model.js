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
likeCount: {type: Number, default : 0},
commentCount: {type: Number, default : 0},
accountReached: {type: Number, default : 0},



})
const Post = mongoose.model("Post", postSchema);
export default Post;