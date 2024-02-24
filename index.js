import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import { spawn } from "child_process"
import { User } from "./model/User.js";


// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

dotenv.config()
const app = express()

const botProcess = spawn('node', ['bot/bot.js']);

botProcess.stdout.on('data', (data) => {
    console.log(`Bot Output: ${data}`);
});

botProcess.stderr.on('data', (data) => {
    console.error(`Bot Error: ${data}`);
});

botProcess.on('close', (code) => {
    console.log(`Bot process exited with code ${code}`);
});



const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    console.log(`server listening at port - ${PORT}`);
    await connectDB()

    // const users = await User.find()
    // console.log(users);
})


