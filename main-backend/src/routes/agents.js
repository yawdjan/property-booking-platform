import express from 'express';
import {
  getAllAgents,
  getAgent,
  getAgentStats,
  approveAgent,
  suspendAgent,
  updateCommissionRate
} from '../controllers/agentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getAllAgents);
router.get('/stats', protect, authorize('admin'), getAgentStats);
router.get('/:id', protect, getAgent);
router.post('/:id/approve', protect, authorize('admin'), approveAgent);
router.post('/:id/suspend', protect, authorize('admin'), suspendAgent);
router.put('/:id/commission', protect, authorize('admin'), updateCommissionRate);

export default router;