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
      subject: 'Account Approved - Omarey',
      text: `Hello ${agent.name},\n\nWelcome aboard! Your agent account is now live and ready for action.\n\nLog in to start exploring and booking our exclusive portfolio of short-let properties. Your next exceptional find is just a click away.
\n\nLet’s get started!\nThe Omarey Team.`
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

export const getAgentStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build booking where clause (only confirmed bookings by default)
    const where = { status: 'Confirmed' };

    if (startDate && endDate) {
      const { Op } = await import('sequelize');
      where[Op.or] = [
        { checkIn: { [Op.between]: [startDate, endDate] } },
        { checkOut: { [Op.between]: [startDate, endDate] } },
        { [Op.and]: [{ checkIn: { [Op.lte]: startDate } }, { checkOut: { [Op.gte]: endDate } }] }
      ];
    }

    // Fetch bookings with associated agent data
    const bookings = await Booking.findAll({
      where,
      include: [{ model: User, as: 'agent', attributes: ['id', 'name', 'email'] }]
    });

    // Include all agents even if they have zero bookings so frontend charts show every agent
    const agents = await User.findAll({ where: { role: 'agent' }, attributes: ['id', 'name', 'email'] });

    // Aggregate per-agent totals and counts, seeded with all agents at zero
    const map = new Map();
    agents.forEach(a => map.set(a.id, { agentId: a.id, name: a.name || a.email || a.id, totalAmount: 0, bookingCount: 0 }));

    bookings.forEach(b => {
      const agent = b.agent;
      const id = agent?.id || b.agentId || 'unknown';
      const name = agent?.name || agent?.email || 'Unknown';
      const total = parseFloat(b.totalAmount ?? 0) || 0;

      if (!map.has(id)) map.set(id, { agentId: id, name, totalAmount: 0, bookingCount: 0 });
      const cur = map.get(id);
      cur.totalAmount += total;
      cur.bookingCount += 1;
      map.set(id, cur);
    });

    const stats = Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Error building agent stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};