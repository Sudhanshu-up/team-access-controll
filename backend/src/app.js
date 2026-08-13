import express from "express";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import cookieparser from "cookie-parser";
import orgnizationRouter from "./routes/organization.routes.js";
import invitationRouter from "./routes/invitation.routes.js";
import membershipRouter from "./routes/membership.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieparser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth/users", userRouter);
app.use("/api/v1/org", orgnizationRouter);
app.use("/api/v1/invite", invitationRouter);
app.use("/api/v1/members", membershipRouter);

app.get("/", (req, res) => {
    console.log("hello sudhanshu");

    res.status(200).json({
        success: true,
        message: "Team Access Control API is running",
    });
});

export default app;