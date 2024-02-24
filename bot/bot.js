// bot.js
import TelegramBot from "node-telegram-bot-api";
import { User } from "../model/User.js";

export const startBot = () => {
    const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

    const userStates = new Map(); // Map to store user states

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // Check if the user already exists in the MongoDB collection
        const existingUser = await User.findOne({ userId });

        if (!existingUser) {
            // If the user doesn't exist, start the conversation
            userStates.set(userId, { status: "awaitingName" }); // Set initial state

            bot.sendMessage(chatId, 'Welcome! What is your name?');
        } else {
            // If the user exists, send a different message or take other actions
            bot.sendMessage(chatId, `Welcome back, ${existingUser.name}!`);
        }
    });

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        // const userName = msg.from.first_name;

        // Check user's state
        const currentUser = userStates.get(userId);

        switch (currentUser?.status) {
            case 'awaitingName':
                // User is expected to provide their name
                userStates.set(userId, { ...currentUser, status: 'awaitingCity', name: msg.text }); // Transition to the next state
                bot.sendMessage(chatId, `Great, ${msg.text}! What city are you from?`);
                break;

            case 'awaitingCity':
                // User is expected to provide their city
                userStates.set(userId, { ...currentUser, status: 'awaitingCountry', city: msg.text }); // Transition to the next state
                // currentUser.city = msg.text; // Store city in the user state
                bot.sendMessage(chatId, `Awesome! What country are you from?`);
                break;

            case 'awaitingCountry':
                // User is expected to provide their country
                console.log(currentUser, "current user");
                bot.sendMessage(chatId, `Thank you! Your information has been saved.`);

                // const userData = userStates.get(userId);
                // Save user information to MongoDB
                // const newUser = new User({
                //     userId,
                //     name: userData.name,
                //     city: userData.city, // Retrieve city from user state
                //     country: msg.text,
                // });

                // await newUser.save();
                // userStates.delete(userId); // End the conversation by removing user state
                break;

            default:
                // Handle unexpected state or user-specific logic
                break;
        }
    });
};
