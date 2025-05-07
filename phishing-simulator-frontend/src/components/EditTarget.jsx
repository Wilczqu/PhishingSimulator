import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const EditTarget = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [target, setTarget] = useState({ name: '', email: '', department: '' });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchTarget = async () => {
      try {
        const response = await axios.get(`/api/targets/${id}`);
        setTarget(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching target:', error);
        setErrorMsg('Failed to load target data');
        setLoading(false);
      }
    };

    fetchTarget();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTarget(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/targets/${id}`, target);
      setSuccessMsg('Target updated successfully!');
      
      // Clear success message and redirect after 2 seconds
      setTimeout(() => {
        navigate('/targets');
      }, 2000);
    } catch (error) {
      console.error('Error updating target:', error);
      setErrorMsg('Failed to update target. Please try again.');
    }
  };

  return (
    <div>
      <Navbar activePage="targets" user={user} />
      
      <div className="container mt-4">
        <div className="card shadow-sm">
          <div className="card-header">
            <h5 className="mb-0">Edit Target</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {errorMsg && (
                  <div className="alert alert-danger">{errorMsg}</div>
                )}
                {successMsg && (
                  <div className="alert alert-success">{successMsg}</div>
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
                  
                  <div className="d-flex justify-content-end gap-2">
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => navigate('/targets')}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTarget;