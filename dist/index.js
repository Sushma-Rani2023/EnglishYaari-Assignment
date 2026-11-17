import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoute.js";
import sessionRoutes from "./routes/sessionRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// API routes
app.use("/users", userRoutes);
app.use("/sessions", sessionRoutes);
// Centralized error handler (must be after routes)
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
startServer();
