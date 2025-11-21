import { Booking } from '../models/index.js';
import { Op } from 'sequelize';

export const getAvailability = async (req, res) => {
  try {
    const { propertyId, start, end } = req.query;

    const bookings = await Booking.findAll({
      where: {
        propertyId,
        status: { [Op.in]: ['Pending Payment', 'Confirmed'] },
        [Op.or]: [
          {
            checkIn: { [Op.between]: [start, end] }
          },
          {
            checkOut: { [Op.between]: [start, end] }
          },
          {
            [Op.and]: [
              { checkIn: { [Op.lte]: start } },
              { checkOut: { [Op.gte]: end } }
            ]
          }
        ]
      },
      attributes: ['checkIn', 'checkOut', 'status']
    });

    res.status(200).json({
      success: true,
      data: {
        bookedDates: bookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const blockDates = async (req, res) => {
  try {
    const { propertyId, dates } = req.body;

    // Create blocked bookings (admin only)
    const blockedBookings = dates.map(date => ({
      propertyId,
      agentId: req.user.id,
      clientEmail: 'admin@blocked.com',
      checkIn: date,
      checkOut: date,
      numberOfNights: 0,
      nightlyRate: 0,
      cleaningFee: 0,
      totalAmount: 0,
      commissionRate: 0,
      commissionAmount: 0,
      status: 'Confirmed'
    }));

    await Booking.bulkCreate(blockedBookings);

    res.status(200).json({
      success: true,
      message: 'Dates blocked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};