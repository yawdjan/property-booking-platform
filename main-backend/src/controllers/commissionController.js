import { Commission, Booking, User } from '../models/index.js';

export const getAgentCommissions = async (req, res) => {
  try {
    const commissions = await Commission.findAll({
      where: { agentId: req.params.agentId },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: ['property']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const totalEarned = commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const pendingPayout = commissions
      .filter(c => c.status === 'Pending Payout')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const paid = commissions
      .filter(c => c.status === 'Paid')
      .reduce((sum, c) => sum + parseFloat(c.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        commissions,
        summary: {
          totalEarned,
          pendingPayout,
          paid
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

export const requestPayout = async (req, res) => {
  try {
    const { agentId } = req.body;

    // Update all pending commissions to requested
    const [updated] = await Commission.update(
      { 
        status: 'Requested',
        requestedAt: new Date()
      },
      {
        where: {
          agentId,
          status: 'Pending Payout'
        }
      }
    );

    if (updated === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending commissions to request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payout request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const processPayout = async (req, res) => {
  try {
    const { paymentMethod, paymentReference, notes } = req.body;
    
    const commission = await Commission.findByPk(req.params.id);

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission not found'
      });
    }

    await commission.update({
      status: 'Paid',
      paidAt: new Date(),
      paidBy: req.user.id,
      paymentMethod,
      paymentReference,
      notes
    });

    res.status(200).json({
      success: true,
      message: 'Commission paid successfully',
      data: commission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllCommissions = async (req, res) => {
  try {
    const commissions = await Commission.findAll({
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Booking,
          as: 'booking',
          include: ['property']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: commissions.length,
      data: commissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};