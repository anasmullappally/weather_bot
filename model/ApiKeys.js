import mongoose from 'mongoose';

const apiKeysSchema = new mongoose.Schema({
    type: { type: String, default: "api-key" },
    telegram: { type: String, required: true },
    weather: { type: String, required: true },
    frequency: { type: Number, default: 1 }

}, { collection: 'ApiKeys', timestamps: true });

export const ApiKey = mongoose.model('ApiKeys', apiKeysSchema);