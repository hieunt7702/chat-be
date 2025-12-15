import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};


export default connectDB;