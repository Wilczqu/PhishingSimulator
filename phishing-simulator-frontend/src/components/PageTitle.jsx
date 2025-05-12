import React from 'react';

/**
 * Component that updates the document title
 * @param {Object} props
 * @param {string} props.title - The title to set for the page
 */
const PageTitle = ({ title }) => {
  React.useEffect(() => {
    document.title = `${title} | Phishing Simulator`;
  }, [title]);

  // This component doesn't render anything
  return null;
};

export default PageTitle;