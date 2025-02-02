import ErrorHandler from "../middlewares/error.js"
import { User } from "../models/userSchema.js";
import {v2 as cloudinary}from "cloudinary"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { generateToken } from "../utils/jwtToken.js";

//10th Step

//create middleswares first then come back here


//first build register function and set up all cloudinary code in it 
//then write generatejsonwebtoken in userschema 
//then design folder utils and in it write jwttoken so when user register a cookie is generated 


export const register =catchAsyncErrors( async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Profile Image Required", 400));
    }

    const { profileImage } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    if (!allowedFormats.includes(profileImage.mimetype)) {
        return next(new ErrorHandler("File Format not supported", 400));
    }

    const {
        userName,
        email,
        password,
        phone,
        address,
        role,
        bankAccountNumber,
        bankAccountName,
        bankName,
        razorpayAccountNumber,
        paypalEmail,
    } = req.body;

    if (!userName || !email || !phone || !password || !address || !role) {
        return next(new ErrorHandler("Please fill full form", 400));
    }
    if (role === "Auctioneer") {
        if (!bankAccountName || !bankAccountNumber || !bankName) {
            return next(new ErrorHandler("Please provide your full bank details", 400))

        }
        if (!razorpayAccountNumber) {
            return next(new ErrorHandler("Please provide razor pay account details", 400))
        }
        if (!paypalEmail) {
            return next(new ErrorHandler("Please provide your paypal email", 400));
        }
    }


    const isRegistered = await User.findOne({ email });

    if (isRegistered) {
        return next(new ErrorHandler("User already registered",400));
    }
    const cloudinaryResponse=await cloudinary.uploader.upload(profileImage.tempFilePath,{
        folder:"MERN_AUCTION_USERS"
    });
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.log("Cloudinary Error: ",cloudinaryResponse.error || "Unknown Cloudinary Error");
        return next(new ErrorHandler("Failed to upload profile image to cloudinary",500));
    }

    const user=await User.create({
        userName,
        email,
        password,
        phone,
        address,
        role,
        profileImage: {
            public_id:cloudinaryResponse.public_id,
            url:cloudinaryResponse.url
        },
        paymentMethods:{
            bankTransfer:{
                bankAccountNumber,
                bankAccountName,
                bankName,
            },
            razorpay:{
                razorpayAccountNumber,
            },
            paypal:{
                paypalEmail,
            },
        },     
});

generateToken(user,"User Registered",201,res);


});

//after register write login function 

export const login =catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return next(new ErrorHandler("Please provide full details",400));
    }

    const user=await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Invalid Email or password",400));
    }

    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid password or email",400));
    }
   
    generateToken(user,"User Logged In",200,res);
});

export const getProfile=catchAsyncErrors(async(req,res,next)=>{
    //for this first set up auth.js
    const user=req.user;
    res.status(200).json({
        success:true,
        user
    });
});

export const logout=catchAsyncErrors(async(req,res,next)=>{
    res
    .status(200)
    .cookie("token","",{
        httpOnly:true,
        expires:new Date(Date.now()),
        secure:true,
        sameSite:"None"
    })
    .json({
        success:true,
        message:"Logout Successfully"
    })
    
});

export const fetchLeaderBoard=catchAsyncErrors(async(req,res,next)=>{
    const users=await User.find({moneySpent:{$gt:0}});
    const leaderboard=users.sort((a,b)=>b.moneySpent-a.moneySpent);
    res.status(200).json({
        success:true,
        leaderboard,
    });

    
});
