// bot.js
import TelegramBot from "node-telegram-bot-api";
import { User } from "../model/User.js";
import { capitalizeFirstLetterOfEachWord, getWeatherDetails, isCityExists, isValidCountry } from "../utils/weatherUtils.js";

let bot
export let isBotRunning = false;


export const startBotPolling = (telegramKey, weatherKey) => {
    if (!telegramKey) {
        throw new Error("telegram bot key is not there")
    }
    if (!weatherKey) {
        throw new Error("weather Key  is not there")
    }
    bot = new TelegramBot(telegramKey, { polling: true });
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

        // Check user's state
        if (msg.text) {
            const currentUser = userStates.get(userId);
            switch (currentUser?.status) {
                case "awaitingName":
                    // User is expected to provide their name
                    userStates.set(userId, { ...currentUser, status: "awaitingCountry", name: msg.text }); // Transition to the next state
                    bot.sendMessage(chatId, `Awesome ${msg.text}! What country are you from?`);
                    break;

                case "awaitingCountry":
                    // User is expected to provide their country
                    if (!isValidCountry(msg.text)) {
                        // if the country is not valid
                        bot.sendMessage(chatId, `Oops! There is no country named ${msg.text}. Please enter a valid country.`);
                        break;
                    }
                    userStates.set(userId, { ...currentUser, status: "awaitingCity", country: msg.text }); // Transition to the next state
                    bot.sendMessage(chatId, `Great, ${currentUser.name}! What city are you from?`);
                    break;

                case "awaitingCity":
                    // User is expected to provide their city
                    const isCityValid = await isCityExists(msg.text, weatherKey);
                    if (!isCityValid) {
                        //if the city is not valid
                        bot.sendMessage(chatId, 'Sorry, the entered city does not exist. Please provide a valid city.');
                        break;
                    }

                    bot.sendMessage(chatId, `Thank you! Your information has been saved.`);
                    const newUser = new User({
                        userId,
                        name: currentUser.name.toLowerCase(),
                        country: currentUser.country.toLowerCase(),
                        city: msg.text.toLowerCase(),
                    });

                    await newUser.save();
                    userStates.delete(userId); // End the conversation by removing user state

                    // Send the current weather update
                    const weatherDetails = await getWeatherDetails(newUser.city, weatherKey);
                    if (weatherDetails) {
                        // Convert temperature from Kelvin to Celsius
                        const temperatureCelsius = weatherDetails.main.temp - 273.15;

                        // Extract additional relevant information from weatherDetails
                        const humidity = weatherDetails.main.humidity;
                        const windSpeed = weatherDetails.wind.speed;
                        const pressure = weatherDetails.main.pressure;

                        // Extract weather description
                        const weatherDescription = weatherDetails.weather[0].description;

                        // Send a message with more details
                        bot.sendMessage(chatId,
                            `Here's the current weather in ${newUser.city}:\nTemperature: ${temperatureCelsius.toFixed(2)}°C\nDescription: ${weatherDescription} \nHumidity: ${humidity}%\nWind Speed: ${windSpeed} m/s\nAtmospheric Pressure: ${pressure} hPa`
                        );
                    }
                    break;
                default:
                    // Handle unexpected state or user-specific logic
                    break;
            }
        } else {
            bot.sendMessage(chatId, "This Bot exclusively accepts text messages.")
        }
    });
    isBotRunning = true;

};


export const stopBotPolling = () => {
    if (bot) {
        bot.stopPolling();
        isBotRunning = false;
        return "bot stopped"
    } else {
        return "bot is not running"
    }
}