"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Arrow from "../../public/arrow.png";
import { useRouter } from "next/navigation";

interface CardPageAdminProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const CardPageAdmin: React.FC<CardPageAdminProps> = ({ setIsLoading }) => {
  const router = useRouter();

  const handleFirmClick = () => {
    setIsLoading(true);
    router.push("/firm");
  };
  const handleProjectClick = () => {
    setIsLoading(true);
    router.push("/project");
  };
  const handleEmployeeClick = () => {
    setIsLoading(true);
    router.push("/employee");
  };
  const handleExpenseClick = () => {
    setIsLoading(true);
    router.push("/expense");
  };
  const handleVehicleClick = () => {
    setIsLoading(true);
    router.push("/vehicle");
  };

  return (
    <div className="home-card-container">
      <div className="single-card" onClick={handleFirmClick}>
        <h3>Firms</h3>
        <Image src={Arrow} alt="Arrow" className="Arrow-home-image" />
      </div>
      <div className="single-card" onClick={handleVehicleClick}>
        <h3>Vehicle</h3>
        <Image src={Arrow} alt="Arrow" className="Arrow-home-image" />
      </div>
      <div className="single-card" onClick={handleProjectClick}>
        <h3>Project</h3>
        <Image src={Arrow} alt="Arrow" className="Arrow-home-image" />
      </div>
      <div className="single-card" onClick={handleEmployeeClick}>
        <h3>Employees</h3>
        <Image src={Arrow} alt="Arrow" className="Arrow-home-image" />
      </div>
      <div className="single-card" onClick={handleExpenseClick}>
        <h3>Expenses</h3>
        <Image src={Arrow} alt="Arrow" className="Arrow-home-image" />
      </div>
    </div>
  );
};

export default CardPageAdmin;
