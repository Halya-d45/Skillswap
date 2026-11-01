import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Request from '../models/Request.js';

/**
 * @desc    Get all accepted conversations for the logged-in user
 * @route   GET /api/chat/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all accepted requests involving the logged-in user
    const acceptedRequests = await Request.find({
      status: 'accepted',
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate('senderId', 'name email profileImage location bio')
      .populate('receiverId', 'name email profileImage location bio')
      .sort({ updatedAt: -1 });

    // Build conversation list with latest message and unread count
    const conversations = await Promise.all(
      acceptedRequests.map(async (request) => {
        const isSender = request.senderId._id.toString() === userId.toString();
        const partner = isSender ? request.receiverId : request.senderId;

        // Fetch last message for this request
        const lastMessage = await Message.findOne({ requestId: request._id })
          .sort({ createdAt: -1 })
          .lean();

        // Count unread messages sent by partner to current user
        const unreadCount = await Message.countDocuments({
          requestId: request._id,
          receiverId: userId,
          read: false,
        });

        return {
          requestId: request._id,
          requestDetails: {
            skillOffered: request.skillOffered,
            skillRequested: request.skillRequested,
            status: request.status,
            createdAt: request.createdAt,
          },
          partner: {
            _id: partner._id,
            id: partner._id,
            name: partner.name,
            email: partner.email,
            profileImage:
              partner.profileImage ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
            location: partner.location,
            bio: partner.bio,
          },
          lastMessage: lastMessage
            ? {
                text: lastMessage.text,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          lastActivity: lastMessage ? lastMessage.createdAt : request.updatedAt,
        };
      })
    );

    // Sort by latest activity (last message date or request date)
    conversations.sort(
      (a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)
    );

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      message: 'Failed to fetch conversations',
      error: error.message,
    });
  }
};

/**
 * @desc    Get message history for a specific accepted request
 * @route   GET /api/chat/messages/:requestId
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const request = await Request.findById(requestId)
      .populate('senderId', 'name email profileImage')
      .populate('receiverId', 'name email profileImage');

    if (!request) {
      return res.status(404).json({ message: 'Skill exchange request not found' });
    }

    if (request.status !== 'accepted') {
      return res.status(403).json({
        message: 'Chat is only accessible for accepted skill exchange requests',
      });
    }

    const isSender = request.senderId._id.toString() === userId.toString();
    const isReceiver = request.receiverId._id.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        message: 'You are not authorized to view this private conversation',
      });
    }

    // Retrieve messages sorted chronologically
    const messages = await Message.find({ requestId })
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage')
      .sort({ createdAt: 1 });

    // Mark any unread messages sent to the current user as read
    await Message.updateMany(
      {
        requestId,
        receiverId: userId,
        read: false,
      },
      { $set: { read: true } }
    );

    const partner = isSender ? request.receiverId : request.senderId;

    res.json({
      request: {
        _id: request._id,
        skillOffered: request.skillOffered,
        skillRequested: request.skillRequested,
        status: request.status,
      },
      partner: {
        _id: partner._id,
        name: partner.name,
        email: partner.email,
        profileImage:
          partner.profileImage ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      },
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

/**
 * @desc    Send a message via HTTP REST endpoint
 * @route   POST /api/chat/messages/:requestId
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text cannot be empty' });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: 'Invalid request ID' });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Skill exchange request not found' });
    }

    if (request.status !== 'accepted') {
      return res.status(403).json({
        message: 'Messages can only be sent for accepted skill exchanges',
      });
    }

    const isSender = request.senderId.toString() === userId.toString();
    const isReceiver = request.receiverId.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({
        message: 'You are not a participant in this skill exchange',
      });
    }

    const receiverId = isSender ? request.receiverId : request.senderId;

    const newMessage = await Message.create({
      requestId,
      senderId: userId,
      receiverId,
      text: text.trim(),
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', 'name profileImage')
      .populate('receiverId', 'name profileImage');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark all messages in a conversation as read
 * @route   PUT /api/chat/messages/:requestId/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      {
        requestId,
        receiverId: userId,
        read: false,
      },
      { $set: { read: true } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      message: 'Failed to mark messages as read',
      error: error.message,
    });
  }
};
