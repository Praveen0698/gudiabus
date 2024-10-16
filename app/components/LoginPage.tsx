"use client";
import React, { useState, useEffect } from "react";
import SideImg from "../../public/loginbus.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
interface DecodedToken extends JwtPayload {
  userId: string;
}
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(";").shift() || null;
    }
    return null;
  };

  const decodeAccessToken = (token: string): DecodedToken | null => {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      return decoded;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const cookieAccessToken = getCookie("accessToken");
      try {
        // First attempt: validate with the general API
        const response = await axios.get("/api/auth/validate", {
          withCredentials: true,
        });

        let accessToken = response?.data?.accessToken;
        let decodedToken = accessToken ? decodeAccessToken(accessToken) : null;

        // If the first call succeeds and the user is logged in, route based on role
        if (response.data.isLoggedIn && cookieAccessToken) {
          if (decodedToken?.role === "admin") {
            router.push("/dashboard");
          } else if (decodedToken?.role === "manager") {
            router.push("/dashboard/manager");
          }
        }
      } catch (error) {
        try {
          // If the first API fails, try the manager-specific validation
          const responseManager = await axios.get(
            "/api/auth/validate/manager",
            {
              withCredentials: true,
            }
          );

          let accessTokenManager = responseManager?.data?.accessToken;
          let decodedTokenManager = accessTokenManager
            ? decodeAccessToken(accessTokenManager)
            : null;

          // If the second call succeeds, handle routing for manager
          if (responseManager.data.isLoggedIn && cookieAccessToken) {
            if (decodedTokenManager?.role === "manager") {
              router.push("/dashboard/manager");
            }
          }
        } catch (secondError) {
          // If both API calls fail, handle the error
          console.error("Both API calls failed:", error, secondError);
        }
      }
    };

    checkLoginStatus();
  }, [router]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        username: username.toLowerCase(),
        password,
      });

      const { accessToken, role } = response.data;
      document.cookie = `accessToken=${accessToken}; path=/;`;
      if (role === "admin") {
        router.push("/dashboard");
      } else if (role === "manager") {
        router.push("/dashboard/manager");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  useEffect(() => {
    if (error.length > 0) {
      setIsLoading(false);
    }
  }, [error]);

  return (
    <>
      {isLoading ? (
        <div className="loader-container">
          <div className="loader-container">
            <i>GTT</i>
          </div>
        </div>
      ) : null}
      <div className="login-container">
        <h1 className="company-name">GTT</h1>
        <div className="login-content">
          <h1 style={{ color: "white" }}>Login</h1>
          <div className="text-field">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button
              type="submit"
              onClick={handleLogin}
              style={{ cursor: "pointer" }}
            >
              Login
            </button>
          </div>
        </div>
        <div className="login-image">
          <Image src={SideImg} alt="Side Visual" className="login-image" />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
