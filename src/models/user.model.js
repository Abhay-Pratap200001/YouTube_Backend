import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt'

const userSchema = new Schema(
{
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

     email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

     fullname:{
        type: String,
        required: true,
        trim: true,
    },

    avatar:{
        type: String, //Come from cloudinary 
        required:true,
    },

    coverImage:{
        type: String, //Come from cloudinary 
    },

    password:{
        type: String,
        required: [true, 'Password is must required']
    },
    
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],

    refreshToken:{
        type: String
    }
},

{timestamps:true}
)

//increpting password
userSchema.pre('save', async function(next){
 if(!this.isModified('password')) return  next();//if password is not modified then return 
 this.password = await bcrypt.hash(this.password, 7)//this.password is which come from client plan text pass then we hash that pass
 next()
})


//comparing password
userSchema.methods.isPasswordCorrect = async function(password){ //accepting plain password from user
return await bcrypt.compare(password, this.password)//password is text when user login, this.password is hash password which store in db and compare both of them
}



//Genrating accessToken
userSchema.methods.generateAccessToken = function(){
 return jwt.sign({
    _id: this._id,
    email: this.email,
    username:this.username,
    fullname: this.fullname
},
process.env.ACCESS_TOKEN_SECRECT,
{expiresIn:process.envACCESS_TOKEN_EXPIRY}
)
}


//genrating refreshToken
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
    _id: this._id,
},
process.env.REFRESH_TOKEN_SECRE,
{expiresIn:process.REFRESH_TOKEN_EXPIRY}
)
}



export const User = mongoose.model('User', userSchema)