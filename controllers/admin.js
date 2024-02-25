import { isBotRunning, startBotPolling, stopBotPolling } from "../bot/bot.js";
import { ApiKey } from "../model/ApiKeys.js";

export const home = async (req, res) => {
    try {
        return res.render('home', { pageTitle: 'Home', isBotRunning });
    } catch (error) {
        return res.render('server-error', { pageTitle: 'server error' });
    }
}


export const startBot = async (req, res) => {
    try {
        const botApi = await ApiKey.findOne({ service: "telegram" })
        const weatherApi = await ApiKey.findOne({ service: "weather" })

        if (!botApi) {
            return res.status(400).json({ message: 'Please add the Bot API key before starting.' });
        }

        if (!weatherApi) {
            return res.status(400).json({ message: 'Please add the Weather API key before starting.' });
        }

        // If both keys are present, proceed with your logic
        console.log('Starting the bot...', botApi.key, weatherApi.key);
        // Your additional logic here
        startBotPolling(botApi.key, weatherApi.key)
        // Send a success response if everything is okay
        return res.status(200).json({ message: "Bot started successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const stopBot = async (req, res) => {
    try {
        const data = await stopBotPolling()
        console.log(data);
        return res.status(200).json({ message: "Bot stopped successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
}


export const api = async (req, res) => {
    try {
        const botAPI = await ApiKey.findOne({ service: "telegram" }).lean()
        const weatherAPI = await ApiKey.findOne({ service: "weather" }).lean()
        return res.render("api", { botAPI, weatherAPI })
    } catch (error) {
        return res.render('server-error', { pageTitle: 'server error' });
    }
}

export const addAPIKeys = async (req, res) => {
    try {
        const { botApi, weatherApi } = req.body
        if (!botApi) {
            return res.status(400).json({ message: 'Please add the telegram bot API key' });
        }
        if (!weatherApi) {
            return res.status(400).json({ message: 'Please add the Weather API key' });
        }

        const telegramKeyExist = await ApiKey.exists({ service: "telegram" })
        if (telegramKeyExist) {
            return res.status(400).json({ message: 'telegram key already exist, please  key' });
        }
        const weatherKeyExist = await ApiKey.exists({ service: "weather" })
        if (weatherKeyExist) {
            return res.status(400).json({ message: 'weather key already exist, please update the key' });
        }

        const newAPIKeysData = [
            {
                service: "telegram",
                key: botApi
            },
            {
                service: "weather",
                key: weatherApi
            }
        ];

        await ApiKey.create(newAPIKeysData)
        return res.status(201).json({ message: "API Keys added successfully " })

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const updateAPIKeys = async (req, res) => {
    try {
        const { botApi, weatherApi } = req.body
        if (!botApi) {
            return res.status(400).json({ message: 'Please add the telegram bot API key' });
        }
        if (!weatherApi) {
            return res.status(400).json({ message: 'Please add the Weather API key' });
        }
        await ApiKey.findOneAndUpdate({ service: "telegram" }, { key: botApi }, { new: true });
        await ApiKey.findOneAndUpdate({ service: "weather" }, { key: weatherApi }, { new: true });

        return res.status(200).json({ message: "API Keys updated successfully " })
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}