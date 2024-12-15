import {asyncHandler} from "../utils/asynHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.modules.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async(req,res)=>{
   // steps
    //get user details from frontend
    //validation (not empty,prescribed cases)
    //check if user already exists : username,email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object-- create entry in db
    // remove password and refresh token field from response
    //check for user creation
    //return res

    
    const {fullName, email, username, password}=req.body
   //  console.log("Email : ",email);
   //  console.log("Fullname : ",fullName);
   //  console.log("Username : ",username);
   //  console.log("Password : ",password);
   //  console.log(req);
   //  console.log(req.body);
   //  console.log(req.files);
    
   

    //Validation 

    //We can do this below checking for every field
//     if(fullname === ""){
//     throw new ApiError(400,"fullname is required")
//    }

   //Or we can do this checking as
   if(
    [fullName,email,username,password].some((field)=>
    field?.trim() === "")
   ){
    throw new ApiError(400,"All fields are required")
   }

   //User exist or not
   const existedUser= await User.findOne({
    $or: [{ username },{ email }]
   })

   //console.log("existedUser : ",existedUser);
   
   if(existedUser){
    throw new ApiError(409,"User with email or username already exists")
   }

//Images / Avatar ----

   const avatarLocalPath = req.files?.avatar[0]?.path;
   
   //In this type if we dont have coverImage then we will have undefined error
   //const coverImageLocalPath = req.files?.coverImage[0]?.path; 

   //Do it in classic way
   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath=req.files.coverImage[0].path
   }

   
   if (!avatarLocalPath) {
     throw new ApiError(400, "Avatar file is required")
   }

   //upload them to cloudinary,avatar
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   
   // console.log("avatar :",avatar);
   //console.log("cover Image:",coverImage);
   //Avatar and cover Image has the respone given by clodinary
   
   
   
   if (!avatar) {
    throw new ApiError(400, "Avatar file is required")
     }
   
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
     })

     const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
     )
    //console.log("User",user);
     
     if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
     }


     return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
     )
   
    // res.status(200).json({
    //     message:"chai aur code"
    // })
   
} )



export {
    registerUser,
}
