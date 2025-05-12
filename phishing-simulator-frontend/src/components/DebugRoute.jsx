import React from 'react';
import  { useParams, useLocation } from 'react-router-dom';

const DebugRoute = () => {
  const params = useParams();
  const location = useLocation();
  
  return (
    <div style={{padding: "20px", background: "#f8f9fa", border: "1px solid #ddd"}}>
      <h3>Debug Route Information</h3>
      <p><strong>Current Path:</strong> {location.pathname}</p>
      <p><strong>Parameters:</strong></p>
      <pre>{JSON.stringify(params, null, 2)}</pre>
      <p><strong>Location:</strong></p>
      <pre>{JSON.stringify(location, null, 2)}</pre>
    </div>
  );
};

export default DebugRoute;