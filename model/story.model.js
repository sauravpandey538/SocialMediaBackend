import mongoose,{Schema} from "mongoose";
const storySchema = new Schema({
    uploader : String,
   uploaderPP:String,
    storyImage:{
        type:String,
        default:null
    },
    createdAt: { type: Date, default: Date.now }

});
 const Story = mongoose.model("Story", storySchema);
 export default Story;