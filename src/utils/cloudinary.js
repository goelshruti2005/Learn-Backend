import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_cLOUD_NAME , 
    api_key: process.env.cLOUDINARY_API_KEY, 
    api_secret:  process.env.CLOUDINARY_API_SECRET
});

// Upload an image
const uploadOnCloudinary= async (localFilePath) =>{
    try {
        if (!localFilePath) return null;
        //upload file on cloudinary
       const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file has been uplaoaded successfully
        // console.log("file is uploaded successfully",response.url);
        // console.log(response);
        fs.unlinkSync(localFilePath)
        return response 
    } 
    catch (error) {
        console.log("File not uploaded , Please try again");
        fs.unlinkSync(localFilePath) //remove the locally saved temporary saved file as the upload operation got failed
        return null;  
    }
}

export {uploadOnCloudinary}



