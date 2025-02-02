import mongoose from "mongoose";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Commission } from "../models/comissionSchema.js";
import { User } from "../models/userSchema.js";
import { Auction } from "../models/auctionSchema.js";
import { PaymentProof } from "../models/ComissionProofSchema.js";

export const deleteAuction=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid Id format.",400));
    }
    const auctionItem=await Auction.findById(id);

    if(!auctionItem){
        return next(new ErrorHandler("Auction not found",404));
    }
    await auctionItem.deleteOne();
    res.status(200).json({
        success:true,
        message:"Auction item deleted successfully.",
    });
});

export const getAllPaymentProofs=catchAsyncErrors(async(req,res,next)=>{
    let paymentProofs=await PaymentProof.find();
    res.status(200).json({
        success:true,
        paymentProofs,
    });
});

export const getPaymentProofDetail=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    const paymentProofDetail=await PaymentProof.findById(id);
    res.status(200).json({
        success:true,
        paymentProofDetail,
    })
});

export const updateProofStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { amount, status } = req.body;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorHandler("Invalid Id format", 400));
    }

    // Find the payment proof by ID
    const proof = await PaymentProof.findById(id);
    if (!proof) {
        return next(new ErrorHandler("Payment Proof not found", 404));
    }

    // Update the proof
    const updatedProof = await PaymentProof.findByIdAndUpdate(
        id,
        { status, amount },
        {
            new: true, // Return the updated document
            runValidators: true, // Run validation on updated fields
            useFindAndModify: false, // Use native `findOneAndUpdate` instead
        }
    );

    res.status(200).json({
        success: true,
        message: "Payment Proof amount and status updated",
        proof: updatedProof,
    });
});


export const deletePaymentProof=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;
    const proof=await PaymentProof.findById(id);
    if(!proof){
        return next(new ErrorHandler("Payment proof not found.",404));
    }
    await proof.deleteOne();
    res.status(200).json({
        success:true,
        message:"Payment Proof Deleted.",
    })
});

export const fetchAllUsers=catchAsyncErrors(async(req,res,next)=>{
    const users=await User.aggregate([
        {
            $group:{
                _id:{
                    month:{$month:"$createdAt"},
                    year:{$year:"$createdAt"},
                    role:"$role",
                },
                count:{$sum:1},
            },
        },
        {
            $project:{
                month:"$_id.month",
                year:"$_id.year",
                role:"$_id.role",
                count:1,
                _id:0,
            },
        },
        {
            $sort:{year:1,month:1},
        },
    ]);

    const bidders=users.filter((user)=>user.role==="Bidder");
    const auctioneers=users.filter((user)=>user.role==="Auctioneer");

    const transformDataToMonthlyArray=(data,totalMonths=12)=>{
        const result=Array(totalMonths).fill(0);

        data.forEach((item)=>{
            result[item.month-1]=item.count;
        });

        return result;
    };

    const biddersArray=transformDataToMonthlyArray(bidders);
    const AuctioneersArray=transformDataToMonthlyArray(auctioneers);

    res.status(200).json({
        success:true,
        biddersArray,
        AuctioneersArray,
    })
});

export const monthlyRevenue=catchAsyncErrors(async(req,res,next)=>{
    const payments=await Commission.aggregate([
        {
        $group : {
            _id:{
                month:{$month:"$createdAt"},
                year:{$year:"$createdAt"},
            },
            totalAmount:{$sum:"$amount"},
        },
    },
    {
        $sort:{"_id.year":1,"_id.month":1},
    },
    ]);

    const transformDataToMonthlyArray=(payments,totalMonths=12)=>{
        const result=Array(totalMonths).fill(0);

        payments.forEach((payment)=>{
            result[payment._id.month-1]=payment.totalAmount;
        });
        return result;
    };

    const totalMonthlyRevenue=transformDataToMonthlyArray(payments);
    res.status(200).json({
        success:true,
        totalMonthlyRevenue,
    })
})