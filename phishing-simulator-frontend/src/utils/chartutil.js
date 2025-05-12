/**
 * Generates chart configuration for campaign statistics
 * @param {Object} stats - Campaign statistics data
 * @returns {Object} Chart configuration
 */
export const generateCampaignChartData = (stats) => {
  // Ensure all values are processed as numbers
  const emailsSent = Number(stats.emailsSent || 0);
  const emailsOpened = Number(stats.emailsOpened || 0);
  const linksClicked = Number(stats.linksClicked || 0); 
  const credentialsSubmitted = Number(stats.credentialsSubmitted || 0);

  console.log('Campaign Chart Data Values:', { emailsSent, emailsOpened, linksClicked, credentialsSubmitted });

  return {
    labels: ['Sent', 'Opened', 'Clicked', 'Credentials'],
    datasets: [
      {
        label: 'Campaign Statistics',
        data: [emailsSent, emailsOpened, linksClicked, credentialsSubmitted],
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
  // Convert all values to numbers to ensure correct chart rendering
  const passCount = Number(quizStats.passCount || 0);
  const failCount = Number(quizStats.failCount || 0);
  
  console.log('Quiz Chart Data Values:', { passCount, failCount });
  
  return {
    labels: ['Passed', 'Failed'],
    datasets: [
      {
        label: 'Quiz Results',
        data: [passCount, failCount],
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