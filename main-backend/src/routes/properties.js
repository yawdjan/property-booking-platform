import express from 'express';
import {
  getAllProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllProperties);
router.get('/:id', getProperty);
router.post('/', protect, authorize('admin'), createProperty);
router.put('/:id', protect, authorize('admin'), updateProperty);
router.delete('/:id', protect, authorize('admin'), deleteProperty);

export default router;