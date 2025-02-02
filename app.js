import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./database/connection.js";
import { errorMiddlewares } from "./middlewares/error.js";
import userRouter from "./router/userRoutes.js";
import auctionItemRouter from "./router/auctionItemRoutes.js";
import BidRouter from "./router/bidRoutes.js";
import commissionRouter from "./router/comissionRouter.js";
import SuperAdminRouter from "./router/superAdminRoutes.js";
import { endedAuctionCron } from "./automation/endedAuctionCron.js";
import { verifyCommissionCron } from "./automation/verifyComissionCron.js"


//4th step
const app=express();
config({
    path:"./config/config.env" 
})

//5th step
app.use(cors({
    origin:[process.env.FRONTEND_URL],
    methods:["POST","GET","PUT","DELETE"],
    credentials:true,
}));


//6th step
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true})); //ensures data matching
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp",
}));   //replica of multer because its syntax is easy in multer we need to create files

//7th step is connecting it with database

//connecting routes
app.use("/api/v1/user",userRouter);
app.use("/api/v1/auctionitem",auctionItemRouter);
app.use("/api/v1/bid",BidRouter);
app.use("/api/v1/commission",commissionRouter);
app.use("/api/v1/superadmin",SuperAdminRouter);

//8th step after connection.js


endedAuctionCron();
verifyCommissionCron();
connection();

//9th step is start creating modals

//middlewares
app.use(errorMiddlewares);

export default app;