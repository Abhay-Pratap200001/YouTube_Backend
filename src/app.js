import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

//for entract with frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

//for accepting json files from frontend
app.use(express.json({limit:'16kb'}))

//for accepting data which come from frontend in url
app.use(express.urlencoded({extended:true, limit:'16kb'}))

//for keeping images files into server 
app.use(express.static('public'))

//for setting cookies into browser which comes from client and accept cookies from client
app.use(cookieParser())

export { app };
