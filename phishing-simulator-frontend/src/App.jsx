// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';
import Quizzes from './components/Quizzes';
import Result from './components/Result';
import AdminDashboard from './components/AdminDashboard'; // <-- Import AdminDashboard
import Logout from './components/Logout';

import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard username="User" />} />
        <Route path="/logout" element={<Logout />} />
        <Route
  path="/quiz/:quizId"
  element={
    <Quiz
      quiz={{
        id: 1,
        title: 'Email Quiz',
        questions: [
          [
            "Phishing: Dear Customer, your account has been compromised. Please follow this link ACCOUNT RESET(badlink.com). Failure to comply will result in the account being permanently disabled.",
            ['True', 'False'],
            'True',
            "This email uses generic language, urgency, and a suspicious link to pressure the recipient. It's a phishing attempt.",
            "Email Phishing" // Type
          ],
          [
            "Normal: Hi, here is the invoice you requested. If you need anything else let me know.",
            ['True', 'False'],
            'False',
            "This email appears legitimate as it is conversational and doesn't ask for sensitive information or use pressuring language.",
            "Email Phishing" // Type
          ],
        
          // 2. Spear-Phishing
          [
            "Phishing: Hi, how's it going? It was a good meeting we had last month, here's the document that you asked for last week document1(badlink.com). Let me know if there is anything we need to change.",
            ['True', 'False'],
            'True',
            "This email uses familiarity and a fabricated relationship to appear credible. The link provided is malicious.",
            "Spear-Phishing" // Type
          ],
          [
            "Normal: Hi, here are the slides from our meeting yesterday evening slides.ppt(sharepoint.com). Let me know if there's anything else you need.",
            ['True', 'False'],
            'False',
            "This email seems legitimate as it references a recent meeting and uses a trusted file-sharing platform.",
            "Spear-Phishing" // Type
          ],
        
          // 3. Smishing
          [
            "Phishing: Your package is stuck in customs and is pending payment. If you do not pay within 24 hours, the package will be returned to the sender. Click here to make the payment of 27.83 euro AnPostPayCustom.com.",
            ['True', 'False'],
            'True',
            "This SMS uses urgency and a suspicious link to lure the recipient into making a fraudulent payment.",
            "Smishing" // Type
          ],
          [
            "Normal: Hi, This is a reminder of your dental appointment at Lucan Dental on April 17th at 10:00am. This is a no-reply message.",
            ['True', 'False'],
            'False',
            "This message appears legitimate as it references a valid appointment and contains no suspicious links or requests for information.",
            "Smishing" // Type
          ],
        
          // 4. Vishing
          [
            "Phishing: This is a voicemail from AIB for the Republic of Ireland. There is an issue with your account which needs to be corrected urgently as fraudulent activity is being detected. Return the call to this number immediately or else your account will be suspended and reported to the authorities.",
            ['True', 'False'],
            'True',
            "This voicemail uses urgency and fear to coerce the recipient into contacting a fraudulent number.",
            "Vishing" // Type
          ],
          [
            "Normal: Hi, This is AIB Lucan. Can you please give us a call on our customer service number which is available online or call into our branch please to clarify a transaction.",
            ['True', 'False'],
            'False',
            "This voicemail appears legitimate as it provides standard instructions and asks the recipient to use official contact methods.",
            "Vishing" // Type
          ],
        
          // 5. Clone Phishing
          [
            "Phishing: You receive an email from your supervisor - 'Please review attached document. I am busy now so don't contact me. Here is the link Doc1(badlink.com).'",
            ['True', 'False'],
            'True',
            "This email mimics a legitimate message but uses an altered link to deceive the recipient.",
            "Clone Phishing" // Type
          ],
          [
            "Normal: Hi team, please review the slide deck before tomorrow's meeting and contact me if any information is required.",
            ['True', 'False'],
            'False',
            "This email appears legitimate as it provides clear instructions without any suspicious links or pressure.",
            "Clone Phishing" // Type
          ],
        
          // 6. Business Email Compromise (BEC)
          [
            "Phishing: You receive an email from the CEO - 'Hi, I have an urgent task for you which is highly confidential. The ECB is fining us 10,000 euro due to passing deadlines on our reporting. Transfer the funds to the following IBAN IE24AIBK2783778273. Do not reply to this email when complete.'",
            ['True', 'False'],
            'True',
            "This email uses urgency and impersonation to trick the recipient into transferring funds to a fraudulent account.",
            "Business Email Compromise (BEC)" // Type
          ],
          [
            "Normal: You receive an email from the finance department - 'Hi, your payslip has been now uploaded to your HR system where it is now visible. Payments will be processed to your account on Friday. If you have any questions feel free to contact a member of the Finance team or HR.'",
            ['True', 'False'],
            'False',
            "This email appears legitimate as it provides standard instructions without urgency or requests for sensitive actions.",
            "Business Email Compromise (BEC)" // Type
          ],        
        ],        
      }}
    />
  }
/>

        
        <Route
          path="/quiz_results/:quizId"
          element={<QuizResults 
            score={2}
            total={3}
            results={[
              {
                questionText: (
                  <>
                    Dear Customer, your account has been compromised. Please follow this link{' '}
                    <a
                      href="#"
                      title="badlink.com"
                      style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                    >
                      ACCOUNT RESET
                    </a>
                    . Failure to comply will result in the account being permanently disabled.
                  </>
                ),
                answerOptions: ['True', 'False'],
                correctAnswer: 'True',
              },
              {
                questionText: (
                  <>
                    Hi, here is the invoice you requested. If you need anything else, let me know.
                  </>
                ),
                answerOptions: ['True', 'False'],
                correctAnswer: 'True',
              },
              {
                questionText: (
                  <>
                    Your account password will expire in 2 hours. Click this link to update your password immediately:{' '}
                    <a
                      href="#"
                      title="updateinfo.com"
                      style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                    >
                      PASSWORD RESET
                    </a>
                    .
                  </>
                ),
                answerOptions: ['True', 'False'],
                correctAnswer: 'True',
              },
              {
                questionText: (
                  <>
                    Hi [First Name], your weekly newsletter is ready to view! Check it out here:{' '}
                    <a
                      href="#"
                      title="legitnewsletter.com"
                      style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                    >
                      NEWSLETTER
                    </a>
                    .
                  </>
                ),
                answerOptions: ['True', 'False'],
                correctAnswer: 'False',
              },
              {
                questionText: (
                  <>
                    We have detected unusual activity in your account. Login here immediately to secure your account:{' '}
                    <a
                      href="#"
                      title="securelogin.net"
                      style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}
                    >
                      ACCOUNT SECURITY
                    </a>
                    .
                  </>
                ),
                answerOptions: ['True', 'False'],
                correctAnswer: 'True',
              },
            ]} />}
        />
        <Route
          path="/quizzes"
          element={<Quizzes quizzes={{ 1: 'Email Phishing', 2: 'Website Spoofing' }} />}
        />
        <Route path="/result" element={<Result score={2} total={3} resultText="passed" />} />

        {/* New Admin route */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
