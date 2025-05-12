import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PhishingPopup from './PhishingPopup';
import ClickTrackerPopup from './ClickTrackerPopup';

const Surprise = () => {
  const [showPhishingPopup, setShowPhishingPopup] = useState(false);
  const [showClickTracker, setShowClickTracker] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const user = JSON.parse(localStorage.getItem('user')); // Get user from local storage

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const response = await axios.get(`/api/campaigns/user/${user.id}`);
        if (response.data) {
          setCampaign(response.data);
          setShowPhishingPopup(true);
          setShowClickTracker(true);
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
      }
    };

    fetchCampaign();
  }, [user.id]);

  return (
    <>
      <PhishingPopup
        show={showPhishingPopup}
        onHide={() => setShowPhishingPopup(false)}
        campaign={campaign}
        user={user}
      />
      {showClickTracker && (
        <ClickTrackerPopup
          show={showClickTracker}
          onHide={() => setShowClickTracker(false)}
          user={user}
        />
      )}
    </>
  );
};

export default Surprise;