import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    block: { type: Boolean, default: false }

}, { collection: "Users", timestamps: true });

export const User = mongoose.model('Users', userSchema);