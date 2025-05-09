/**
 * Generates chart configuration for campaign statistics
 * @param {Object} stats - Campaign statistics data
 * @param {string} userId - Optional user ID to filter statistics
 * @returns {Object} Chart configuration
 */
export const generateCampaignChartData = (stats, userId = null) => {
  // Filter statistics by user ID if provided
  const filteredStats = userId
    ? {
        emailsSent: stats?.emailsSent?.filter(item => item.userId === userId).length || 0,
        emailsOpened: stats?.emailsOpened?.filter(item => item.userId === userId).length || 0,
        linksClicked: stats?.linksClicked?.filter(item => item.userId === userId).length || 0,
        credentialsSubmitted: stats?.credentialsSubmitted?.filter(item => item.userId === userId).length || 0,
      }
    : {
        emailsSent: stats?.emailsSent?.length || 0,
        emailsOpened: stats?.emailsOpened?.length || 0,
        linksClicked: stats?.linksClicked?.length || 0,
        credentialsSubmitted: stats?.credentialsSubmitted?.length || 0,
      };

  return {
    labels: ['Sent', 'Opened', 'Clicked', 'Credentials'],
    datasets: [
      {
        label: 'Campaign Statistics',
        data: [
          filteredStats.emailsSent,
          filteredStats.emailsOpened,
          filteredStats.linksClicked,
          filteredStats.credentialsSubmitted
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
};

/**
 * Generates chart configuration for quiz statistics
 * @param {Object} quizStats - Quiz statistics data
 * @returns {Object} Chart configuration
 */
export const generateQuizChartData = (quizStats) => {
  return {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        label: 'Quiz Results',
        data: [quizStats.passCount, quizStats.failCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
};

/**
 * Default options for bar charts
 */
export const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Campaign Statistics'
    }
  }
};

/**
 * Default options for pie charts
 */
export const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
    title: {
      display: true,
      text: 'Quiz Results'
    }
  }
};