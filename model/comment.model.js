import mongoose,{Schema} from "mongoose"

const commentSchema = new Schema({
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    commentor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        
    },
    comment:String,
    customTimestamp:{type: Number, default :  Date.now()},

});
const Comment = mongoose.model("Comment", commentSchema)
export default Comment;