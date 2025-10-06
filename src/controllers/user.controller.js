import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/asynHandler.js";
import { uploadonCloudinary } from "../utils/Cloudinary.js";

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