import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"

const signupSchema = new Schema ({
    email: {
        type: String,
        required: true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }

});
signupSchema.pre("save", async function (next){
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

const Signup = mongoose.model("Signup",signupSchema)
export default Signup;