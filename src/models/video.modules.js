import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema= new Schema({
   videoFile:{
    type:string, //cloudinary url
    required: true
   } ,
   thumbnail:{
    type:string, //cloudinary url
    required: true
   } ,
   title:{
    type:string, 
    required: true
   } ,
   description:{
    type:string, 
    required: true
   } ,
   duration:{
    type:Number,
    required: true
   } ,
   views:{
    type:Number,
    required: true
   } ,
   isPublished:{
    type:Boolean,
    required: true
   } ,
   owner: {
    type: Schema.Types.ObjectId,
    ref:"User"
   }

},{timestamps:true})


videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)