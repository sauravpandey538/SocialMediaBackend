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

//hashing
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
// debugging
signupSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}
const Signup = mongoose.model("Signup",signupSchema)
export default Signup;