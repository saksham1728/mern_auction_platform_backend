//1st step of backend
import app from "./app.js";

//2nd step to setup cloudinary
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
})

//Create config.env

app.listen(process.env.PORT,()=>{
    console.log(`Server listening on port ${process.env.PORT}`);
});