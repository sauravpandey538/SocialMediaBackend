import mongoose,{Schema} from 'mongoose'
const loginSchema = new Schema({
    email:{
        type: String,
        require: true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
})
const Login = mongoose.model("Login", loginSchema)
export default Login;