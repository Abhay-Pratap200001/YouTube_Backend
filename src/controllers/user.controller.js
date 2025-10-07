import { use } from "react";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadonCloudinary } from "../utils/Cloudinary.js";

//genrating access and refresh token to store
const generateAccessAndRefreshTokens = async(userId)=>{
  try {
    //finding user based on id
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    //saving refresh token into database
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiError(500, 'Something went wrong while genrating refresh and access token')
  }
}



//Accepting data from client
export const registerUser = asynHandler(async(req, res)=>{
   const {fullname, email, username, password} = req.body

   if ([fullname, email, username, password].some((fields) => fields?.trim() === "")) {
      throw new ApiError(400, "All fields are required")
   }
   
   const existedUser = await User.findOne({
    $or: [{username}, {email}]
   })

   if (existedUser) {
    throw new ApiError(409, "User Already Exist")
   }
   
   //Accepting files from client
   const avatarLocalPath = req.files?.avatar[0]?.path
   
   let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
    }

      if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required')
   }

   const avatar = await uploadonCloudinary(avatarLocalPath)
   console.log(avatar);
   
   const coverImage = await uploadonCloudinary(coverImageLocalPath)
   console.log(coverImage);
   
   if (!avatar) {
        throw new ApiError(400, 'Avatar file is required')
   }

   //Creating user from client
   const user = await User.create({
    fullname, 
    avatar: avatar.url, 
    coverImage: coverImage?.url || "", 
    email, password, 
    username: username.toLowerCase()
  })

  //finding specific user._id and removing pass and refreshToken from res
  const createdUser = await User.findById(user._id).select("-password -refreshToken")

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user into db')
  }

  //sending res to client
  return res.status(201).json(new ApiResponse(200, createdUser, 'User Created Successfully'))

})




export const loginUser = asynHandler(async(req, res)=>{
  const {email, username, password} = req.body
  if (!(username || email)) {
    throw new ApiError(400, 'username or email is required')
  }

   const user = await User.findOne({
    $or:[{username , email}]
   })

   if (!user) {
    throw new ApiError(404, 'User does not exist')
   }
   
   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid User Credentials')
   }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

  const logedInUser = await User.findById(user._id).select('-password -refreshToken')

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options).json(new ApiResponse(200, {user:logedInUser, accessToken, refreshToken},'User logedIn successfully'))
})




export const logOutUser = asynHandler(async(req, res) => {
   await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken: undefined}},{
    new:true
   })
   
    const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, 'User logOut'))
})