import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { startBot } from "./bot/bot.js";



// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

dotenv.config()
const app = express()




const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    console.log(`server listening at port - ${PORT}`);
    await connectDB()

    startBot()
    // const users = await User.find()
    // console.log(users);
})


