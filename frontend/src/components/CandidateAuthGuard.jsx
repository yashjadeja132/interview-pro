import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * CandidateAuthGuard
 * 1. Blocks access if candidate is not logged in.
 * 2. Blocks access to test pages if the test has already been submitted.
 */
export default function CandidateAuthGuard({ children }) {
    const location = useLocation();
    const storedData = sessionStorage.getItem("candidateData");
    const testSubmitted = sessionStorage.getItem("testSubmitted") === "true";

    // 1. Not logged in -> Redirect to login
    if (!storedData) {
        return <Navigate to="/candidate/login" state={{ from: location }} replace />;
    }

    // 2. Already submitted -> Prevent going back to StartTest or Quiztest
    const quizRelatedPaths = [
        "/candidate/StartTest",
        "/candidate/Quiztest",
        "/candidate/QuiztestWithAttempts",
        "/candidate/dashboard"
    ];

    if (testSubmitted && quizRelatedPaths.some(path => location.pathname.toLowerCase() === path.toLowerCase())) {
        // If they already submitted, send them to thank you page
        return <Navigate to="/thank-you" replace />;
    }

    // Allow access
    return children;
}
