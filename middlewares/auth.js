import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated=catchAsyncErrors(async(req,res,next)=>{
    const token=req.cookies.token;   //if we dont use cookie parser then we will get undefined here
    if(!token){
        return next(new ErrorHandler("User not authenticated",400));
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY); //ye line pta lagati hai ki ye token is wali jwt secret key se develop hua hai ki nhi hua kyuki cookies to baki projects ki bhi whi save joti hai jha iski 
    req.user=await User.findById(decoded.id);
    next();
});

//Auhtorize means which user role should be given control over which part 
export const isAuthorized=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} not allowed to access this resource`,403))
        }
        next();
    }
}