import mongoose from 'mongoose'
const {Schema}= mongoose;

const Userschema = new mongoose.Schema({
   username:{type:String,required:true},
   email:{type:String,required:true},
   password:{type:String,required:true},
   location:{type:String,required:true},
   district:{type:String,required:true},
   phone:{type:Number,required:true},
   isAdmin:{type:Boolean,default:false},
},
{timestamps:true});

export default mongoose.model("User",Userschema );
