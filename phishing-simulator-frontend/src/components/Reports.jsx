import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import Navbar from './Navbar';
import 'chart.js/auto';

const Reports = ({ user }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalTargets: 0,
    emailsSent: 0,
    emailsOpened: 0,
    linksClicked: 0,
    credentialsSubmitted: 0
  });
  
  useEffect(() => {
    if (user && user.id) {
      Promise.all([
        fetchCampaigns(),
        fetchOverallStats()
      ]);
    }
  }, [user]);
  
  const fetchCampaigns = async () => {
    try {
      // Get campaigns specific to user role
      const endpoint = user.role === 'admin' 
        ? '/api/campaigns' 
        : `/api/campaigns/user/${user.id}`;
        
      const response = await axios.get(endpoint);
      
      // Only include active or completed campaigns
      const filteredCampaigns = response.data.filter(
        c => c.status === 'active' || c.status === 'completed'
      );
      setCampaigns(filteredCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOverallStats = async () => {
    try {
      // Get stats specific to user role
      const endpoint = user.role === 'admin' 
        ? '/api/stats/overall' 
        : `/api/stats/user/${user.id}`;
        
      const response = await axios.get(endpoint);
      setOverallStats(response.data);
    } catch (error) {
      console.error('Error fetching overall stats:', error);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Calculate overall percentages safely to avoid NaN
  const openRate = overallStats.emailsSent > 0 ? 
    (overallStats.emailsOpened / overallStats.emailsSent * 100).toFixed(1) : 0;
    
  const clickRate = overallStats.emailsOpened > 0 ? 
    (overallStats.linksClicked / overallStats.emailsOpened * 100).toFixed(1) : 0;
    
  const submissionRate = overallStats.linksClicked > 0 ? 
    (overallStats.credentialsSubmitted / overallStats.linksClicked * 100).toFixed(1) : 0;

  // Use Number() to convert string percentages to numbers for chart data
  const chartData = {
    labels: ['Email Open Rate', 'Link Click Rate', 'Submission Rate'],
    datasets: [
      {
        label: 'Percentage (%)',
        data: [Number(openRate), Number(clickRate), Number(submissionRate)],
        backgroundColor: [
          'rgba(255, 206, 86, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div>
      <Navbar activePage="reports" user={user} />
      
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h5 className="mb-0">Overall Phishing Campaign Results</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-8">
                      <Bar 
                        data={chartData} 
                        options={{ 
                          responsive: true,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100,
                              title: {
                                display: true,
                                text: 'Percentage (%)'
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                    <div className="col-md-4">
                      <div className="stats-summary">
                        <h5 className="mb-3">Summary</h5>
                        <p><strong>Total Campaigns:</strong> {campaigns.length}</p>
                        <p><strong>Total Targets:</strong> {overallStats.totalTargets}</p>
                        <p><strong>Emails Sent:</strong> {overallStats.emailsSent}</p>
                        <p><strong>Open Rate:</strong> {openRate}%</p>
                        <p><strong>Click Rate:</strong> {clickRate}%</p>
                        <p><strong>Submission Rate:</strong> {submissionRate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h5 className="mb-0">Campaign Reports</h5>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : campaigns.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Campaign Name</th>
                          <th>Status</th>
                          <th>Start Date</th>
                          <th>Open Rate</th>
                          <th>Click Rate</th>
                          <th>Submission Rate</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(campaign => (
                          <tr key={campaign.id}>
                            <td>{campaign.name}</td>
                            <td>
                              <span className={`badge ${campaign.status === 'completed' ? 
                                'bg-secondary' : 'bg-success'}`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                            </td>
                            <td>{formatDate(campaign.createdAt)}</td>
                            <td>{campaign.open_rate || 0}%</td>
                            <td>{campaign.click_rate || 0}%</td>
                            <td>{campaign.submission_rate || 0}%</td>
                            <td>
                              <Link 
                                to={`/report/${campaign.id}`} 
                                className="btn btn-sm btn-outline-primary"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No active or completed campaigns to report on.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;