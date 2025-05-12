import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for the phishing link

// You might want to pass campaignSubject and targetName as props if not fetching them here
const EmailPreview = ({ campaignId, targetId, show, onHide, campaignSubjectProp, targetNameProp }) => {
  const [loading, setLoading] = useState(false); // Don't start loading until show is true
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null); // To store token, template_name, etc.

  useEffect(() => {
    const loadPreviewToken = async () => {
      if (!show || !campaignId || !targetId) {
        setPreviewData(null); // Reset if not shown or IDs are missing
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Use POST for the new endpoint
        const response = await axios.post(`/api/campaigns/${campaignId}/preview-token/${targetId}`);
        setPreviewData(response.data);
      } catch (err) {
        console.error('Error loading email preview token:', err);
        setError(err.response?.data?.message || 'Failed to load email preview data.');
        setPreviewData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadPreviewToken();
  }, [campaignId, targetId, show]);
  
  // Construct the phishing link (adjust FRONTEND_URL if necessary)
  const phishingLink = previewData?.unique_token
    ? `/#/phish/${previewData.template_name}/${previewData.unique_token}`
    : '#';

  // Use passed props or data from previewData for subject/name
  const emailSubject = campaignSubjectProp || previewData?.campaign_subject || "Important Update";
  const targetName = targetNameProp || "Valued User";


  // Basic email structure similar to your PreviewEmail.jsx
  // This is a simplified version. You'll need to adapt styles and content.
  const renderEmailContent = () => {
    if (!previewData) return <p>No preview data available.</p>;

    return (
      <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: '20px', border: '1px solid #ddd', backgroundColor: '#fff' }}>
        <p><strong>From:</strong> Security Team &lt;noreply@example.com&gt;</p>
        <p><strong>Subject:</strong> {emailSubject}</p>
        <hr />
        <p>Dear {targetName},</p>
        <p>This is a test phishing email. Please click the link below to proceed with the simulation.</p>
        <p>Our security systems have detected unusual sign-in activities on your account. To ensure your account security, immediate action is required.</p>
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          {/* Use a regular <a> tag for links inside this "email" preview.
              If you use react-router <Link>, it might try to navigate within the modal.
              The target="_blank" and rel="noopener noreferrer" are good for external-like links.
          */}
          <a 
            href={phishingLink} 
            target="_blank" // Open in new tab to simulate real email click
            rel="noopener noreferrer"
            style={{ display: 'inline-block', backgroundColor: '#0078d4', color: '#ffffff', textDecoration: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: 'bold' }}
          >
            Verify Account Now
          </a>
        </div>
        <p>If you did not initiate this request, please click the link above to secure your account immediately.</p>
        <p>Sincerely,<br />The Security Team</p>
        <hr />
        <p style={{ fontSize: '12px', color: '#777' }}>&copy; {new Date().getFullYear()} Your Company. This is a simulated email.</p>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Email Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: '#f8f9fa' /* Light grey background for modal body */ }}>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading preview data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : previewData ? (
          renderEmailContent()
        ) : (
          <Alert variant="info">Preview data could not be loaded.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailPreview;