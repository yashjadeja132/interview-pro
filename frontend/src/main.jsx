import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import './App.css'
import './question.css'
import './main.css'
import Layout from "./Layout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import { Homepage } from "./pages/Homepage.jsx";
import { StudentLogin } from "./pages/candidate/CandidateLogin.jsx";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import { AdminLogin } from "./pages/authpages/AdminLogin.jsx";
import CreateQuestion from "./pages/admin/CreateQuestion.jsx";
import QuestionManagement from "./pages/admin/QuestionManagement.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import Settings from "./pages/admin/Settings.jsx";
import Profile from "./pages/admin/Profile.jsx";
import ResetPassword from "./pages/authpages/ResetPassword.jsx";
// import AttemptManagement from "./pages/admin/AttemptManagement.jsx";
// import AttemptManagementTest from "./pages/admin/AttemptManagementTest.jsx";
import CandidateHistory from "./pages/admin/CandidateHistory.jsx";
import PositionManagement from "./pages/hr/PositionManagement.jsx";
import CandidateManagement from "./pages/hr/CandidateManagement.jsx";
import CandidateMonitoring from "./pages/hr/CandidateMonitoring.jsx";
import StartButton from "./pages/candidate/StartButton.jsx";
import CandidateDashboardWithAttempts from "./pages/candidate/CandidateDashboardWithAttempts.jsx";
import QuizTest from "./pages/candidate/QuizTest";
import QuizTestWithAttempts from "./pages/candidate/QuizTestWithAttempts";
import ThankYou from "./pages/candidate/ThankYou.jsx";
import ThankYouWithAttempts from "./pages/candidate/ThankYouWithAttempts.jsx";
import CandidateResult from './pages/candidate/CandidateResult.jsx'
import ForgotPassword from "./pages/authpages/ForgotPassword.jsx";
import ThemeProvider from "./context/ThemeContext";

function Main() {
  const [streams, setStreams] = useState(null);
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        {/* Public Routes - No Layout */}
        <Route path="/" element={<Homepage />} />
        <Route path="/candidate/login" element={<StudentLogin />} />
        <Route path="/candidate/StartTest" element={<StartButton setStreams={setStreams} />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboardWithAttempts />} />
        <Route path="/candidate/Quiztest" element={<QuizTest streams={streams} />} />
        <Route path="/candidate/QuiztestWithAttempts" element={<QuizTestWithAttempts streams={streams} />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/thank-you-with-attempts" element={<ThankYouWithAttempts />} />
        <Route path='/candidate/result/:candidateId' element={<CandidateResult />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password/:email" element={<ResetPassword />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />
        {/* Admin/HR Routes - With AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1></div>} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin/HR Routes - Direct with AdminLayout */}
        <Route path="/candidateManagement" element={<AdminLayout />}>
          <Route index element={<CandidateManagement />} />
        </Route>
        {/* <Route path="/attemptManagement" element={<AdminLayout />}>
          <Route index element={<AttemptManagement />} />
        </Route>
        <Route path="/attemptManagementTest" element={<AdminLayout />}>
          <Route index element={<AttemptManagementTest />} />
        </Route> */}
        <Route path="/candidateMonitoring" element={<AdminLayout />}>
          <Route index element={<CandidateMonitoring />} />
        </Route>
        <Route path="/createQuestion" element={<AdminLayout />}>
          <Route index element={<CreateQuestion />} />
        </Route>
        <Route path="/questionManagement" element={<AdminLayout />}>
          <Route index element={<QuestionManagement />} />
        </Route>
        <Route path="/positionManagement" element={<AdminLayout />}>
          <Route index element={<PositionManagement />} />
        </Route>
        <Route path="/candidate/:candidateId/position/:positionId/history" element={<AdminLayout />}>
          <Route index element={<CandidateHistory />} />
        </Route>
      </Route>
    )
  );

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
 
 <ThemeProvider >
 <StrictMode>
    
      <Main />
    
  </StrictMode>
  </ThemeProvider> 
);



