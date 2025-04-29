import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../../../../phishing-simulator-frontend/src/components/Navbar';

const EditTarget = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [target, setTarget] = useState({ name: '', email: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    fetchTarget();
  }, [id]);
  
  const fetchTarget = async () => {
    try {
      const response = await axios.get(`/api/targets/${id}`);
      setTarget(response.data);
    } catch (error) {
      console.error('Error fetching target:', error);
      setError('Failed to load target data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTarget(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    try {
      await axios.put(`/api/targets/${id}`, target);
      setSuccessMessage('Target updated successfully!');
      
      // Auto navigate back after success
      setTimeout(() => {
        navigate('/targets');
      }, 2000);
    } catch (error) {
      console.error('Error updating target:', error);
      setError('Failed to update target');
    }
  };
  
  const handleCancel = () => {
    navigate('/targets');
  };
  
  return (
    <div>
      <Navbar activePage="targets" />
      
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="card shadow-sm">
              <div className="card-header">
                <h5 className="mb-0">Edit Target</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="alert alert-danger">{error}</div>
                    )}
                    
                    {successMessage && (
                      <div className="alert alert-success">{successMessage}</div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          id="name" 
                          name="name"
                          value={target.name}
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
                          value={target.email}
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
                          value={target.department || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="d-flex justify-content-between">
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleCancel}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Update Target
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTarget;