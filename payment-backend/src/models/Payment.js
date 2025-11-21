import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  linkId: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  clientEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed'],
    default: 'Pending'
  },
  paystackReference: {
    type: String
  },
  paystackResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  gatewayResponse: {
    type: String
  },
  paidAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
// paymentSchema.index({ bookingId: 1 });
// paymentSchema.index({ reference: 1 });
// paymentSchema.index({ paystackReference: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;