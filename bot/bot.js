// bot.js
import TelegramBot from 'node-telegram-bot-api';
import { User } from '../model/User.js';
import { getWeatherDetails, isCityExists, isValidCountry } from '../utils/weatherUtils.js';
import schedule from 'node-schedule'

let bot, job
export let isBotRunning = false;


export const startBotPolling = (telegramKey, weatherKey, frequency) => {
    return new Promise((resolve, reject) => {
        if (!telegramKey) {
            reject(new Error('Telegram bot key is missing'));
            return;
        }
        if (!weatherKey) {
            reject(new Error('Weather key is missing'));
            return;
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
                userStates.set(userId, { status: 'awaitingName' }); // Set initial state
                bot.sendMessage(chatId, 'Welcome! What is your name?');
            } else if (existingUser.block) {
                bot.sendMessage(chatId, 'You have been restricted by the administrator.');
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
                    case 'awaitingName':
                        // User is expected to provide their name
                        userStates.set(userId, { ...currentUser, status: 'awaitingCity', name: msg.text }); // Transition to the next state
                        bot.sendMessage(chatId, `Great, ${msg.text}! Could you share which city you're currently in?`);
                        break;

                    case 'awaitingCity':
                        // User is expected to provide their country
                        const isCityValid = await isCityExists(msg.text, weatherKey);
                        if (!isCityValid) {
                            // If the city is not valid
                            bot.sendMessage(chatId, 'Sorry, the entered city does not exist. Please provide a valid city.');
                            break;
                        }
                        userStates.set(userId, { ...currentUser, status: 'awaitingCountry', city: msg.text }); // Transition to the next state
                        bot.sendMessage(chatId, `Awesome ${currentUser.name}! Can you tell me which country you're from?`);
                        break;

                    case 'awaitingCountry':
                        // User is expected to provide their city
                        if (!isValidCountry(msg.text)) {
                            // If the country is not valid
                            bot.sendMessage(chatId, `Oops! There is no country named ${msg.text}. Please enter a valid country.`);
                            break;
                        }

                        bot.sendMessage(chatId, `Thank you! Your information has been saved.`);
                        const newUser = new User({
                            userId,
                            name: currentUser.name.toLowerCase(),
                            city: currentUser.city.toLowerCase(),
                            country: msg.text.toLowerCase(),
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
                }
            } else {
                bot.sendMessage(chatId, 'This bot exclusively accepts text messages.');
            }
        });

        bot.onText(/\/weather/, async (msg) => {
            const chatId = msg.chat.id;
            const userId = msg.from.id;

            const existingUser = await User.findOne({ userId }).select('city block').lean();

            if (!existingUser) {
                // If the user doesn't exist, start the conversation
                userStates.set(userId, { status: 'awaitingName' }); // Set initial state
                bot.sendMessage(chatId, 'Welcome! What is your name?');
            } else if (existingUser.block) {
                bot.sendMessage(chatId, 'You have been restricted by the administrator.');
            } else {
                const weatherDetails = await getWeatherDetails(existingUser.city, weatherKey);
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
                        `Here's the current weather in ${existingUser.city}:\nTemperature: ${temperatureCelsius.toFixed(2)}°C\nDescription: ${weatherDescription} \nHumidity: ${humidity}%\nWind Speed: ${windSpeed} m/s\nAtmospheric Pressure: ${pressure} hPa`
                    );
                }
            }
        });

        const timesPerDay = frequency; // Number of times the job should run in a day
        const interval = Math.round(24 * 60 / timesPerDay); // Calculate the interval dynamically
        // Schedule a job to send weather updates to registered users at regular intervals
        job = schedule.scheduleJob(`*/${interval} * * * *`, async () => {
            const registeredUsers = await User.find({ block: false }).select('userId city').lean();

            registeredUsers.forEach(async (user) => {
                const weatherDetails = await getWeatherDetails(user.city, weatherKey);

                if (weatherDetails) {
                    const temperatureCelsius = weatherDetails.main.temp - 273.15;
                    const humidity = weatherDetails.main.humidity;
                    const windSpeed = weatherDetails.wind.speed;
                    const pressure = weatherDetails.main.pressure;
                    const weatherDescription = weatherDetails.weather[0].description;

                    bot.sendMessage(user.userId,
                        `Here's the weather update for ${user.city}:\nTemperature: ${temperatureCelsius.toFixed(2)}°C\nDescription: ${weatherDescription} \nHumidity: ${humidity}%\nWind Speed: ${windSpeed} m/s\nAtmospheric Pressure: ${pressure} hPa`
                    );
                }
            });
        });

        bot.on('polling_error', (error) => {
            reject(new Error(`Polling error: ${error.message}`));
        });

        bot.on('webhook_error', (error) => {
            reject(new Error(`Webhook error: ${error.message}`));
        });

        bot.on('error', (error) => {
            reject(new Error(`Bot error: ${error.message}`));
        });

        isBotRunning = true;
        // Resolve the promise if everything starts successfully
        resolve();
    });
};




export const stopBotPolling = () => {
    if (bot) {
        if (job) job.cancel();
        bot.stopPolling();
        isBotRunning = false;
        return 'bot stopped'
    } else {
        return 'bot is not running'
    }
}