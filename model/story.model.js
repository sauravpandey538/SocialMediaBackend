import mongoose,{Schema} from "mongoose";
const storySchema = new Schema({
    uploader : {
        type : Schema.Types.ObjectId,
        ref:"User"
    },
   
    storyImage:{
        type:String,
        default:null
    },
    createdAt: { type: Date, default: Date.now }

});
 const Story = mongoose.model("Story", storySchema);
 export default Story;