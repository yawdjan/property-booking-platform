import crypto from 'crypto';

exports.generateReference = (prefix = 'ref') => {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
};

exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

exports.isExpired = (date) => {
  return new Date(date) < new Date();
};