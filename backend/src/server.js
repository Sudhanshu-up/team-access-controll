import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./config/db.js";

dotenv.config();

console.log("RENDER PORT:", process.env.PORT);
console.log("NODE ENV:", process.env.NODE_ENV);

const PORT = process.env.PORT || 2000;

const startServer = async () => {
    try {
        await connectDb();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`server running on PORT : ${PORT}`);
        });

    } catch (error) {
        console.log(error.message);
    }
};

startServer();