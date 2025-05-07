import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setSuccessMessage(`User role updated successfully!`);
      
      // Update the local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(`Failed to update user role: ${error.response?.data?.message || error.message}`);
      
      // Clear error after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <Navbar activePage="admin" user={user} />
      
      <div className="container mt-4">
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">User Management</h5>
          </div>
          <div className="card-body">
            {successMessage && (
              <div className="alert alert-success alert-dismissible fade show">
                {successMessage}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSuccessMessage('')}
                ></button>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger alert-dismissible fade show">
                {error}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setError('')}
                ></button>
              </div>
            )}
            
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Last Login</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-danger' : 'bg-primary'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.lastLogin)}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {user.username !== 'admintud' && (
                            <div className="btn-group">
                              {user.role === 'user' ? (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleRoleChange(user.id, 'admin')}
                                >
                                  Make Admin
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => handleRoleChange(user.id, 'user')}
                                >
                                  Make User
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;