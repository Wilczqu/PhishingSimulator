import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Alert, Spinner } from 'react-bootstrap';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

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

  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
      setSuccessMessage(`User deleted successfully!`);

      // Update the local state
      setUsers(users.filter(u => u.id !== userId));

      // Clear message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(`Failed to delete user: ${error.response?.data?.message || error.message}`);

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
      {/*<Navbar activePage="admin" user={user} />*/}

      <div className="container mt-4">
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">User Management</h5>
          </div>
          <div className="card-body">
            {successMessage && (
              <Alert variant="success" dismissible onClose={() => setSuccessMessage('')}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {loading ? (
              <div className="text-center">
                <Spinner animation="border" text="primary" />
              </div>
            ) : (
              <div className="table-responsive">
                <Table striped bordered hover className="user-management-table">
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
                          <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{formatDate(user.lastLogin)}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          {user.username !== 'admintud' && (
                            <div className="btn-group">
                              {user.role === 'user' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleRoleChange(user.id, 'admin')}
                                >
                                  Make Admin
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() => handleRoleChange(user.id, 'user')}
                                >
                                  Make User
                                </Button>
                              )}
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => navigate(`/edit-user/${user.id}`)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;