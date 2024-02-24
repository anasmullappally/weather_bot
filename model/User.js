import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    name: String,
    city: String,
    country: String,
});
// { collection: "Users", timestamps: true }

export const User = mongoose.model('Users', userSchema);