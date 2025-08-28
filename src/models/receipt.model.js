import mongoose from "mongoose";

const returnReceiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
    returnOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReturnOrder",
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    receiptUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

returnReceiptSchema.index({ user: 1, createdAt: -1 });


returnReceiptSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("ReturnReceipt", returnReceiptSchema);
