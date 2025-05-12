import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const UserManagement = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Update filtered users when users or search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(users.filter(user => 
        user.username.toLowerCase().includes(query) || 
        user.role.toLowerCase().includes(query)
      ));
    }
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await axios.post('/api/admin/users', newUser);
      setSuccessMessage('User added successfully!');
      setNewUser({ username: '', password: '', role: 'user' });
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.response?.data?.message || 'Failed to add user. Please try again.');
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
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError(`Failed to update user role: ${error.response?.data?.message || error.message}`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setSuccessMessage(`User deleted successfully!`);
        setUsers(users.filter(u => u.id !== userId));
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error deleting user:', error);
        setError(`Failed to delete user: ${error.response?.data?.message || error.message}`);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <Container className="mt-4">
        <Navbar activePage="admin" user={user} />
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading users...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Navbar activePage="admin" user={user} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        <Button variant="success" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus"></i> Add New User
        </Button>
      </div>
      
      {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
      {successMessage && <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form className="mb-4">
            <Form.Group>
              <Form.Control
                type="text"
                placeholder="Search users by username or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
          </Form>
          
          <div className="table-responsive">
            <Table hover bordered>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      <Badge bg={user.role === 'admin' ? 'danger' : 'info'}>
                        {user.role}
                      </Badge>
                    </td>
                    <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                    <td>{new Date(user.createdAt).toLocaleString()}</td>
                    <td>
                      <Button 
                        variant="outline-secondary" 
                        size="sm"
                        className="me-2"
                        onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
                      >
                        {user.role === 'admin' ? 'Make User' : 'Make Admin'}
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      No users found matching the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
      
      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddUser}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddUser}
            disabled={!newUser.username || !newUser.password}
          >
            Add User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;