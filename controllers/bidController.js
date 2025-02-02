import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"
import ErrorHandler from "../middlewares/error.js"
import { Auction } from "../models/auctionSchema.js";
import {Bid} from "../models/bidSchema.js";
import { User } from "../models/userSchema.js";


export const placeBid=catchAsyncErrors(async(req,res,next)=>{
    const {id}=req.params;                      //get id
    const auctionItem=await Auction.findById(id);       //auction item ko dhunda id ke zariye
    if(!auctionItem){
        return next(new ErrorHandler("Auction Item not found",404));
    }
    const {amount}=req.body;        //amount ko get kra body me se jo us user ne place ki thi 
    if(!amount){
        return next(new ErrorHandler("Please place your bid",404));
    }
    if(amount<=auctionItem.currentBid){
        return next(new ErrorHandler("Bid ammount must be greater than the current bid"))
    }
    if(amount<auctionItem.startingBid){
        return next(new ErrorHandler("Bid Amount must be greater than starting bid"))
    }
    //3 errors checking above

    try{
        const existingBid=await Bid.findOne({      //by this we are checking if the user who is placing the bit has already placed a bid on this product or not
            "bidder.id": req.user._id,
            auctionItem: auctionItem._id,
        });
        const existingBidInAuction=auctionItem.bids.find(
            (bid)=>bid.userId.toString()==req.user._id.toString()
        );
        if(existingBid && existingBidInAuction){
            existingBidInAuction.amount=amount;
            existingBid.amount= amount;
            await existingBidInAuction.save();
            await existingBid.save();
            auctionItem.currentBid=amount;
        }
        else{
            const bidderDetails=await User.findById(req.user._id);
            const bid=await Bid.create({
                amount,
                bidder:{
                    id:bidderDetails._id,
                    userName:bidderDetails.userName,
                    profileImage:bidderDetails.profileImage?.url,
                    amount,
                },
                auctionItem:auctionItem._id,
            });
            auctionItem.bids.push({
                userId:req.user._id,
                userName:bidderDetails.userName,
                profileImage:bidderDetails.profileImage?.url,
                amount,
            });
            auctionItem.currentBid=amount;
        }
        await auctionItem.save();
        res.status(201).json({
            success:true,
            message:"Bid placed",
            currentBid:auctionItem.currentBid,
        })
    }
    catch(error){
        return next(new ErrorHandler(error.message || "Failed to place bid.",500));
    }
});

