import mongoose from "mongoose";
import dns from "dns";

const connectDb = async()=>{
   dns.setServers(['8.8.8.8', '8.8.4.4']);
   try {
    const connection = await mongoose.connect(process.env.MONGODM_URI);
    console.log(`MONGODB connected !! ${connection.connection.host}`)
   } catch (error) {
    console.log("mondoDB connection error : ",error);
    process.exit(1)
   }
}

export default connectDb;