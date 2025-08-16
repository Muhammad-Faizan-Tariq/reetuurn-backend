import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: [true, 'Package size is required']
  },
  dimensions: {
    type: String,
    required: [true, 'Dimensions are required'],
    validate: {
      validator: v => /^\d+x\d+x\d+$/.test(v),
      message: 'Dimensions must be in WxHxD format (e.g. "15x12x9")'
    }
  },
  labelAttached: {
    type: Boolean,
    default: false,
    required: [true, 'Label attachment status is required']
  },
  carrier: {
    type: String,
    enum: ['PostAT', 'DHL', 'Hermes', 'DPD', 'UPS', 'GLS'],
    required: [true, 'Carrier is required']
  }
}, { _id: false });

const pickupAddressSchema = new mongoose.Schema({
  building: { 
    type: String, 
    required: [true, 'Building information is required'],
    trim: true
  },
  floor: { 
    type: String,
    trim: true
  },
  doorNumber: { 
    type: String,
    trim: true
  },
  directions: { 
    type: String, 
    maxlength: [100, 'Directions cannot exceed 100 characters'],
    trim: true
  },
  contactPhone: {
    type: String,
    validate: {
      validator: v => /^\+?[\d\s-]{6,20}$/.test(v),
      message: 'Invalid phone number format'
    }
  }
}, { _id: false });

const returnOrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser',
    required: [true, 'User reference is required'],
    index: true
  },
  pickupAddress: {
    type: pickupAddressSchema,
    required: [true, 'Pickup address is required']
  },
  packages: {
    type: [packageSchema],
    validate: {
      validator: v => Array.isArray(v) && v.length > 0 && v.length <= 10,
      message: '1-10 packages required'
    },
    required: [true, 'At least one package is required']
  },
  schedule: {
    date: {
      type: Date,
      required: [true, 'Pickup date is required'],
      validate: {
        validator: v => v >= new Date(Date.now() - 86400000), 
        message: 'Pickup date must be today or in the future'
      }
    },
    timeWindow: {
      start: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'],
        required: [true, 'Start time is required']
      },
      end: {
        type: String,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'],
        required: [true, 'End time is required'],
        validate: {
          validator: function(v) {
            const start = parseInt(this.parent.start.replace(':', ''));
            const end = parseInt(v.replace(':', ''));
            return end > start && (end - start) >= 200; 
          },
          message: 'End time must be at least 2 hours after start time'
        }
      }
    }
  },
  payment: {
    method: {
      type: String,
      enum: {
        values: ['stripe', 'paypal'],
        message: 'Supported methods: stripe, paypal'
      },
      default: 'stripe'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      enum: ['EUR', 'USD'],
      default: 'EUR'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: {
      type: String,
      index: true
    },
    paidAt: Date,
    receiptUrl: String
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'scheduled', 'picked_up', 'cancelled'],
    default: 'draft'
  },
  metadata: {
    orderNumber: {
      type: String,
      unique: true,
      index: true,
      default: function() {
        return `RTN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
    },
    pickupPIN: {
      type: String,
      minlength: [4, 'PIN must be 4 digits'],
      maxlength: [4, 'PIN must be 4 digits'],
      match: [/^\d{4}$/, 'PIN must contain only digits'],
      default: function() {
        return Math.floor(1000 + Math.random() * 9000).toString();
      }
    }
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

returnOrderSchema.pre('save', function(next) {
  const prices = { small: 2.9, medium: 3.2, large: 3.6 };
  
  if (this.isModified('packages') || this.isNew) {
    this.payment.amount = this.packages.reduce(
      (sum, pkg) => sum + (prices[pkg.size] || 0),
      0
    );
  }

  next();
});

returnOrderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const allowedTransitions = {
      draft: ['pending', 'cancelled'],
      pending: ['scheduled', 'cancelled'],
      scheduled: ['picked_up', 'cancelled'],
      picked_up: [],
      cancelled: []
    };

    const previousStatus = this.previous('status') || 'draft';
    
    if (!allowedTransitions[previousStatus]?.includes(this.status)) {
      return next(new Error(`Invalid status transition from ${previousStatus} to ${this.status}`));
    }

    if (this.status === 'picked_up') {
      this.payment.status = 'completed';
      this.payment.paidAt = new Date();
    }
  }
  next();
});

returnOrderSchema.index({ 'metadata.orderNumber': 1 });
returnOrderSchema.index({ status: 1 });
returnOrderSchema.index({ user: 1, status: 1 });
returnOrderSchema.index({ 'schedule.date': 1 });
returnOrderSchema.index({ 'payment.status': 1 });

returnOrderSchema.virtual('formattedAddress').get(function() {
  return [
    this.pickupAddress.building,
    this.pickupAddress.floor && `Floor ${this.pickupAddress.floor}`,
    this.pickupAddress.doorNumber && `Door ${this.pickupAddress.doorNumber}`,
    this.pickupAddress.directions
  ].filter(Boolean).join(', ');
});

export default mongoose.model('ReturnOrder', returnOrderSchema);