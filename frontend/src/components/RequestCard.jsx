import { Link } from 'react-router-dom';
import { ArrowLeftRight, Clock, Check, X, Trash2, MessageSquare } from 'lucide-react';
import '../styles/MyRequests.css';

/**
 * Reusable RequestCard component to display exchange requests
 * Supports:
 * - Received requests: Accept and Reject buttons
 * - Sent requests: Cancel pending request button
 */
function RequestCard({
  request,
  type = 'received',
  onAccept,
  onReject,
  onCancel,
  showActions = true,
}) {
  const isReceived = type === 'received';
  const reqId = request._id || request.id;

  // Extract user depending on whether this request was received or sent
  const sender = request.senderId || request.sender || {};
  const receiver = request.receiverId || request.recipient || {};

  const otherUser = isReceived ? sender : receiver;
  const displayName = isReceived
    ? otherUser.name || 'Community Member'
    : `To: ${otherUser.name || 'Mentor'}`;

  const displayAvatar =
    otherUser.profileImage ||
    otherUser.avatar ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';

  const status = String(request.status || 'pending').toLowerCase();
  const dateFormatted = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : request.date || 'Recently';

  return (
    <div className="request-card">
      {/* Header: User Info & Status */}
      <div className="request-card-header">
        <div className="request-user-info">
          <img
            src={displayAvatar}
            alt={displayName}
            className="request-user-avatar"
            onError={(e) => {
              e.target.src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
            }}
          />
          <div>
            <div className="request-user-name">{displayName}</div>
            <div className="request-date">
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              {dateFormatted}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`status-badge status-${status}`}>
          {status}
        </span>
      </div>

      {/* Exchange Strip: Offered <-> Requested */}
      <div className="exchange-strip">
        <div className="exchange-strip-item">
          <span className="exchange-strip-label">
            {isReceived ? 'They Offer' : 'You Offered'}
          </span>
          <span className="exchange-strip-value">{request.skillOffered}</span>
        </div>

        <div className="exchange-strip-arrow">
          <ArrowLeftRight size={20} />
        </div>

        <div className="exchange-strip-item">
          <span className="exchange-strip-label">
            {isReceived ? 'In Exchange For' : 'Requested Skill'}
          </span>
          <span className="exchange-strip-value">{request.skillRequested}</span>
        </div>
      </div>

      {/* Personal Note / Message */}
      {request.message && (
        <div className="request-message-box">"{request.message}"</div>
      )}

      {/* Footer with Actions */}
      {showActions && (
        <div className="request-card-footer">
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Request ID: #{String(reqId).slice(-6)}
          </span>

          {/* Accept and Reject buttons for pending received requests */}
          {isReceived && status === 'pending' && (
            <div className="request-action-buttons">
              <button
                type="button"
                className="btn btn-sm btn-reject"
                onClick={() => onReject && onReject(reqId, otherUser.name)}
              >
                <X size={15} /> Reject
              </button>
              <button
                type="button"
                className="btn btn-sm btn-accept"
                onClick={() => onAccept && onAccept(reqId, otherUser.name)}
              >
                <Check size={15} /> Accept Request
              </button>
            </div>
          )}

          {/* Cancel button for pending sent requests */}
          {!isReceived && status === 'pending' && (
            <div className="request-action-buttons">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                onClick={() => onCancel && onCancel(reqId)}
                title="Cancel this pending request"
              >
                <Trash2 size={14} /> Cancel Request
              </button>
            </div>
          )}

          {/* Resolved status notice & Open Chat button */}
          {status === 'accepted' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#16a34a',
                }}
              >
                {isReceived
                  ? '✓ You accepted this exchange proposal'
                  : '✓ Proposal was accepted by mentor!'}
              </span>
              <Link
                to={`/chats?requestId=${reqId}`}
                className="btn btn-sm btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  padding: '6px 14px',
                  fontSize: '0.85rem',
                }}
              >
                <MessageSquare size={15} />
                Open Chat
              </Link>
            </div>
          ) : (
            status === 'rejected' && (
              <span
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#dc2626',
                }}
              >
                {isReceived
                  ? '✕ You declined this proposal'
                  : '✕ Proposal was declined by mentor'}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default RequestCard;
