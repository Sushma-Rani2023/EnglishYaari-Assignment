import mongoose from "mongoose";
import User from "../models/User.js";
import Session from "../models/Session.js";
import Teacher from "../models/Teacher.js";
import AppError from "../utils/AppError.js";
export const createSession = async (req, res, next) => {
    try {
        const { teacherId, startTime, endTime } = req.body ?? {};
        if (!mongoose.isValidObjectId(teacherId) ||
            !startTime ||
            !endTime) {
            throw new AppError("Invalid or missing input", 400);
        }
        const start = new Date(startTime);
        const end = new Date(endTime);
        if (isNaN(start.getTime()) ||
            isNaN(end.getTime()) ||
            end <= start) {
            throw new AppError("Invalid session time range", 400);
        }
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            throw new AppError("Teacher not found", 404);
        }
        const session = await Session.create({
            teacherId,
            startTime: start,
            endTime: end,
            status: "AVAILABLE"
        });
        res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: session
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAvailableSessions = async (req, res, next) => {
    try {
        const timestamp = Number(req.query.dateTimestamp);
        if (!Number.isFinite(timestamp) || timestamp <= 0) {
            throw new AppError("Valid dateTimestamp is required", 400);
        }
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
            throw new AppError("Invalid timestamp", 400);
        }
        // UTC day boundaries
        const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
        const sessions = await Session.aggregate([
            {
                $match: {
                    status: "AVAILABLE",
                    startTime: {
                        $gte: startOfDay,
                        $lt: endOfDay
                    }
                }
            },
            {
                $lookup: {
                    from: "teachers",
                    localField: "teacherId",
                    foreignField: "_id",
                    as: "teacher"
                }
            },
            {
                $unwind: "$teacher"
            },
            {
                $project: {
                    teacherId: 1,
                    startTime: 1,
                    endTime: 1,
                    status: 1,
                    "teacher.fullName": 1,
                    "teacher.email": 1,
                    "teacher.specialization": 1,
                    "teacher.experience": 1
                }
            },
            {
                $sort: {
                    startTime: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    }
    catch (error) {
        next(error);
    }
};
export const bookSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { userId } = req.body ?? {};
        if (!mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(userId)) {
            throw new AppError("Invalid session or user ID", 400);
        }
        // 1. Check whether user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        // 2. Atomically book only an AVAILABLE session
        const session = await Session.findOneAndUpdate({
            _id: id,
            status: "AVAILABLE"
        }, {
            $set: {
                status: "BOOKED",
                userId: user._id
            }
        }, {
            new: true,
            runValidators: true
        });
        if (!session) {
            const existingSession = await Session.findById(id);
            if (!existingSession) {
                throw new AppError("Session not found", 404);
            }
            throw new AppError("Session is already booked or unavailable", 409);
        }
        res.status(200).json({
            success: true,
            message: "Session booked successfully",
            data: session
        });
    }
    catch (error) {
        next(error);
    }
};
export const completeSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError("Invalid session ID", 400);
        }
        const session = await Session.findOneAndUpdate({
            _id: id,
            status: "BOOKED"
        }, {
            $set: {
                status: "COMPLETED",
                completedAt: new Date()
            }
        }, {
            new: true,
            runValidators: true
        });
        if (!session) {
            const existingSession = await Session.findById(id);
            if (!existingSession) {
                throw new AppError("Session not found", 404);
            }
            throw new AppError("Only BOOKED sessions can be completed", 409);
        }
        res.status(200).json({
            success: true,
            message: "Session completed successfully",
            data: session
        });
    }
    catch (error) {
        next(error);
    }
};
