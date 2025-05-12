import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { Modal, Button, Form } from 'react-bootstrap';

const Targets = ({ user }) => {
  const [targets, setTargets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTarget, setNewTarget] = useState({ name: '', email: '', department: '', userId: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchTargets();
    fetchUsers();
  }, []);
  
  const fetchTargets = async () => {
    try {
      const response = await axios.get('/api/targets');
      setTargets(response.data);
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.filter(user => user.role !== 'admin'));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTarget(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTarget = async (e) => {
    e.preventDefault();
    try {
      // Validate input
      if (!newTarget.name || !newTarget.email) {
        throw new Error('Name and email are required fields');
      }

      const response = await axios.post('/api/targets', {
        name: newTarget.name.trim(),
        email: newTarget.email.trim().toLowerCase(),
        department: newTarget.department?.trim() || null,
        userId: newTarget.userId || null // Include userId in the request
      });

      setNewTarget({ name: '', email: '', department: '', userId: '' });
      setSuccessMessage('Target added successfully!');
      fetchTargets(); // Refresh the list
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error adding target:', error);
      setSuccessMessage(`Failed to add target: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this target?')) {
      try {
        await axios.delete(`/api/targets/${id}`);
        setSuccessMessage('Target deleted successfully!');
        fetchTargets();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Error deleting target:', error);
      }
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  
  return (
    <div>
      <Navbar activePage="targets" user={user} />
      
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Manage Targets</h5>
                <button 
                  className="btn btn-sm btn-primary" 
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-plus"></i> Add Target
                </button>
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
                
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : targets.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Added On</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {targets.map(target => (
                          <tr key={target.id}>
                            <td>{target.name}</td>
                            <td>{target.email}</td>
                            <td>{target.department || 'N/A'}</td>
                            <td>{formatDate(target.createdAt)}</td>
                            <td>
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  console.log(`Navigating to /edit-target/${target.id}`);
                                  navigate(`/edit-target/${target.id}`);
                                }}
                              >
                                <i className="bi bi-pencil"></i> Edit
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger ms-2"
                                onClick={() => handleDelete(target.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="alert alert-info">
                    No targets found. Add some targets to get started!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Target</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleAddTarget}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="name" 
                  name="name"
                  value={newTarget.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  name="email"
                  value={newTarget.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="mb-3">
                <label htmlFor="department" className="form-label">Department</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="department" 
                  name="department"
                  value={newTarget.department}
                  onChange={handleInputChange}
                />
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Assign User</Form.Label>
                <Form.Control
                  as="select"
                  name="userId"
                  value={newTarget.userId}
                  onChange={handleInputChange}
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.username}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit">
                Add Target
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default Targets;
