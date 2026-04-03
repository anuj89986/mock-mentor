import mongoose from "mongoose";

type ConnectionObject = {
    isConnected ?: number;
}

const connection: ConnectionObject = {};

async function dbConnect() : Promise<void>{
    if(connection.isConnected){
        console.log("Already connected to MongoDB");
        return;
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URL || "");
        connection.isConnected = 1;
        console.log("Database is connected Successfully");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

export default dbConnect;