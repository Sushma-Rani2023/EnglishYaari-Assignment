import mongoose, { Schema } from "mongoose";
const teacherSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("Teacher", teacherSchema);
