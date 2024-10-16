"use client";
import React, { useState } from "react";
import SideImg from "../../public/loginbus.png";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    try {
      const response = await axios.post("/api/auth/login", {
        email: emailOrPhone,
        password,
      });

      const { accessToken } = response.data;

      // Store the access token in a cookie
      document.cookie = `accessToken=${accessToken}; path=/;`;
      console.log(accessToken);
      // Redirect after successful login
      // router.push("/dashboard");
    } catch (error) {
      setError("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="company-name">GTT</h1>
      <div className="login-content">
        <h1 style={{ color: "white" }}>Login</h1>
        <div className="text-field">
          <input
            type="text"
            placeholder="Enter your username"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button type="submit" onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
      <div className="login-image">
        <Image src={SideImg} alt="Side Visual" className="login-image" />
      </div>
    </div>
  );
};

export default LoginPage;
