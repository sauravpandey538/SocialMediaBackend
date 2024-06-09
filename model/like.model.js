import mongoose,{Schema} from "mongoose"

const likeSchema = new Schema({
    postId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    liker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
        
    },
    customTimestamp:{type: Number, default :  Date.now()},

});
const Like = mongoose.model("Like", likeSchema)
export default Like;