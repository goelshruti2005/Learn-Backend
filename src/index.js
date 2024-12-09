//require('dotenv').config({path : '/.env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"

dotenv.config({
    path: './env'
})

connectDB()












/*
import express from 'express'

//First Approach

function connectDB(){

}
//More better approach ifee
const app=express();
;(async ()=>{
try {
    mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
app.on("error",(error)=>{
    console.log("ERROR: ",error);
    throw error    
})

app.listen(process.env.PORT,()=>{
    console.log(`App is listening on ${process.env.PORT}`);
    
})
} catch (error) {
    console.error("ERROR: ",error);
    throw err
    
}
})()
*/