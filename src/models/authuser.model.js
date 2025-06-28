import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
    code: String,
    expiry: Date
}, { _id: false });

const authUserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String,
        required: true
    },
    otp: otpSchema,
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    isPasswordSet: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true });

export default mongoose.model("AuthUser", authUserSchema);
