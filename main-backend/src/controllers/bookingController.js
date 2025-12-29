import { Booking, Property, User, Commission } from '../models/index.js';
import axios from 'axios';
import config from '../config/config.js';
import { calculateCommissionRate } from '../utils/helpers.js';
import { Op } from 'sequelize';

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAgentBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { agentId: req.params.agentId },
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBooking = async (req, res) => {
  try {
    await updateExpiredBookings(req, res); // Ensure booking statuses are up-to-date

    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: Property, as: 'property' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { propertyId, checkIn, checkOut, clientEmail } = req.body;
    const agentId = req.user.id;

    // Validate check-in date/time
    const now = new Date();
    const checkInDate = new Date(checkIn);
    const currentHour = now.getHours();
    const todayStr = now.toISOString().split('T')[0];
    const checkInStr = checkIn; // Already in YYYY-MM-DD format

    // Check if trying to book for today
    if (checkInStr === todayStr) {
      // Allow only if it's before 2 PM
      if (currentHour >= 14) {
        return res.status(400).json({
          success: false,
          message: 'Same-day bookings are only allowed before 2:00 PM. Please select tomorrow or a later date.'
        });
      }
    } else if (checkInDate < now) {
      // Don't allow past dates
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }

    // Get property details
    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check availability
    const conflictingBooking = await Booking.findOne({
      where: {
        propertyId,
        status: { [Op.in]: ['Pending Payment', 'Booked'] },
        [Op.or]: [
          {
            checkIn: { [Op.between]: [checkIn, checkOut] }
          },
          {
            checkOut: { [Op.between]: [checkIn, checkOut] }
          },
          {
            [Op.and]: [
              { checkIn: { [Op.lte]: checkIn } },
              { checkOut: { [Op.gte]: checkOut } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Property is not available for selected dates'
      });
    }

    // Calculate booking details
    const numberOfNights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));

    // ✅ Parse values as floats BEFORE calculation
    const nightlyRate = parseFloat(property.nightlyRate) || 0;
    const cleaningFee = parseFloat(property.cleaningFee) || 0;
    const totalAmount = (nightlyRate * numberOfNights) + cleaningFee;

    // Get commission rate (Agent -> Property -> Global)
    const commissionRate = calculateCommissionRate(req.user, property);
    const commissionAmount = (totalAmount * commissionRate) / 100;

    // Create booking
    const booking = await Booking.create({
      propertyId,
      agentId,
      clientEmail,
      checkIn,
      checkOut,
      numberOfNights,
      nightlyRate: property.nightlyRate,
      cleaningFee: property.cleaningFee,
      totalAmount,
      commissionRate,
      commissionAmount,
      status: 'Pending Payment',
      paymentLinkExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Generate payment link via Payment Backend
    try {
      const paymentResponse = await axios.post(`${config.paymentApiUrl}/payments/create-link`, {
        bookingId: booking.id,
        amount: totalAmount,
        clientEmail,
        propertyName: property.name,
        checkIn,
        checkOut
      });

      // ✅ Update booking with BOTH payment link ID AND payment URL
      await booking.update({
        paymentLinkId: paymentResponse.data.data.linkId,
        paymentUrl: paymentResponse.data.data.paymentLink  // ← ADD THIS
      });

      res.status(201).json({
        success: true,
        data: {
          booking,
          paymentLink: paymentResponse.data.data.paymentLink
        }
      });
    } catch (paymentError) {
      // Rollback booking if payment link generation fails
      await booking.destroy();
      throw paymentError;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow agent who created booking or admin to update
    if (req.user.role !== 'admin' && booking.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    const { checkIn, checkOut } = req.body;

    if (checkIn || checkOut) {
      // Recalculate booking if dates changed
      const property = await Property.findByPk(booking.propertyId);
      const newCheckIn = checkIn || booking.checkIn;
      const newCheckOut = checkOut || booking.checkOut;

      const totalAmount = (property.nightlyRate * numberOfNights) + property.cleaningFee;
      const commissionAmount = (totalAmount * booking.commissionRate) / 100;

      await booking.update({
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        numberOfNights,
        totalAmount,
        commissionAmount
      });

      // Update commission if already created
      const commission = await Commission.findOne({ where: { bookingId: booking.id } });
      if (commission) {
        await commission.update({ amount: commissionAmount });
      }
    } else {
      await booking.update(req.body);
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateExpiredBookings = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await Booking.updateMany(
      {
        status: 'Booked',
        checkOut: { $lt: today }
      },
      {
        $set: { status: 'Completed' }
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} bookings updated to Completed`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unavailableBookingDates = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { startDate, endDate } = req.query;

    console.log('Fetching unavailable dates for property:', propertyId);

    // Build the Sequelize query
    let whereClause = {
      propertyId,
      status: { [Op.in]: ['Booked', 'Pending Payment'] }
    };

    // Add date range filter if provided
    if (startDate && endDate) {
      whereClause[Op.or] = [
        // Booking starts within range
        { checkIn: { [Op.between]: [startDate, endDate] } },
        // Booking ends within range
        { checkOut: { [Op.between]: [startDate, endDate] } },
        // Booking spans the entire range
        {
          [Op.and]: [
            { checkIn: { [Op.lte]: startDate } },
            { checkOut: { [Op.gte]: endDate } }
          ]
        }
      ];
    }

    console.log('Query where clause:', JSON.stringify(whereClause, null, 2));

    // Execute the query using Sequelize
    const bookings = await Booking.findAll({
      where: whereClause,
      attributes: ['checkIn', 'checkOut'],
      order: [['checkIn', 'ASC']]
    });

    console.log('Found bookings:', bookings.length);

    // Generate array of unavailable dates
    const unavailableDates = [];

    bookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);

      // Include all dates from check-in to check-out (inclusive)
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        unavailableDates.push(date.toISOString().split('T')[0]);
      }
    });

    // Remove duplicates
    const uniqueDates = [...new Set(unavailableDates)];

    console.log('Unavailable dates count:', uniqueDates.length);

    res.json({
      success: true,
      propertyId,
      unavailableDates: uniqueDates,
      bookingCount: bookings.length
    });

  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unavailable dates',
      error: error.message
    });
  }
};

export const unavailableBookingRanges = async (req, res) => {
  try {
    const { propertyId } = req.params;

    console.log('Fetching unavailable ranges for property:', propertyId);

    // Execute the query using Sequelize
    const bookings = await Booking.findAll({
      where: {
        propertyId,
        status: { [Op.in]: ['Booked', 'Pending Payment'] }
      },
      attributes: ['checkIn', 'checkOut', 'clientEmail'],
      order: [['checkIn', 'ASC']]
    });

    console.log('Found bookings:', bookings.length);

    const unavailableRanges = bookings.map(booking => ({
      start: booking.checkIn,
      end: booking.checkOut,
      clientEmail: booking.clientEmail
    }));

    res.json({
      success: true,
      propertyId,
      unavailableRanges
    });

  } catch (error) {
    console.error('Error fetching unavailable ranges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unavailable ranges',
      error: error.message
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Only allow agent who created booking or admin to cancel
    if (req.user.role !== 'admin' && booking.agentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    await booking.update({
      status: 'Cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.user.id
    });

    // Delete commission if exists
    await Commission.destroy({ where: { bookingId: booking.id } });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Called by Payment Backend webhook
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentId } = req.body;

    console.log('💳 Payment confirmation received for booking:', bookingId, 'payment:', paymentId);

    const booking = await Booking.findByPk(bookingId);

    if (!booking) {
      console.error('❌ Booking not found:', bookingId);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    console.log('📋 Current booking status:', booking.status);

    // ✅ Check if already confirmed
    if (booking.status === 'Confirmed' || booking.status === 'Completed' || booking.status === 'Booked') {
      console.log('ℹ️ Booking already confirmed');
      return res.status(200).json({
        success: true,
        message: 'Payment already confirmed'
      });
    }

    // Update booking status
    const updatedBooking = await booking.update({
      status: 'Booked',
      paymentId
    });

    console.log('✅ Booking status updated to Confirmed:', updatedBooking.id);

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status
      }
    });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};