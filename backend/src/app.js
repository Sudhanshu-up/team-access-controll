import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import { cookie } from "express-validator";
import cookieparser from "cookie-parser";
import orgnizationRouter from "./routes/organization.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieparser());
app.use(express.urlencoded({extended:true}));

app.use('/api/auth/users',userRouter);
app.use('/api/v1/org',orgnizationRouter);

app.get("/",()=>{
    console.log("hello sudhanshu");
});

export default app;
