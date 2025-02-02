//7th step 
import mongoose from "mongoose";

export const connection=()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"MERN_AUCTION"
    })
    .then(()=>{
        console.log("Connected to database");
    })
    .catch(()=>{
        console.log("Some error occured while connecting it with database")
    })
};