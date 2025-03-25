// InfoPopup.jsx
import React from 'react';
import '../App.css';

const InfoPopup = ({ title, content, onClose }) => (
  <div className="info-popup">
    <h2>{title}</h2>
    <p>{content}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

export default InfoPopup;
