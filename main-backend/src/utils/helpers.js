import config from '../config/config.js';

export const calculateCommissionRate = (agent, property) => {
  // Option B: Agent-specific → Property default → Global default
  if (agent && agent.commissionRate !== null && agent.commissionRate !== undefined) {
    return agent.commissionRate;
  }
  if (property && property.commissionRate) {
    return property.commissionRate;
  }
  return config.globalCommissionRate;
};

export const calculateNights = (checkIn, checkOut) => {
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};