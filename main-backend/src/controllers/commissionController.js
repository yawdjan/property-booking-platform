import { Commission, Booking, User, PayoutRequest, Property } from '../models/index.js';

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
    const { agentId, payoutAmount, description } = req.body;
    console.log(req.body);

    // Validate required fields
    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payout amount'
      });
    }

    // ⚠️ IMPORTANT: Create the payout request in database
    const newRequest = await PayoutRequest.create({
      agentId,
      requestedAmount: payoutAmount,
      description: description || null,
      status: "pending",
      requestDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: newRequest
    });

  } catch (error) {
    console.error("Error creating payout request:", error);

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

export const getAgentPayoutRequests = async (req, res) => {
  try {
    const payouts = await PayoutRequest.findAll({
      where: { agentId: req.user.id },
      include: [
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['requestDate', 'DESC']]
    });

    res.json({ success: true, data: payouts });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    res.status(500).json({ success: false, message: 'Error fetching payout requests' });
  }
};

export const createAgentPayoutRequest = async (req, res) => {
  try {
    const { requested_amount, description } = req.body;

    // Validate amount
    if (!requested_amount || requested_amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    // Check available balance
    const availableBalance = await Commission.sum('amount', {
      where: {
        agentId: req.user.id,
        status: 'pending'
      }
    }) || 0;

    if (parseFloat(requested_amount) > parseFloat(availableBalance)) {
      return res.status(400).json({
        success: false,
        message: 'Requested amount exceeds available balance'
      });
    }

    const payoutRequest = await PayoutRequest.create({
      agentId: req.user.id,
      requestedAmount: requested_amount,
      description,
      status: 'pending'
    });

    res.json({
      success: true,
      message: 'Payout request submitted successfully',
      data: payoutRequest
    });
  } catch (error) {
    console.error('Error creating payout request:', error);
    res.status(500).json({ success: false, message: 'Error creating payout request' });
  }
};

export const getAllPayoutRequests = async (req, res) => {
  try {
    // ❌ Removed status filtering
    const payouts = await PayoutRequest.findAll({
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['requestDate', 'DESC']]
    });

    // Calculate available balance for each agent
    const payoutsWithBalance = await Promise.all(
      payouts.map(async (payout) => {
        const availableBalance = await Commission.sum('amount', {
          where: {
            agentId: payout.agentId,
            status: 'pending'
          }
        }) || 0;

        return {
          ...payout.toJSON(),
          availableBalance: parseFloat(availableBalance)
        };
      })
    );

    res.json({ success: true, data: payoutsWithBalance });
  } catch (error) {
    console.error('Error fetching payout requests:', error);
    res.status(500).json({ success: false, message: 'Error fetching payout requests' });
  }
};

export const approvePayoutRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved_amount, admin_note } = req.body;

    const request = await PayoutRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Payout request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    // Use provided amount, or existing approvedAmount (if modified), or original requested amount
    const finalAmount = approved_amount || request.approvedAmount || request.requestedAmount;

    // Validate against available balance
    const availableBalance = await Commission.sum('amount', {
      where: {
        agentId: request.agentId,
        status: 'pending'
      }
    }) || 0;

    if (parseFloat(finalAmount) > parseFloat(availableBalance)) {
      return res.status(400).json({
        success: false,
        message: `Approved amount exceeds agent's available balance of ¢${availableBalance}`
      });
    }

    await request.update({
      status: 'approved',
      approvedAmount: finalAmount,
      adminNote: admin_note,
      processedBy: req.user.id,
      processedDate: new Date()
    });

    res.json({
      success: true,
      message: 'Payout request approved successfully',
      data: {
        requestedAmount: request.requestedAmount,
        approvedAmount: finalAmount
      }
    });
  } catch (error) {
    console.error('Error approving payout:', error);
    res.status(500).json({ success: false, message: 'Error approving payout request' });
  }
};

export const denyPayoutRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    if (!admin_note) {
      return res.status(400).json({ success: false, message: 'Admin note is required for denial' });
    }

    const request = await PayoutRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Payout request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    await request.update({
      status: 'denied',
      adminNote: admin_note,
      processedBy: req.user.id,
      processedDate: new Date()
    });

    res.json({
      success: true,
      message: 'Payout request denied'
    });
  } catch (error) {
    console.error('Error denying payout:', error);
    res.status(500).json({ success: false, message: 'Error denying payout request' });
  }
};

export const modifyPayoutRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { modified_amount, admin_note } = req.body;

    if (!modified_amount || modified_amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const request = await PayoutRequest.findByPk(id, {
      include: [
        {
          model: User,
          as: 'agent',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Payout request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Can only modify pending requests' });
    }

    // Check if modified amount exceeds available balance
    const availableBalance = await Commission.sum('amount', {
      where: {
        agentId: request.agentId,
        status: 'pending'
      }
    }) || 0;

    if (parseFloat(modified_amount) > parseFloat(availableBalance)) {
      return res.status(400).json({
        success: false,
        message: `Modified amount exceeds agent's available balance of ¢${availableBalance}`
      });
    }

    // Update the request with modified amount
    await request.update({
      approvedAmount: modified_amount,
      adminNote: admin_note || `Amount modified from ¢${request.requestedAmount} to ¢${modified_amount}`,
      processedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Payout amount modified successfully',
      data: request
    });
  } catch (error) {
    console.error('Error modifying payout:', error);
    res.status(500).json({ success: false, message: 'Error modifying payout request' });
  }
};

export const approveModifiedPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const request = await PayoutRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Payout request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    if (!request.approvedAmount) {
      return res.status(400).json({ success: false, message: 'No modified amount set' });
    }

    await request.update({
      status: 'approved',
      adminNote: admin_note || request.adminNote,
      processedBy: req.user.id,
      processedDate: new Date()
    });

    res.json({
      success: true,
      message: 'Modified payout request approved successfully'
    });
  } catch (error) {
    console.error('Error approving modified payout:', error);
    res.status(500).json({ success: false, message: 'Error approving payout request' });
  }
};

export const getCommissionStats = async (req, res) => {
  try {
    const totalCommissions = await Commission.sum('amount') || 0;
    const pendingCommissions = await Commission.sum('amount', {
      where: { status: 'pending' }
    }) || 0;
    const paidCommissions = await Commission.sum('amount', {
      where: { status: 'paid' }
    }) || 0;

    const pendingPayoutRequests = await PayoutRequest.count({
      where: { status: 'pending' }
    });

    res.json({
      success: true,
      data: {
        totalCommissions: parseFloat(totalCommissions),
        pendingCommissions: parseFloat(pendingCommissions),
        paidCommissions: parseFloat(paidCommissions),
        pendingPayoutRequests
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
};