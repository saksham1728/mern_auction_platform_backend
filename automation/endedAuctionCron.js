import cron from "node-cron";
import { Auction } from "../models/auctionSchema.js";
import { User } from "../models/userSchema.js";
import { calculateCommission } from "../controllers/comissionController.js";
import { Bid } from "../models/bidSchema.js";
import { sendEmail } from "../utils/sendEmail.js";

//if our terminal crashes due to any error then any scheduling done 
//in our cron will still run but condition is that that backend must run.

export const endedAuctionCron=()=>{
    cron.schedule("*/1 * * * * ",async()=>{
        const now=new Date();
        console.log("Cron for ended auction running...")
        const endedAuctions=await Auction.find({
            endTime:{$lt:now},
            commissionCalculated:false, //jiska commission get ho chuka hai uska hume dubara get nhi krna 
        });
        for(const auction of endedAuctions){
            try{
                const commissionAmount=await calculateCommission(auction._id);
                auction.commissionCalculated=true;
                const highestBidder=await Bid.findOne({
                    auctionItem:auction._id,
                    amount:auction.currentBid,
                });      
                const auctioneer=await User.findById(auction.createdBy);
                if(highestBidder){
                    auction.highestBidder=highestBidder.bidder.id;
                    await auction.save();
                    const bidder=await User.findById(highestBidder.bidder.id);
                    await User.findByIdAndUpdate(
                        bidder._id,
                        {
                            $inc:{
                                moneySpent:highestBidder.amount,
                                auctionsWon:1,
                            },
                        },
                        {new:true}
                    );
                    await User.findByIdAndUpdate(
                        auctioneer._id,
                        {
                            $inc:{
                                unpaidCommission:commissionAmount,
                            },
                        },
                        {new:true}
                    );
                    const subject=`Congratulations! You won the auction for ${auction.title}`;
                    const message=`Dear ${bidder.userName}, \n\nCongratulations! You have won the auction for ${auction.title}. \n\nBefore 
                    proceeding for payment contact your auctioneer via your auctioneer email:${auctioneer.email} \n\nPlease complete your payment using one of the 
                    following methods:\n\n. **Bank Transfer**: \n- Account Name:${
                        auctioneer.paymentMethods.bankTransfer.bankAccountName} \n- Account Number:${auctioneer.paymentMethods.bankTransfer.bankAccountNumber}
                         \n- Bank: ${auctioneer.paymentMethods.bankTransfer.bankName} \n\n
                         2. **RazorPay**:\n-You can send the payment via Razorpay: ${auctioneer.paymentMethods.razorpay.razorpayAccountNumber}\n\n
                         3. **PayPal**:\n-Send payment to: ${auctioneer.paymentMethods.paypal.paypalEmail}\n\n
                         4. **Cash on Delivery (COD)**:\n- If you prefer COD, you must pay 20% of the total 
                         amount upfront before delivery.
                         \n- To pay the 20% upfront, use any of the above methods.\n
                         - The remaining 80% will be paid upon delivery.\n- If you want to see the condition of your auction item then send your email
                          on this: ${auctioneer.email}\n\nPlease ensure your payment is completed by [Payment Due Date]. Once we confirm the payment,
                           the item will be shipped to you.\n\nThank you for participating!\n\nBest regards,\nSakshamAuction Team`;
                           sendEmail({email:bidder.email,subject,message});
                           console.log("Successfully email sent to highest bidder");

                    }
                    else{
                       await auction.save();
                    }
                
            }catch(error){
                return next(console.log(error || "Some error in ended auction cron"));

            }
        }
    })
};

//cron job is accurate for a 60 seconds timeout

