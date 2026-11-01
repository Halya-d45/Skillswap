import express from 'express';
import {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All request routes require authentication
router.use(protect);

// Specific routes
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);

// Creation
router.post('/', sendRequest);

// Actions on a specific request
router.put('/:id/accept', acceptRequest);
router.put('/:id/reject', rejectRequest);
router.delete('/:id', cancelRequest);

// Backward compatibility status endpoint
router.put('/:id/status', updateRequestStatus);

export default router;
