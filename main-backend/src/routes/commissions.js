import express from 'express';
import {
  getAgentCommissions,
  requestPayout,
  processPayout,
  getAllCommissions
} from '../controllers/commissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllCommissions);
router.get('/agent/:agentId', protect, getAgentCommissions);
router.post('/request-payout', protect, authorize('agent'), requestPayout);
router.post('/:id/process', protect, authorize('admin'), processPayout);

export default router;