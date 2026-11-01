import mongoose from 'mongoose';
import Request from '../models/Request.js';
import User from '../models/User.js';

/**
 * @desc    Send a new skill exchange request to another user
 * @route   POST /api/requests
 * @access  Private
 */
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, recipientId, skillOffered, skillRequested, message } = req.body;

    const targetReceiver = receiverId || recipientId;

    if (!targetReceiver || !skillOffered || !skillRequested) {
      return res.status(400).json({
        message: 'Please provide receiverId, skillOffered, and skillRequested',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetReceiver)) {
      return res.status(400).json({ message: 'Invalid receiver ID format' });
    }

    // Prevent users from sending requests to themselves
    if (targetReceiver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: 'You cannot send a skill exchange request to yourself',
      });
    }

    // Check if recipient exists
    const recipientUser = await User.findById(targetReceiver);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    const request = await Request.create({
      senderId: req.user._id,
      receiverId: targetReceiver,
      skillOffered: skillOffered.trim(),
      skillRequested: skillRequested.trim(),
      message: message ? message.trim() : 'Hi, I would love to exchange skills with you!',
      status: 'pending',
    });

    const populated = await Request.findById(request._id)
      .populate('senderId', 'name email profileImage avatar location bio')
      .populate('receiverId', 'name email profileImage avatar location bio');

    return res.status(201).json(populated);
  } catch (error) {
    console.error('Error sending request:', error.message);
    return res.status(500).json({ message: 'Server error sending request', error: error.message });
  }
};

/**
 * @desc    Get all exchange requests received by the logged-in user
 * @route   GET /api/requests/received
 * @access  Private
 */
export const getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.user._id })
      .populate('senderId', 'name email profileImage avatar location bio')
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error('Error fetching received requests:', error.message);
    return res.status(500).json({ message: 'Server error fetching received requests', error: error.message });
  }
};

/**
 * @desc    Get all exchange requests sent by the logged-in user
 * @route   GET /api/requests/sent
 * @access  Private
 */
export const getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({ senderId: req.user._id })
      .populate('receiverId', 'name email profileImage avatar location bio')
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (error) {
    console.error('Error fetching sent requests:', error.message);
    return res.status(500).json({ message: 'Server error fetching sent requests', error: error.message });
  }
};

/**
 * @desc    Accept an incoming skill exchange request
 * @route   PUT /api/requests/:id/accept
 * @access  Private
 */
export const acceptRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Request ID format' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the intended receiver can accept
    if (request.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the recipient of this request can accept it',
      });
    }

    request.status = 'accepted';
    const updated = await request.save();

    // Increment swaps completed counter for both users
    await User.findByIdAndUpdate(request.senderId, { $inc: { swapsCompleted: 1 } });
    await User.findByIdAndUpdate(request.receiverId, { $inc: { swapsCompleted: 1 } });

    const populated = await Request.findById(updated._id)
      .populate('senderId', 'name email profileImage avatar')
      .populate('receiverId', 'name email profileImage avatar');

    return res.json(populated);
  } catch (error) {
    console.error('Error accepting request:', error.message);
    return res.status(500).json({ message: 'Server error accepting request', error: error.message });
  }
};

/**
 * @desc    Reject an incoming skill exchange request
 * @route   PUT /api/requests/:id/reject
 * @access  Private
 */
export const rejectRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Request ID format' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the intended receiver can reject
    if (request.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the recipient of this request can reject it',
      });
    }

    request.status = 'rejected';
    const updated = await request.save();

    const populated = await Request.findById(updated._id)
      .populate('senderId', 'name email profileImage avatar')
      .populate('receiverId', 'name email profileImage avatar');

    return res.json(populated);
  } catch (error) {
    console.error('Error rejecting request:', error.message);
    return res.status(500).json({ message: 'Server error rejecting request', error: error.message });
  }
};

/**
 * @desc    Cancel a pending outgoing exchange request (by the sender)
 * @route   DELETE /api/requests/:id
 * @access  Private
 */
export const cancelRequest = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Request ID format' });
    }

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only the sender can cancel their own request
    if (request.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the sender can cancel this request',
      });
    }

    // Only pending requests can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot cancel a request that has already been ${request.status}`,
      });
    }

    await request.deleteOne();
    return res.json({ message: 'Skill exchange request successfully cancelled' });
  } catch (error) {
    console.error('Error cancelling request:', error.message);
    return res.status(500).json({ message: 'Server error cancelling request', error: error.message });
  }
};

/**
 * @desc    Generic status updater (backward compatibility)
 * @route   PUT /api/requests/:id/status
 * @access  Private
 */
export const updateRequestStatus = async (req, res) => {
  const { status } = req.body;
  if (status && status.toLowerCase() === 'accepted') {
    return acceptRequest(req, res);
  } else if (status && status.toLowerCase() === 'rejected') {
    return rejectRequest(req, res);
  }
  return res.status(400).json({ message: 'Status must be "accepted" or "rejected"' });
};
