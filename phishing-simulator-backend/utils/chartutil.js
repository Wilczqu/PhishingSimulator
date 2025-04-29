/**
 * Generates chart configuration for campaign statistics
 * @param {Object} stats - Campaign statistics data
 * @returns {Object} Chart configuration
 */
export const generateCampaignChartData = (stats) => {
    return {
      labels: ['Sent', 'Opened', 'Clicked', 'Credentials'],
      datasets: [
        {
          label: 'Campaign Statistics',
          data: [
            stats.emailsSent,
            stats.emailsOpened,
            stats.linksClicked,
            stats.credentialsSubmitted
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