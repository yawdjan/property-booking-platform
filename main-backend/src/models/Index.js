import User from './User.js';
import Property from './Property.js';
import Booking from './Booking.js';
import Commission from './Commission.js';

// Define associations
Booking.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
Booking.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

Commission.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Commission.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });

Property.hasMany(Booking, { foreignKey: 'propertyId' });
User.hasMany(Booking, { foreignKey: 'agentId' });
User.hasMany(Commission, { foreignKey: 'agentId' });

export {
  User,
  Property,
  Booking,
  Commission
};