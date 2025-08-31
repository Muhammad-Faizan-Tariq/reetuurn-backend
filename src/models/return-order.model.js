import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    size: { type: String, enum: ["small", "medium", "large", "xlarge"], required: true },
    dimensions: {
      type: String,
      required: [true, "Dimensions are required"],
      validate: {
        validator: (v) => /^\d+x\d+x\d+( cm)?$/.test(v),
        message: 'Dimensions must be in WxHxD format (e.g. "15x12x9" or "15x12x9 cm")',
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
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const pickupAddressSchema = new mongoose.Schema(
  {
    building: { type: String, required: [true, "Building information is required"], trim: true },
    floor: { type: String, trim: true },
    doorNumber: { type: String, trim: true },
    directions: { type: String, maxlength: [100, "Directions cannot exceed 100 characters"], trim: true },
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

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["draft", "pending", "scheduled", "picked_up", "returned", "cancelled"],
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    notes: String,
  },
  { _id: false }
);

const returnOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: [true, "User reference is required"], index: true },
    pickupAddress: { type: pickupAddressSchema, required: [true, "Pickup address is required"] },
    packages: {
      type: [packageSchema],
      required: [true, "At least one package is required"],
      validate: { validator: (v) => Array.isArray(v) && v.length > 0, message: "At least one package is required" },
    },
    schedule: {
      date: { type: Date, required: [true, "Schedule date is required"] },
      timeWindow: {
        start: { type: String, required: [true, "Start time is required"] },
        end: { type: String, required: [true, "End time is required"] },
      },
    },
    payment: {
      method: { type: String, required: [true, "Payment method is required"], default: "stripe_card" },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "EUR" },
      status: { type: String, default: "pending" },
      paidAt: Date,
      stripePaymentIntentId: { type: String, index: true },
    },
    status: {
      type: String,
      enum: ["draft", "pending", "scheduled", "picked_up", "returned", "cancelled"],
      default: "draft",
    },
    statusHistory: [statusHistorySchema],
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
      trackingNumber: {
        type: String,
        unique: true,
        index: true,
        default: function () {
          return this.metadata.orderNumber;
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

returnOrderSchema.pre("save", function (next) {
  if (this.isModified("packages") || this.isNew) {
    const prices = { small: 4.99, medium: 6.99, large: 8.99 };
    this.payment.amount = this.packages.reduce((sum, pkg) => sum + (pkg.price || prices[pkg.size] || 0), 0);
  }
  next();
});

returnOrderSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    const allowedTransitions = {
      draft: ["pending", "cancelled"],
      pending: ["scheduled", "cancelled"],
      scheduled: ["picked_up", "cancelled"],
      picked_up: ["returned"],
      returned: [],
      cancelled: [],
    };

    const previousStatus = this.isNew ? "draft" : this.$__.priorDoc?.status || this.get("status");

    if (!allowedTransitions[previousStatus]?.includes(this.status)) {
      return next(new Error(`Invalid status transition from ${previousStatus} to ${this.status}`));
    }

    if (!this.statusHistory) this.statusHistory = [];
    this.statusHistory.push({
      status: this.status,
      notes: this.status === "cancelled" ? this.cancellationNotes : undefined,
    });

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
returnOrderSchema.index({ "metadata.trackingNumber": 1 });

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

returnOrderSchema.virtual("orderNumber").get(function () {
  return this.metadata?.orderNumber;
});

returnOrderSchema.virtual("trackingNumber").get(function () {
  return this.metadata?.trackingNumber;
});

returnOrderSchema.virtual("trackingInfo").get(function () {
  const currentStatus = this.status;
  const scheduled = this.statusHistory.find((s) => s.status === "scheduled");
  const pickedUp = this.statusHistory.find((s) => s.status === "picked_up");
  const returned = this.statusHistory.find((s) => s.status === "returned");
  const cancelled = this.statusHistory.find((s) => s.status === "cancelled");

  return {
    orderNumber: this.metadata.orderNumber,
    packages: this.packages,
    currentStatus,
    planned: scheduled ? { date: this.schedule.date, timeWindow: this.schedule.timeWindow } : null,
    pickedUp: pickedUp ? { date: pickedUp.changedAt } : null,
    returned: returned ? { date: returned.changedAt } : null,
    cancelled: cancelled ? { date: cancelled.changedAt, reason: cancelled.notes } : null,
    createdAt: this.createdAt,
  };
});

export default mongoose.model("ReturnOrder", returnOrderSchema);
