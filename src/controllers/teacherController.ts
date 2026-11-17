import { Request, Response, NextFunction } from "express";
import Teacher from "../models/Teacher.js";
import AppError from "../utils/AppError.js";

export const createTeacher = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { fullName, email, specialization, experience } = req.body ?? {};

        if (!fullName || !email || !specialization || experience === undefined) {
            throw new AppError("All fields are required", 400);
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
    return res.status(400).json({
        success: false,
        message: "Invalid email format"
    });
}

        const existingTeacher = await Teacher.findOne({ email });

        if (existingTeacher) {
            throw new AppError("Teacher email already exists", 409);
        }

        const teacher = await Teacher.create({
            fullName,
            email,
            specialization,
            experience
        });

        res.status(201).json({
            success: true,
            message: "Teacher created successfully",
            data: teacher
        });

    } catch (error) {
        next(error);
    }
};