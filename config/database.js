import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        // Connection URI
        const uri = process.env.MONGO_URI;
        // Connect to MongoDB
        await mongoose.connect(uri);
        const connectedDbName = mongoose.connection.name;
        console.log('Connected to database:', connectedDbName);
        console.log("Database connected successfully")
    } catch (error) {
        console.log(error.message);
        process.exit(1);
    }
}