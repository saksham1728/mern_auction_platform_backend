import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//9th Step:-

const userSchema=new mongoose.Schema({
    userName:{
        type:String,
        minLength:[3,"UserName must contain atleast 3 characters"],
        maxLength:[20,"UserName cannot exceed 20 characters"],
    },
    password:{
        type:String,
        selected:false,
        minLength:[8,"password must contain atleast 8 characters"],
        
    },
    email:{
        type:String,
    },
    address:{
        type:String,
    },
    phone:{
        type:String,
        minLength:[10,"phone number must contain exactly 10 numbers"],
        maxLength:[10,"phone number must contain exactly 10 numbers"],
    },
    profileImage:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        }
    },
    paymentMethods:{
        bankTransfer:{
            bankAccountNumber:String,
            bankAccountName:String,
            bankName:String,
        },
        razorpay:{
            razorpayAccountNumber:Number,
        },
        paypal:{
            paypalEmail:String,
        }
    },
    role:{
        type:String,
        enum:["Auctioneer","Bidder","Super Admin"]
    },
    unpaidCommission:{
        type:Number,
        default:0,
    },
    auctionsWon:{
        type:Number,
        default:0,
    },
    moneySpent:{
        type:Number,
        default:0,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
});

//to bcrypt
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password=await bcrypt.hash(this.password,10);
});

userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

userSchema.methods.generateJsonWebToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

export const User=mongoose.model("User",userSchema);


//10th step is creating register and login functions in usercontroller.js
