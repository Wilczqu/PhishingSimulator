import React from 'react';
import  { Link, useParams } from 'react-router-dom'; // Assuming you might pass a campaign/target name via params later

// Placeholder for image - in a real app, you'd import it or use a public URL
const microsoftLogo = "/images/microsoft_logo.png"; // Replace with actual logo path

const PreviewEmail = () => {
  // For a generic demo, we can use a static name or leave it dynamic for future use
  const name = "Valued User"; // Or get from URL params if this becomes specific to a target
  const demoToken = "demo_phish_token"; // A static token for this demo flow

  // Construct the phishing link to the Office365Login component
  // The 'office365' part should match the template name expected by your /phish/:template/:token route
  const phishingUrl = `/phish/office365/${demoToken}`;

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", margin: 0, padding: 0, backgroundColor: '#f4f4f4', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <table cellPadding="0" cellSpacing="0" border="0" style={{ maxWidth: '600px', margin: '20px auto', backgroundColor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <tbody>
          <tr>
            <td style={{ padding: '20px' }}>
              <table width="100%" cellPadding="0" cellSpacing="0" border="0">
                {/* Header */}
                <tbody>
                  <tr>
                    <td style={{ paddingBottom: '20px', borderBottom: '1px solid #eeeeee' }}>
                      <img src={microsoftLogo} alt="Microsoft Office 365" style={{ maxWidth: '150px' }} />
                    </td>
                  </tr>
                  
                  {/* Content */}
                  <tr>
                    <td style={{ padding: '30px 0' }}>
                      <h2 style={{ color: '#333333', marginTop: 0, fontSize: '22px' }}>Urgent: Your Microsoft Office 365 account requires immediate attention</h2>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}>Dear {name},</p>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}>Our security systems have detected unusual sign-in activities on your Microsoft Office 365 account. To ensure your account security, immediate action is required.</p>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}>Your account access will be temporarily suspended if you do not verify your identity within the next 24 hours.</p>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}><strong>Please note:</strong> This is a time-sensitive matter and requires your immediate attention to prevent disruption to your services.</p>
                      
                      <div style={{ margin: '30px 0', textAlign: 'center' }}>
                        <a href="#/phish/office365/demo_phish_token" style={{ display: 'inline-block', backgroundColor: '#0078d4', color: '#ffffff', textDecoration: 'none', padding: '12px 24px', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px' }}>
                          Verify Account Now
                        </a>
                      </div>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}>If you did not initiate this request, please click the link above to secure your account immediately.</p>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}>Thank you for your prompt attention to this matter.</p>
                      
                      <p style={{ color: '#666666', lineHeight: 1.5, fontSize: '15px' }}>Sincerely,<br />Microsoft Office 365 Security Team</p>
                    </td>
                  </tr>
                  
                  {/* Footer */}
                  <tr>
                    <td style={{ paddingTop: '20px', borderTop: '1px solid #eeeeee', fontSize: '12px', color: '#999999' }}>
                      <p>&copy; {new Date().getFullYear()} Microsoft Corporation. All rights reserved.</p>
                      <p>Microsoft respects your privacy. Please review our <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#0078d4', textDecoration: 'none' }}>Privacy Statement</a>.</p>
                      <p>This is an automated message. Please do not reply to this email.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PreviewEmail;