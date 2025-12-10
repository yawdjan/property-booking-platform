import { Booking, User } from '../models/index.js';
import { Op } from 'sequelize';

export const getAvailability = async (req, res) => {
  try {
    const { propertyId, start, end } = req.query;

    const bookings = await Booking.findAll({
      where: {
        propertyId,
        status: { [Op.in]: ['Pending Payment', 'Booked'] },
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
      attributes: ['id', 'checkIn', 'checkOut', 'status', 'agentId', 'clientEmail'],
      include: [
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] }
      ]
    });

    // Expand each booking into individual per-day entries (date + agent info)
    const perDay = [];
    bookings.forEach(b => {
      const start = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        perDay.push({
          date: d.toISOString().split('T')[0],
          bookingId: b.id,
          status: b.status,
          clientEmail: b.clientEmail,
          agent: b.agent ? { id: b.agent.id, name: b.agent.name, email: b.agent.email } : null
        });
      }
    });

    // Remove duplicate dates (keep first occurrence)
    const seen = new Set();
    const uniquePerDay = perDay.filter(entry => {
      if (seen.has(entry.date)) return false;
      seen.add(entry.date);
      return true;
    });

    res.status(200).json({
      success: true,
      propertyId,
      bookedDates: uniquePerDay,
      bookingCount: bookings.length
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
      status: 'Booked'
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