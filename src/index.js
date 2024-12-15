//require('dotenv').config({path : '/.env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path: './.env'
})


app.get("/",(req,res)=>{
    res.send("Hello")
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
     })
})
.catch((err)=>{
    console.log("MONGO DB connection failed !!! ", err);
    
})












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