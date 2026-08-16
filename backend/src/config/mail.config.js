//setup SMTP transporter 

import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure:false,
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    // Kuch hosts (Render, kuch Docker setups) smtp.gmail.com ko IPv6
    // address pe resolve karte hain lekin unke paas IPv6 outbound route
    // nahi hota — isse "connect ENETUNREACH <ipv6>:587" error aata hai.
    // family: 4 karne se hamesha IPv4 use hoga, ye issue nahi aayega.
    family: 4,
})