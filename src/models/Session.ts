import mongoose, { Schema, Document } from "mongoose";

export type SessionStatus =
    | "AVAILABLE"
    | "BOOKED"
    | "COMPLETED";

export interface ISession extends Document {
    teacherId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId | null;
    startTime: Date;
    endTime: Date;
    status: SessionStatus;
    completedAt: Date | null;
}

const sessionSchema = new Schema<ISession>(
    {
        teacherId: {
            type: Schema.Types.ObjectId,
            ref: "Teacher",
            required: true
        },

        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        startTime: {
            type: Date,
            required: true
        },

        endTime: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["AVAILABLE", "BOOKED", "COMPLETED"],
            default: "AVAILABLE"
        },

        completedAt: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ userId: 1, status: 1, startTime: 1 });

export default mongoose.model<ISession>("Session", sessionSchema);