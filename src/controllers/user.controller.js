import {asyncHandler} from "../utils/asynHandler.js"

const registerUser = asyncHandler( async(req,res)=>{
    res.status(200).json({
        message:"chai aur code"
    })
   
} )

export {
    registerUser,
}



























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

    
    // const {fullname, email, username, password}=req.body
    // console.log("email : ",email);