import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        await mongoose.connect(uri);
        const connectedDbName = mongoose.connection.name;
        console.log(`Database connected successfully\ndbName: ${connectedDbName} `)
    } catch (error) {
        process.exit(1);
    }
}