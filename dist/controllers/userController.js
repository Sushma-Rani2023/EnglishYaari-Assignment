import User from "../models/User.js";
import Session from "../models/Session.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";
export const createUser = async (req, res, next) => {
    try {
        const { fullName, email, phone } = req.body ?? {};
        if (!fullName || !email || !phone) {
            throw new AppError("All fields are required", 400);
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError("Email already registered", 409);
        }
        const user = await User.create({
            fullName,
            email,
            phone
        });
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};
export const getUserSessions = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            throw new Error("Invalid ID");
        }
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError("Invalid user ID", 400);
        }
        const user = await User.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        const now = new Date();
        const result = await Session.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(id)
                }
            },
            {
                $facet: {
                    upcomingSessions: [
                        {
                            $match: {
                                status: "BOOKED",
                                startTime: { $gte: now }
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
                            $sort: { startTime: 1 }
                        },
                        {
                            $project: {
                                startTime: 1,
                                endTime: 1,
                                status: 1,
                                "teacher.fullName": 1,
                                "teacher.specialization": 1
                            }
                        }
                    ],
                    completedSessions: [
                        {
                            $match: {
                                status: "COMPLETED"
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
                            $sort: { completedAt: -1 }
                        },
                        {
                            $project: {
                                startTime: 1,
                                endTime: 1,
                                status: 1,
                                completedAt: 1,
                                "teacher.fullName": 1,
                                "teacher.specialization": 1
                            }
                        }
                    ]
                }
            }
        ]);
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            },
            data: result[0] || {
                upcomingSessions: [],
                completedSessions: []
            }
        });
    }
    catch (error) {
        next(error);
    }
};
