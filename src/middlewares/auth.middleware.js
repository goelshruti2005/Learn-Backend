import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asynHandler.js"
import jwt from "jsonwebtoken"
import {User} from "../models/user.modules.js"

//It will verify whether there is user or not
export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
   //const token = /*req.cookies?.accessToken ||*/ req.header("Authorization")?.replace("Bearer ","")
    //console.log("req :",req);
    // console.log("header :",req.header("Authorization").replace("Bearer ",""));
    
    
     if(!token){
         throw new ApiError(401,"Unauthorized Request")
     }
 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    //  console.log("decoded :",decodedToken);
     
   const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
      // console.log("user :",user);
      
   if(!user){
     throw new ApiError(401,"Invalid Access Token")
   }
 
   req.user = user;
   next();
 
   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
   }
})