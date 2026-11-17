import mongoose, { Schema } from "mongoose";
const sessionSchema = new Schema({
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
}, { timestamps: true });
sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ userId: 1, status: 1, startTime: 1 });
export default mongoose.model("Session", sessionSchema);
