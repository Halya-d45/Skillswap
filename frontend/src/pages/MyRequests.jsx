import { useState, useEffect } from 'react';
import {
  Inbox,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import RequestCard from '../components/RequestCard';
import { requestService } from '../services/api';
import '../styles/MyRequests.css';

function MyRequests() {
  const [activeTab, setActiveTab] = useState('received');
  const [statusFilter, setStatusFilter] = useState('All');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionAlert, setActionAlert] = useState('');
  const [errorAlert, setErrorAlert] = useState('');

  // Fetch requests from MongoDB backend
  const loadRequests = async () => {
    try {
      const [received, sent] = await Promise.allSettled([
        requestService.getReceivedRequests(),
        requestService.getSentRequests(),
      ]);

      if (received.status === 'fulfilled') {
        setReceivedRequests(received.value || []);
      }
      if (sent.status === 'fulfilled') {
        setSentRequests(sent.value || []);
      }
    } catch (err) {
      console.warn('Requests load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchRequests = async () => {
      try {
        const [received, sent] = await Promise.allSettled([
          requestService.getReceivedRequests(),
          requestService.getSentRequests(),
        ]);

        if (!isMounted) return;

        if (received.status === 'fulfilled') {
          setReceivedRequests(received.value || []);
        }
        if (sent.status === 'fulfilled') {
          setSentRequests(sent.value || []);
        }
      } catch (err) {
        console.warn('Requests load error:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentList = activeTab === 'received' ? receivedRequests : sentRequests;

  const filteredList = currentList.filter((item) => {
    if (statusFilter === 'All') return true;
    return String(item.status).toLowerCase() === statusFilter.toLowerCase();
  });

  // Accept incoming request: PUT /api/requests/:id/accept
  const handleAccept = async (requestId, senderName) => {
    try {
      await requestService.acceptRequest(requestId);
      setActionAlert(`Skill exchange request from ${senderName || 'user'} accepted!`);
      loadRequests();
      setTimeout(() => setActionAlert(''), 4500);
    } catch (err) {
      console.error('Accept error:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to accept request.');
      setTimeout(() => setErrorAlert(''), 4500);
    }
  };

  // Reject incoming request: PUT /api/requests/:id/reject
  const handleReject = async (requestId, senderName) => {
    try {
      await requestService.rejectRequest(requestId);
      setActionAlert(`Skill exchange request from ${senderName || 'user'} declined.`);
      loadRequests();
      setTimeout(() => setActionAlert(''), 4500);
    } catch (err) {
      console.error('Reject error:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to decline request.');
      setTimeout(() => setErrorAlert(''), 4500);
    }
  };

  // Cancel outgoing pending request: DELETE /api/requests/:id
  const handleCancel = async (requestId) => {
    try {
      await requestService.cancelRequest(requestId);
      setActionAlert('Your pending skill exchange request was cancelled.');
      loadRequests();
      setTimeout(() => setActionAlert(''), 4500);
    } catch (err) {
      console.error('Cancel error:', err);
      setErrorAlert(err.response?.data?.message || 'Failed to cancel request.');
      setTimeout(() => setErrorAlert(''), 4500);
    }
  };

  const receivedCount = receivedRequests.length;
  const sentCount = sentRequests.length;

  return (
    <div className="requests-page">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div className="requests-header">
          <h1 className="requests-title">Skill Exchange Requests</h1>
          <p className="requests-subtitle">
            Manage incoming proposals from fellow learners and keep track of requests you've sent.
          </p>
        </div>

        {/* Action feedback alerts */}
        {actionAlert && (
          <div className="alert-banner alert-success">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={20} />
              <span>{actionAlert}</span>
            </div>
            <button
              type="button"
              className="btn-remove-tag"
              onClick={() => setActionAlert('')}
            >
              ×
            </button>
          </div>
        )}

        {errorAlert && (
          <div
            className="alert-banner"
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #f87171',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={20} />
              <span>{errorAlert}</span>
            </div>
            <button
              type="button"
              className="btn-remove-tag"
              onClick={() => setErrorAlert('')}
            >
              ×
            </button>
          </div>
        )}

        {/* Tab & Filter Controls */}
        <div className="requests-controls-card">
          {/* Main Tabs: Received / Sent */}
          <div className="request-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('received');
                setStatusFilter('All');
              }}
            >
              <Inbox size={18} />
              <span>Received Requests</span>
              <span className="tab-badge">{receivedCount}</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('sent');
                setStatusFilter('All');
              }}
            >
              <Send size={18} />
              <span>Sent Requests</span>
              <span className="tab-badge">{sentCount}</span>
            </button>
          </div>

          {/* Status filter: All, Pending, Accepted, Rejected */}
          <div className="status-filters">
            {['All', 'Pending', 'Accepted', 'Rejected'].map((status) => (
              <button
                key={status}
                type="button"
                className={`status-filter-btn ${
                  statusFilter === status ? 'active' : ''
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Request Cards List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
            Loading exchange requests from MongoDB Atlas...
          </div>
        ) : filteredList.length > 0 ? (
          <div className="requests-list">
            {filteredList.map((req) => (
              <RequestCard
                key={req._id || req.id}
                request={req}
                type={activeTab}
                onAccept={handleAccept}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            ))}
          </div>
        ) : (
          <div className="requests-empty">
            <div className="empty-icon-wrap">
              <Inbox size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 8, color: 'var(--text-heading)' }}>
              No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} requests found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {activeTab === 'received'
                ? "You haven't received any exchange requests in this view right now."
                : "You haven't sent any skill exchange requests yet. Go to Explore Skills to find mentors!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRequests;
