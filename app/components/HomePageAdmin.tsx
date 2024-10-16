"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Bus from "../../public/bus.png";
import Elipse from "../../public/elipse.png";
import Navbar from "../common/Navbar";
import CardPageAdmin from "./CardPageAdmin";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  userId: string;
}
const HomePageAdmin = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [greeting, setGreeting] = useState<string>("");
  const [name, setName] = useState<string>("");
  useEffect(() => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

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

    const accessToken = getCookie("accessToken");
    const decodedToken = accessToken ? decodeAccessToken(accessToken) : null;
    if (decodedToken) {
      setName(decodedToken.name);
    }
    function getGreeting(): string {
      const currentHour = new Date().getHours();

      if (currentHour >= 5 && currentHour < 12) {
        return "Morning";
      } else if (currentHour >= 12 && currentHour < 18) {
        return "Afternoon";
      } else {
        return "Evening";
      }
    }

    setGreeting(getGreeting());

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="loader-container">
          <div className="loader-container">
            <i>GTT</i>
          </div>
        </div>
      ) : null}
      <section className="home-container">
        <div className="home-bus-container">
          <Navbar />
          <Image
            src={Elipse}
            alt="elipse_design"
            className="elipse-home-image"
          />
          <Image src={Bus} alt="bus" className="bus-home-image" />
          <div className="text-home-bus">
            <p className="text-p">
              Home / <span style={{ color: "white" }}>Dashboard</span>
            </p>
            <div className="text-greet">
              <h2>
                {greeting}, {name}
              </h2>
              <p>Track & manage your transport here!</p>
            </div>
          </div>
        </div>
        <CardPageAdmin setIsLoading={setIsLoading} />
      </section>
    </>
  );
};

export default HomePageAdmin;
