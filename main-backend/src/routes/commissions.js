import express from 'express';
import {
  getAgentCommissions,
  requestPayout,
  processPayout,
  getAllCommissions,
  getAgentPayoutRequests,
  getAllPayoutRequests,
  approvePayoutRequest,
  denyPayoutRequest,
  modifyPayoutRequest,
  approveModifiedPayout,
  getCommissionStats,
  notePaid
} from '../controllers/commissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllCommissions);
router.get('/agent/:agentId', protect, getAgentCommissions);
router.post('/request-payout', protect, authorize('agent'), requestPayout);
router.post('/:id/process', protect, authorize('admin'), processPayout);

// Routes for payout requests 
router.get('/my-payouts', protect, authorize('agent'), getAgentPayoutRequests);
router.get('/admin/payouts', protect, authorize('admin'), getAllPayoutRequests);
router.post('/admin/payouts/:id/approve', protect, authorize('admin'), approvePayoutRequest);
router.post('/admin/payouts/:id/deny', protect, authorize('admin'), denyPayoutRequest);
router.put('/admin/payouts/:id/modify', protect, authorize('admin'), modifyPayoutRequest);
router.put('/admin/payouts/:id/modify', protect, authorize('admin'), notePaid);
router.post('/admin/payouts/:id/paid-status', protect, authorize('admin'), approveModifiedPayout);
router.get('/admin/stats', protect, authorize('admin'), getCommissionStats);

export default router;