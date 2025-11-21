"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AUTH_COOKIE } from "../constants";

export function useAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(";");
      const authCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${AUTH_COOKIE}=`)
      );

      setIsAuthenticated(!!authCookie);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const redirectToLogin = () => {
    router.push("/auth/sign-in");
  };

  const redirectToDashboard = () => {
    router.push("/dashboard");
  };

  return {
    isLoading,
    isAuthenticated,
    redirectToLogin,
    redirectToDashboard,
  };
}
