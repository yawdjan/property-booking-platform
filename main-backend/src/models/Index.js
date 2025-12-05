import User from './User.js';
import Property from './Property.js';
import Booking from './Booking.js';
import Commission from './Commission.js';
import PayoutRequest from './PayoutRequests.js';

// Booking associations
Booking.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
Booking.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

// Commission associations
Commission.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Commission.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
Commission.belongsTo(User, { foreignKey: 'paidBy', as: 'paidByUser' });
Commission.belongsTo(Property, { foreignKey: 'propertyId' });

// PayoutRequest associations
PayoutRequest.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
PayoutRequest.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

// Property associations
Property.hasMany(Booking, { foreignKey: 'propertyId' });

// User associations
User.hasMany(Booking, { foreignKey: 'agentId' });
User.hasMany(Commission, { foreignKey: 'agentId', as: 'commissions' });
User.hasMany(PayoutRequest, { foreignKey: 'agentId', as: 'payoutRequests' });
User.hasMany(PayoutRequest, { foreignKey: 'processedBy', as: 'processedPayouts' });

// Booking associations (reverse)
Booking.hasOne(Commission, { foreignKey: 'bookingId' });

export {
  User,
  Property,
  Booking,
  Commission,
  PayoutRequest
};