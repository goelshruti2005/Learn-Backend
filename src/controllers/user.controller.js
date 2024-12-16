import {asyncHandler} from "../utils/asynHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.modules.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"



const generateAccessAndRefreshToken = async(userId) => {
try {
   const user = await User.findById(userId)
   //console.log(user);
   
   const accessToken = user.generateAccessToken()
   //console.log(accessToken);
   
   const refreshToken = user.generateRefreshToken()

   user.refreshToken = refreshToken
   await user.save({validateBeforeSave: false})

   return {accessToken , refreshToken}


}
 catch (error) {
   throw new ApiError(500,"Something went wrong while generating refresh and access tokens")   
}
}



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
    console.log("Files : ",req.files);
    console.log("File : ",req.file);
    
   

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

  // console.log("existedUser : ",existedUser);
   
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
   // console.log("cover Image:",coverImage);
   // //Avatar and cover Image has the respone given by clodinary
   
   
   
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

     const createdUser = await User.findOne(user._id).select(
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


const loginUser = asyncHandler(async(req,res)=>{
 //req.body->data
 //username or email
 //find the user
 //password check
 //generate access and refresh token
 //send them into cookies

 const {email, username, password} = req.body
//console.log("usernae",username);

//  if(!username && !email){
//    throw new ApiError(400,"username or password is required")
//  }
//Alternative of above code
 if(!(username || email)){
   throw new ApiError(400,"username or password is required")
 }

 const user = await User.findOne({
   $or: [{username},{email}]
 })

 //console.log("user :",user);
 

 if(!user){
   throw new ApiError(404,"User does not exist")
 }

 //the methods that are provided by monggose should be accessed by model name as User.findOne({})
 //the methods that we created using User.methods are accessed by User instance which is here user such as user.isPasswordCorrect()
const isPasswordValid = await user.isPasswordCorrect(password)

if(!isPasswordValid){
   throw new ApiError(404,"Invalid user credentials")
 }

const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

const loggedInUser = await User.findOne(user._Id).select(
   "-password -refreshToken"
)
//console.log("loggedInUser :",loggedInUser);


const options={
   httpOnly: true,
   secure: true
}

return res
.status(200)
.cookie("accessToken",accessToken,options) //We can access cookie here because of cookieParser
.cookie("refreshToken",refreshToken,options)
.json(
   new ApiResponse(
      200,
      {
         user: loggedInUser, accessToken, refreshToken
      },
      "User logged In Successfully"
   )
)
})


const logoutUser = asyncHandler(async(req,res)=>{
 //clear cookies
 //We want the id of the user for this we want a middleware
  await User.findByIdAndUpdate(
      req.user._id,
      {
         $set: {
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )

   const options={
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
  try {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   console.log("incomingRefreshToken :",incomingRefreshToken);
   

   if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorized access")
   }
 
  const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
  console.log("decodedToken :",decodedToken);
  
 
  const user = await User.findById(decodedToken?._id)
  console.log("User :",user.refreshToken);
  
 
  if(!user){
    throw new ApiError(401,"Invalid refresh token")
  }
 
  if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,"Refresh token is expired or used")
  }
 
  const options={
    httpOnly: true,
    secure: true
  }
 
  const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
 
  return res
  .status(200)
  .cookie("accessToken",accessToken,options) 
  .cookie("refreshToken",refreshToken,options)
  .json(
     new ApiResponse(
        200,
        {
           accessToken, refreshToken
        },
        "Access token refreshed"
     )
  )
  } catch (error) {
      throw new ApiError(401, error?.message || "invalid refresh token")
  }
})


const changeCurrentPassword = asyncHandler(async(req,res)=>{
   // console.log("Hello");
   
   const {oldPassword, newPassword} = req.body
  // const {oldPassword, newPassword, confPassword} = req.body

   // if(newPassword !== confPassword){
   //    throw new ApiError(400,"Add same password to confirm field")
   // }
      // console.log(req.body);
      // console.log(req.user);
      
   const user =await User.findOne(req.user?._id)
   //console.log(user);
   
      
   const isPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordValid){
      throw new ApiError(400,"Invalid old Password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password changed successfully"))

})

const getCurrentUser = asyncHandler(async(req,res)=>{
 
  
 return res.status(200).json({
   status: 200,
   user: req.user,
   message: "Current user fetched successfully"
});
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
   const {fullName, email} = req.body
   // console.log("Request : ",req.body);
   
   

   if(!fullName && !email){
      throw new ApiError(400,"All fields are required")
   }
   const user = req.user
   //  User exist or not
   if(fullName === user.fullName && email === user.email ){
      return res.status(200)
      .json(new ApiResponse(200,user,"No updated field is given"))
   }
   //  const existedUser= await User.findOne({email})

   //   if(existedUser){
   //    throw new ApiError(400,"User already exists put another username")
   //   }
     console.log(req.user._id);

   const updatedUser =await User.findByIdAndUpdate(
      user._id,
      {
         $set: {
            fullName : fullName,
            email : email
         }
      },
      {
         new : true
      }// if we set it true then we returned new information
   ).select("-password ")

return res
.status(200)
.json(new ApiResponse(200,updatedUser,"Account Details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
   const avatarLocalPath = req.file?.path
console.log("local path : ",avatarLocalPath);

   //We caan delete old image from cloudinary
   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)

   if(!avatar.url){
      throw new ApiError(400,"Error while uploading on avatar")
   }
console.log("avatar : ",avatar);

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set :{
            avatar: avatar.url
         }
      }
      ,{new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200,user,"Avatar updated successfully"))
})


const updateUserCoverImage = asyncHandler(async(req,res)=>{
   const coverImageLocalPath = req.file?.path

   if(!coverImageLocalPath){
      throw new ApiError(400,"Avatar file is missing")
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!coverImage.url){
      throw new ApiError(400,"Error while uploading on avatar")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set :{
            coverImage: coverImage.url
         }
      }
      ,{new: true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200,user,"Cover Image updated successfully"))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}
