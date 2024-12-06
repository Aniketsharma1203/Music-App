import mongoose from "mongoose";

let db; 

export const connectToMongoDB = async (url) => {
    try {
        const connection = await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        db = connection.connection.db;
        console.log("Connected to MongoDB successfully");
        return db;
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};

export const getDb = () => {
    if (!db) {
        throw new Error("Database not initialized. Call connectToMongoDB first.");
    }
    return db;
};
