import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.route.js"
import testRoute from "./routes/test.route.js"
import dotenv from "dotenv";
const app = express();

dotenv.config();

app.use(cors({
  origin: process.env.CLIENT_URL.replace(/\/$/, ''), 
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRoute);
app.use('/api/test',testRoute);

app.listen(5000,()=>{
    console.log("Server is running...!",5000);
});