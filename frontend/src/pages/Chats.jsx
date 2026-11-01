import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  ArrowLeft,
  ArrowLeftRight,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { chatService } from '../services/api';
import { connectSocket, getSocket } from '../services/socket';
import '../styles/Chats.css';

function Chats({ currentUser }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryRequestId = searchParams.get('requestId');

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(activeConversation);

  // Keep activeConversationRef in sync for socket callbacks
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Scroll to bottom when messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  // Load conversations on component mount
  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      try {
        const data = await chatService.getConversations();
        if (!isMounted) return;

        setConversations(data || []);

        // If a specific requestId was requested in URL query, select it
        if (queryRequestId && Array.isArray(data)) {
          const matched = data.find(
            (c) => String(c.requestId) === String(queryRequestId)
          );
          if (matched) {
            setActiveConversation(matched);
          }
        }
      } catch (err) {
        console.warn('Error loading conversations:', err.message);
      } finally {
        if (isMounted) {
          setLoadingConversations(false);
        }
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [queryRequestId]);

  // Socket.IO event listeners setup
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    // Handle incoming real-time message
    const handleReceiveMessage = (newMessage) => {
      const currentActive = activeConversationRef.current;
      const isForCurrentChat =
        currentActive &&
        String(currentActive.requestId) === String(newMessage.requestId);

      if (isForCurrentChat) {
        setMessages((prev) => {
          // Avoid duplicate messages
          const exists = prev.some(
            (m) => String(m._id || m.id) === String(newMessage._id || newMessage.id)
          );
          if (exists) return prev;
          return [...prev, newMessage];
        });

        // Mark as read in real-time if currently in this conversation
        socket.emit('markAsRead', { requestId: currentActive.requestId });
      }

      // Update conversations list with latest message and unread count
      setConversations((prev) => {
        return prev.map((conv) => {
          if (String(conv.requestId) === String(newMessage.requestId)) {
            const isFromPartner =
              String(newMessage.senderId?._id || newMessage.senderId) !==
              String(currentUser?._id || currentUser?.id);

            return {
              ...conv,
              lastMessage: {
                text: newMessage.text,
                senderId: newMessage.senderId,
                createdAt: newMessage.createdAt,
              },
              unreadCount:
                isForCurrentChat || !isFromPartner
                  ? 0
                  : (conv.unreadCount || 0) + 1,
              lastActivity: newMessage.createdAt,
            };
          }
          return conv;
        });
      });
    };

    // Handle partner typing indicator
    const handleUserTyping = (data) => {
      const currentActive = activeConversationRef.current;
      if (
        currentActive &&
        String(currentActive.requestId) === String(data.requestId)
      ) {
        setPartnerTyping(Boolean(data.isTyping));
      }
    };

    // Handle messages read by partner
    const handleMessagesRead = (data) => {
      const currentActive = activeConversationRef.current;
      if (
        currentActive &&
        String(currentActive.requestId) === String(data.requestId)
      ) {
        setMessages((prev) =>
          prev.map((msg) => ({
            ...msg,
            read: true,
          }))
        );
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('messagesRead', handleMessagesRead);
    };
  }, [currentUser]);

  // Load message history when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const socket = getSocket();
    const reqId = activeConversation.requestId;

    // Join the active conversation's Socket.IO room
    if (socket) {
      socket.emit('joinRoom', { requestId: reqId });
      socket.emit('markAsRead', { requestId: reqId });
    }

    let isMounted = true;
    const fetchChatMessages = async () => {
      try {
        const data = await chatService.getMessages(reqId);
        if (!isMounted) return;

        setMessages(data.messages || []);

        // Clear unread count for this conversation in list
        setConversations((prev) =>
          prev.map((c) =>
            String(c.requestId) === String(reqId)
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
      } catch (err) {
        console.error('Error fetching messages for conversation:', err);
      } finally {
        if (isMounted) {
          setLoadingMessages(false);
        }
      }
    };

    fetchChatMessages();

    return () => {
      isMounted = false;
      if (socket) {
        socket.emit('leaveRoom', { requestId: reqId });
      }
    };
  }, [activeConversation]);

  // Select a conversation from the sidebar
  const handleSelectConversation = (conv) => {
    setMessages([]);
    setLoadingMessages(true);
    setActiveConversation(conv);
    setSearchParams({ requestId: conv.requestId });
    setPartnerTyping(false);
  };

  // Back to conversations list on mobile
  const handleBackToList = () => {
    setActiveConversation(null);
    setMessages([]);
    setSearchParams({});
    setPartnerTyping(false);
  };

  // Handle typing change in input field
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    const socket = getSocket();
    if (!socket || !activeConversation) return;

    socket.emit('typing', {
      requestId: activeConversation.requestId,
      isTyping: true,
      userName: currentUser?.name || 'Someone',
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        requestId: activeConversation.requestId,
        isTyping: false,
      });
    }, 1500);
  };

  // Send message submit handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const textToSend = inputText.trim();
    setInputText('');

    const socket = getSocket();
    const reqId = activeConversation.requestId;

    // Reset typing indicator immediately
    if (socket) {
      socket.emit('typing', {
        requestId: reqId,
        isTyping: false,
      });
    }

    // Try sending via Socket.IO first for instant real-time dispatch
    if (socket && socket.connected) {
      socket.emit('sendMessage', {
        requestId: reqId,
        text: textToSend,
      });
    } else {
      // Fallback via HTTP REST API if socket is offline
      try {
        const savedMessage = await chatService.sendMessage(reqId, textToSend);
        setMessages((prev) => [...prev, savedMessage]);
      } catch (err) {
        console.error('Failed to send message via HTTP fallback:', err);
      }
    }
  };

  // Format message timestamp
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date header or conversation time
  const formatConvTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Filter conversations by partner name or skill
  const filteredConversations = conversations.filter((c) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const partnerName = (c.partner?.name || '').toLowerCase();
    const offered = (c.requestDetails?.skillOffered || '').toLowerCase();
    const requested = (c.requestDetails?.skillRequested || '').toLowerCase();
    return (
      partnerName.includes(q) || offered.includes(q) || requested.includes(q)
    );
  });

  const totalUnreadCount = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0
  );

  return (
    <div className="chats-page">
      <div className="chats-container">
        <div
          className={`chats-card ${
            activeConversation ? 'active-chat-open' : ''
          }`}
        >
          {/* ============================================================
             SIDEBAR: CONVERSATIONS LIST
          ============================================================ */}
          <aside className="chats-sidebar">
            <div className="chats-sidebar-header">
              <div className="chats-sidebar-title">
                <h2>
                  <MessageSquare size={20} color="var(--primary-purple)" />
                  Messages
                </h2>
                {totalUnreadCount > 0 && (
                  <span className="chats-badge-total">
                    {totalUnreadCount} new
                  </span>
                )}
              </div>

              {/* Search Conversations */}
              <div className="chats-search-wrapper">
                <Search size={16} className="chats-search-icon" />
                <input
                  type="text"
                  placeholder="Search chats by name or skill..."
                  className="chats-search-input"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="conversations-list">
              {loadingConversations ? (
                <div className="sidebar-empty">
                  Loading conversations...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="sidebar-empty">
                  {conversations.length === 0 ? (
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 8 }}>
                        No active chats yet
                      </p>
                      <p style={{ fontSize: '0.82rem', marginBottom: 16 }}>
                        Private chats unlock once you accept a skill exchange proposal!
                      </p>
                      <Link to="/requests" className="btn btn-sm btn-primary">
                        <Inbox size={14} style={{ marginRight: 6 }} />
                        Check My Requests
                      </Link>
                    </div>
                  ) : (
                    <p>No conversations matched "{searchFilter}"</p>
                  )}
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive =
                    activeConversation &&
                    String(activeConversation.requestId) ===
                      String(conv.requestId);

                  return (
                    <div
                      key={conv.requestId}
                      className={`conversation-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectConversation(conv)}
                    >
                      <div className="conv-avatar-wrap">
                        <img
                          src={conv.partner?.profileImage}
                          alt={conv.partner?.name}
                          className="conv-avatar"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                        <span className="conv-online-dot" />
                      </div>

                      <div className="conv-info">
                        <div className="conv-top-row">
                          <span className="conv-name">{conv.partner?.name}</span>
                          <span className="conv-time">
                            {formatConvTime(conv.lastActivity)}
                          </span>
                        </div>

                        <span className="conv-skill-badge">
                          {conv.requestDetails?.skillOffered} ⇄{' '}
                          {conv.requestDetails?.skillRequested}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            className={`conv-last-msg ${
                              conv.unreadCount > 0 ? 'unread' : ''
                            }`}
                          >
                            {conv.lastMessage?.text || 'Exchange started. Say hello!'}
                          </span>

                          {conv.unreadCount > 0 && (
                            <span className="conv-unread-pill">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* ============================================================
             MAIN CHAT WINDOW
          ============================================================ */}
          <main className="chat-main">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="chat-main-header">
                  <div className="chat-header-user">
                    {/* Back Button on Mobile */}
                    <button
                      type="button"
                      className="chat-back-btn"
                      onClick={handleBackToList}
                      title="Back to conversations"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <img
                      src={activeConversation.partner?.profileImage}
                      alt={activeConversation.partner?.name}
                      className="chat-header-avatar"
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                      }}
                    />

                    <div>
                      <div className="chat-header-name">
                        {activeConversation.partner?.name}
                      </div>
                      <div className="chat-header-subtitle">
                        <span className="chat-exchange-chip">
                          <ArrowLeftRight size={12} />
                          {activeConversation.requestDetails?.skillOffered} ⇄{' '}
                          {activeConversation.requestDetails?.skillRequested}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="chat-messages-container">
                  <div className="chat-start-notice">
                    <Sparkles
                      size={16}
                      style={{
                        display: 'inline',
                        marginRight: 6,
                        color: 'var(--primary-purple)',
                      }}
                    />
                    This is the start of your private skill exchange chat with{' '}
                    <strong>{activeConversation.partner?.name}</strong>. Messages
                    are stored securely in your MongoDB database.
                  </div>

                  {loadingMessages ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                      No messages yet. Send a message to coordinate your skill swap session!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const senderId =
                        msg.senderId?._id || msg.senderId;
                      const currentUserId =
                        currentUser?._id || currentUser?.id;
                      const isMine =
                        String(senderId) === String(currentUserId);

                      return (
                        <div
                          key={msg._id || index}
                          className={`message-row ${isMine ? 'mine' : 'theirs'}`}
                        >
                          {!isMine && (
                            <span className="message-sender-name">
                              {msg.senderId?.name ||
                                activeConversation.partner?.name}
                            </span>
                          )}

                          <div className="message-bubble">{msg.text}</div>

                          <div className="message-meta">
                            <span>{formatTime(msg.createdAt)}</span>
                            {isMine && (
                              <span style={{ fontSize: '0.75rem', marginLeft: 2 }}>
                                {msg.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Partner Typing Indicator */}
                  {partnerTyping && (
                    <div className="chat-typing-indicator">
                      <span>{activeConversation.partner?.name} is typing</span>
                      <div className="typing-dots">
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                        <span className="typing-dot" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Footer */}
                <div className="chat-input-container">
                  <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      className="chat-text-input"
                      placeholder={`Message ${activeConversation.partner?.name || ''}...`}
                      value={inputText}
                      onChange={handleInputChange}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="btn-send-message"
                      disabled={!inputText.trim()}
                      title="Send Message"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Empty State (No Chat Selected) */
              <div className="chat-placeholder">
                <div className="chat-placeholder-icon">
                  <MessageSquare size={36} />
                </div>
                <h3>Your Private Chat Hub</h3>
                <p>
                  Select an accepted exchange partner from the left sidebar to
                  collaborate, schedule sessions, and share knowledge in real time.
                </p>
                <Link to="/explore" className="btn btn-outline btn-sm">
                  Explore More Skills
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Chats;
