import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import Loading from '../Common/Loading';
import './GroupMemberManagement.css';

const GroupMemberManagement = ({ groupId, onClose }) => {
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const fetchGroupDetails = () => {
    setLoading(true);
    
    // Fetch group details
    jqueryAPI.group.getGroupById(groupId)
      .done((response) => {
        setGroup(response);
        setMembers(response.members || []);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching group details:', error);
        alert('Failed to load group details');
      });

    // Fetch pending join requests
    jqueryAPI.group.getPendingRequests(groupId)
      .done((response) => {
        // API returns array of user objects in { requests }
        const requests = response.requests || response || [];
        setPendingRequests(Array.isArray(requests) ? requests : []);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching pending requests:', error);
        setPendingRequests([]);
      })
      .always(() => {
        setLoading(false);
      });
  };

  const handleApproveRequest = (userId) => {
    jqueryAPI.group.approveRequest(groupId, userId)
      .done((response) => {
        alert('Join request approved!');
        fetchGroupDetails(); // Refresh data
      })
      .fail((xhr, status, error) => {
        const errorMessage = xhr.responseJSON?.message || 'Failed to approve request';
        alert(errorMessage);
      });
  };

  const handleRejectRequest = (userId) => {
    if (window.confirm('Are you sure you want to reject this join request?')) {
      jqueryAPI.group.rejectRequest(groupId, userId)
        .done((response) => {
          alert('Join request rejected');
          fetchGroupDetails(); // Refresh data
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Failed to reject request';
          alert(errorMessage);
        });
    }
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm('Are you sure you want to remove this member from the group?')) {
      jqueryAPI.group.removeMember(groupId, userId)
        .done((response) => {
          alert('Member removed successfully');
          fetchGroupDetails(); // Refresh data
        })
        .fail((xhr, status, error) => {
          const errorMessage = xhr.responseJSON?.message || 'Failed to remove member';
          alert(errorMessage);
        });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="member-management-modal">
      <div className="member-management">
        <div className="modal-header">
          <h2>Manage Group Members</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {group && (
          <div className="group-info">
            <h3>{group.name}</h3>
            <p>{group.description}</p>
            <div className="group-stats">
              <span>Members: {members.length}</span>
              <span>Pending Requests: {pendingRequests.length}</span>
            </div>
          </div>
        )}

        <div className="management-tabs">
          <button 
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Current Members ({members.length})
          </button>
          <button 
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests ({pendingRequests.length})
          </button>
        </div>

        {activeTab === 'members' && (
          <div className="members-section">
            {members.length > 0 ? (
              <div className="members-list">
                {members.map(member => (
                  <div key={member._id} className="member-card">
                    <div className="member-avatar">
                      <div className="avatar-placeholder">
                        {member.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    </div>
                    
                    <div className="member-info">
                      <h4>{member.fullName || member.username}</h4>
                      <p>@{member.username}</p>
                      {member.bio && <p className="member-bio">{member.bio}</p>}
                    </div>
                    
                    <div className="member-actions">
                      {member._id !== user?._id && (
                        <button 
                          className="btn-remove-member"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-members">
                <p>No members in this group yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="requests-section">
            {pendingRequests.length > 0 ? (
              <div className="requests-list">
                {pendingRequests.map(req => (
                  <div key={req._id} className="request-card">
                    <div className="request-avatar">
                      <div className="avatar-placeholder">
                        {req.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    </div>
                    
                    <div className="request-info">
                      <h4>{req.fullName || req.username}</h4>
                      <p>@{req.username}</p>
                      {req.bio && <p className="request-bio">{req.bio}</p>}
                    </div>
                    
                    <div className="request-actions">
                      <button 
                        className="btn-approve"
                        onClick={() => handleApproveRequest(req._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-reject"
                        onClick={() => handleRejectRequest(req._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-requests">
                <p>No pending join requests.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMemberManagement;
