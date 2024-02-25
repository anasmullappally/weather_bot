import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { startBot } from "./bot/bot.js";

dotenv.config()
const app = express()

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    console.log(`server listening at port - ${PORT}`);
    await connectDB()

    startBot()
})


