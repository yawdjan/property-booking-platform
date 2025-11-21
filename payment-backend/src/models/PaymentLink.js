import mongoose from 'mongoose';

const paymentLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  clientEmail: {
    type: String,
    required: true
  },
  propertyName: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: true
  },
  paymentUrl: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Active', 'Paid', 'Expired', 'Cancelled'],
    default: 'Active'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  paidAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
// paymentLinkSchema.index({ bookingId: 1 });
// paymentLinkSchema.index({ reference: 1 });
// paymentLinkSchema.index({ expiresAt: 1 });

export default mongoose.model('PaymentLink', paymentLinkSchema);