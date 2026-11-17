import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
    fullName: string;
    email: string;
    specialization: string;
    experience: number;
}

const teacherSchema = new Schema<ITeacher>(
    {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        specialization: {
            type: String,
            required: true
        },
        experience: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model<ITeacher>("Teacher", teacherSchema);