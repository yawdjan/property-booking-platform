import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nightlyRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  cleaningFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Property default commission rate'
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  amenities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  maxGuests: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active'
  }
}, {
  timestamps: true
});

export default Property;