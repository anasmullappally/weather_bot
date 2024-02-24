import { Telegraf } from "telegraf";
import { User } from "../model/User.js";


const bot = new Telegraf(process.env.BOT_TOKEN);


bot.use(async (ctx, next) => {
    try {
        console.log('Entering Telegraf middleware');
        const userId = ctx.from.id;
        console.log('User ID:', userId);

        const user = await User.findOne({ userId });
        console.log('User found:', user);

        if (!user) {
            ctx.reply('Welcome! What is your name?');
            // ... handle user input and update user information ...



        }

        console.log('Exiting Telegraf middleware');
    } catch (error) {
        console.error('Error in Telegraf middleware:', error);
    }

    next();
});



bot.launch();