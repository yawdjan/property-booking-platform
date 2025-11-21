import { User, Booking, Commission } from '../models/index.js';
import { sendEmail } from '../utils/email.js';

export const getAllAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: { role: 'agent' },
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: agents.length,
      data: agents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAgent = async (req, res) => {
  try {
    const agent = await User.findOne({
      where: { id: req.params.id, role: 'agent' },
      attributes: { exclude: ['password'] }
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent statistics
    const bookings = await Booking.findAll({ where: { agentId: agent.id } });
    const commissions = await Commission.findAll({ where: { agentId: agent.id } });
    
    const totalBookings = bookings.length;
    const totalEarnings = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const pendingPayout = commissions
      .filter(c => c.status === 'Pending Payout')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        ...agent.toJSON(),
        statistics: {
          totalBookings,
          totalEarnings,
          pendingPayout
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const approveAgent = async (req, res) => {
  try {
    const agent = await User.findOne({
      where: { id: req.params.id, role: 'agent' }
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.update({ status: 'Active' });

    // Send approval email
    await sendEmail({
      to: agent.email,
      subject: 'Account Approved - PropBooking',
      text: `Hello ${agent.name},\n\nYour agent account has been approved! You can now log in and start booking properties.\n\nBest regards,\nPropBooking Team`
    });

    res.status(200).json({
      success: true,
      message: 'Agent approved successfully',
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const suspendAgent = async (req, res) => {
  try {
    const agent = await User.findOne({
      where: { id: req.params.id, role: 'agent' }
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.update({ status: 'Suspended' });

    res.status(200).json({
      success: true,
      message: 'Agent suspended successfully',
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCommissionRate = async (req, res) => {
  try {
    const { commissionRate } = req.body;
    
    const agent = await User.findOne({
      where: { id: req.params.id, role: 'agent' }
    });

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    await agent.update({ commissionRate: commissionRate || null });

    res.status(200).json({
      success: true,
      message: 'Commission rate updated successfully',
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};