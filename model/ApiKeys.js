import mongoose from "mongoose";

const apiKeysSchema = new mongoose.Schema({
    service: { type: String, required: true },
    key: { type: String, required: true },

}, { collection: "ApiKeys", timestamps: true });

export const ApiKey = mongoose.model('ApiKeys', apiKeysSchema);