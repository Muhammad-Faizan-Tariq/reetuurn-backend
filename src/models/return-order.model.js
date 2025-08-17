import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
    },
    dimensions: {
      type: String,
      required: [true, "Dimensions are required"],
      validate: {
        validator: (v) => /^\d+x\d+x\d+( cm)?$/.test(v),
        message:
          'Dimensions must be in WxHxD format (e.g. "15x12x9" or "15x12x9 cm")',
      },
    },
    labelAttached: {
      type: Boolean,
      default: false,
      required: [true, "Label attachment status is required"],
    },
    carrier: {
      type: String,
      enum: ["PostAT", "DHL", "Hermes", "DPD", "UPS", "GLS"],
      required: [true, "Carrier is required"],
    },
  },
  { _id: false }
);

const pickupAddressSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: [true, "Building information is required"],
      trim: true,
    },
    floor: { type: String, trim: true },
    doorNumber: { type: String, trim: true },
    directions: {
      type: String,
      maxlength: [100, "Directions cannot exceed 100 characters"],
      trim: true,
    },
    contactPhone: {
      type: String,
      validate: {
        validator: (v) => /^\+?[\d\s-]{6,20}$/.test(v),
        message: "Invalid phone number format",
      },
    },
  },
  { _id: false }
);

const returnOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: [true, "User reference is required"],
      index: true,
    },
    pickupAddress: {
      type: pickupAddressSchema,
      required: [true, "Pickup address is required"],
    },
    packages: {
      type: [packageSchema],
      required: [true, "At least one package is required"],
    },
    schedule: {
      date: { type: Date, required: [true, "Schedule date is required"] },
      timeWindow: {
        start: { type: String, required: [true, "Start time is required"] },
        end: { type: String, required: [true, "End time is required"] },
      },
    },
    payment: {
      method: {
        type: String,
        required: [true, "Payment method is required"],
        default: "stripe_card",
      },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "EUR" },
      status: { type: String, default: "pending" },
      paidAt: Date,
    },
    status: {
      type: String,
      enum: ["draft", "pending", "scheduled", "picked_up", "cancelled"],
      default: "draft",
    },
    metadata: {
      orderNumber: {
        type: String,
        unique: true,
        index: true,
        default: () => `RTN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      },
      pickupPIN: {
        type: String,
        minlength: 4,
        maxlength: 4,
        match: [/^\d{4}$/, "PIN must contain only digits"],
        default: () => Math.floor(1000 + Math.random() * 9000).toString(),
      },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

returnOrderSchema.pre("save", function (next) {
  const prices = { small: 2.9, medium: 3.2, large: 3.6 };
  if (this.isModified("packages") || this.isNew) {
    this.payment.amount = this.packages.reduce(
      (sum, pkg) => sum + (prices[pkg.size] || 0),
      0
    );
  }
  next();
});

returnOrderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const allowedTransitions = {
      draft: ["pending", "cancelled"],
      pending: ["scheduled", "cancelled"],
      scheduled: ["picked_up", "cancelled"],
      picked_up: [],
      cancelled: [],
    };

    const previousStatus = this.isNew
      ? "draft"
      : this.$__.priorDoc?.status || this.get("status");

    if (!allowedTransitions[previousStatus]?.includes(this.status)) {
      return next(
        new Error(
          `Invalid status transition from ${previousStatus} to ${this.status}`
        )
      );
    }

    if (this.status === "picked_up") {
      this.payment.status = "completed";
      this.payment.paidAt = new Date();
    }
  }
  next();
});

returnOrderSchema.index({ "metadata.orderNumber": 1 });
returnOrderSchema.index({ status: 1 });
returnOrderSchema.index({ user: 1, status: 1 });
returnOrderSchema.index({ "schedule.date": 1 });
returnOrderSchema.index({ "payment.status": 1 });

returnOrderSchema.virtual("formattedAddress").get(function () {
  return [
    this.pickupAddress.building,
    this.pickupAddress.floor && `Floor ${this.pickupAddress.floor}`,
    this.pickupAddress.doorNumber && `Door ${this.pickupAddress.doorNumber}`,
    this.pickupAddress.directions,
  ]
    .filter(Boolean)
    .join(", ");
});

export default mongoose.model("ReturnOrder", returnOrderSchema);
