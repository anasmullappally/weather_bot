import { isBotRunning, startBotPolling, stopBotPolling } from '../bot/bot.js';
import { ApiKey } from '../model/ApiKeys.js';
import { User } from '../model/User.js';

export const getHome = async (req, res) => {
    try {
        return res.status(200).render('home', { pageTitle: 'Home', isBotRunning });
    } catch (error) {
        return res.status(500).render('server-error', { pageTitle: 'Internal Server Error' });
    }
}

export const startBot = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({ type: "api-key" });

        if (!apiKey) {
            return res.status(400).json({ message: 'Please add the necessary API key before proceeding.' });
        }

        await startBotPolling(apiKey.telegram, apiKey.weather, apiKey.frequency);

        return res.status(200).json({ message: 'Bot started successfully.' });

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};



export const stopBot = async (req, res) => {
    try {
        stopBotPolling()
        return res.status(200).json({ message: 'Bot has been successfully stopped.' });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


export const getApi = async (req, res) => {
    try {
        const apiKey = await ApiKey.findOne({ type: "api-key" }).lean();
        return res.status(200).render('api', { apiKey });
    } catch (error) {
        return res.status(500).render('server-error', { pageTitle: 'Internal Server Error' });
    }
};


export const addAPIKeys = async (req, res) => {
    try {
        const { botApi, weatherApi, frequency } = req.body;

        if (!botApi) {
            return res.status(400).json({ message: 'Please provide the Telegram bot API key.' });
        }

        if (!weatherApi) {
            return res.status(400).json({ message: 'Please provide the Weather API key.' });
        }

        if (!frequency) {
            return res.status(400).json({ message: 'Please provide the message frequency.' });
        }

        if (frequency <= 0) {
            return res.status(400).json({ message: 'Message frequency must be greater than zero.' });
        }

        const apiKeyExist = await ApiKey.exists({ type: "api-key" });

        if (apiKeyExist) {
            return res.status(400).json({ message: 'API keys already exist. Please update the keys.' });
        }

        const newApiKey = new ApiKey({
            telegram: botApi,
            weather: weatherApi,
            frequency: frequency
        })

        await newApiKey.save()
        return res.status(201).json({ message: 'API Keys added successfully ' })

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

export const updateAPIKeys = async (req, res) => {
    try {
        const { botApi, weatherApi, frequency } = req.body;

        if (!botApi) {
            return res.status(400).json({ message: 'Please provide the Telegram bot API key.' });
        }

        if (!weatherApi) {
            return res.status(400).json({ message: 'Please provide the Weather API key.' });
        }

        if (!frequency) {
            return res.status(400).json({ message: 'Please provide the message frequency.' });
        }

        if (frequency <= 0) {
            return res.status(400).json({ message: 'Message frequency must be greater than zero.' });
        }

        const apiKey = await ApiKey.findOne({ type: "api-key" });

        if (!apiKey) {
            return res.status(400).json({ message: 'API keys not found. Please add API keys before updating.' });
        }

        apiKey.telegram = botApi;
        apiKey.weather = weatherApi;
        apiKey.frequency = frequency;

        await apiKey.save();

        if (isBotRunning) {
            try {
                await stopBotPolling();
            } catch (error) {
                console.error("Error stopping the bot:", error);
                return res.status(500).json({ message: 'Error stopping the bot.' });
            }
        }
        try {
            await startBotPolling(apiKey.telegram, apiKey.weather, apiKey.frequency);
            return res.status(200).json({ message: `API keys updated successfully, Bot restarted` });
        } catch (error) {
            console.error("Error starting the bot:", error);
            return res.status(500).json({ message: 'Error starting the bot.' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};




export const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).lean()
        return res.status(200).render('users', { pageTitle: 'users', users })
    } catch (error) {
        return res.status(500).render('server-error', { pageTitle: 'Internal Server Error' });
    }
}

export const toggleBlock = async (req, res) => {
    try {
        const actions = ['block', 'unblock'];
        const { userId, action } = req.body;

        if (!userId || !action || !actions.includes(action)) {
            return res.status(400).json({ message: 'Required data is missing or invalid.' });
        }

        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        user.block = action === 'block';
        await user.save();

        return res.status(200).json({ message: `User ${action}ed successfully.` });
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error.' });
    }
};
