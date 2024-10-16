"use client";
import React from "react";
import Image from "next/image";
import Logo from "../../public/logo.png";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  userId: string;
}
const Navbar = () => {
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

  const handleBtnClick = () => {
    const accessToken = getCookie("accessToken");
    const decodedToken = accessToken ? decodeAccessToken(accessToken) : null;
    if (decodedToken?.role === "manager") {
      router.push("/dashboard/manager");
    } else {
      router.push("/dashboard");
    }
  };

  const handleLogout = () => {
    // Remove accessToken and refreshToken from cookies
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    document.cookie =
      "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";

    // Redirect to the home page
    router.push("/");
  };

  return (
    <div className="home-nav-bar-container">
      <div className="logo-dash-container">
        <Image src={Logo} alt="Logo" className="logo-home-image" />
        <button className="home-nav-dashboard" onClick={handleBtnClick}>
          Dashboard
        </button>
      </div>
      <button className="home-nav-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Navbar;
