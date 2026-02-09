import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { Outlet } from "react-router-dom";

export default function ThemeApplier() {
    const { theme } = useContext(ThemeContext);
    const location = useLocation();

    useEffect(() => {
        // List of paths that should ALWAYS be in light mode
        const excludedPaths = [
            "/candidate/login",
            "/admin/login",
            "/admin/forgot-password",
        ];

        // Check if current path matches any excluded path or candidate result pattern
        const isCandidateResult = location.pathname.startsWith("/candidate/result/");
        const isResetPassword = location.pathname.startsWith("/admin/reset-password/");
        const isExcluded = excludedPaths.includes(location.pathname) || isCandidateResult || isResetPassword;

        if (theme === "dark" && !isExcluded) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme, location.pathname]);

    return <Outlet />;
}
