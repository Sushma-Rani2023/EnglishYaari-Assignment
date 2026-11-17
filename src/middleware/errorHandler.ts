import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    if ((err as any).code === 11000) {
        return res.status(409).json({
            success: false,
            message: "Duplicate email already exists"
        });
    }

    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
};