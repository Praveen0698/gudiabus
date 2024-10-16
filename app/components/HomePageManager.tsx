"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Bus from "../../public/bus.png";
import Elipse from "../../public/elipse.png";
import Navbar from "../common/Navbar";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { FaBus } from "react-icons/fa";
import axios from "axios";
import { MdAssignmentAdd } from "react-icons/md";
import { BsFillFuelPumpFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
interface DecodedToken extends JwtPayload {
  userId: string;
}
const HomePageManager = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [greeting, setGreeting] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [employeeId, setEmployeeId] = useState("");
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
      try {
        const response = await axios.get("/api/auth/validate/manager", {
          withCredentials: true,
        });
        const cookieAccessToken = getCookie("accessToken");
        const accessToken = response.data.accessToken;
        const decodedToken = accessToken
          ? decodeAccessToken(accessToken)
          : null;
        if (
          !response.data.isLoggedIn ||
          !cookieAccessToken ||
          decodedToken?.role !== "manager"
        ) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error in login validation:", error);
      }
    };

    checkLoginStatus();
  }, [router]);

  useEffect(() => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

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
      setEmployeeId(decodedToken.id);
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
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [getProject, setGetProject] = useState<any[]>([]);
  const projectDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/project/get/${employeeId}`);
      if (!res.data.message) {
        setGetProject(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      projectDetails();
    }
  }, [employeeId]);

  const handleShift = (
    projectId: string,
    projectName: string,
    empId: string,
    source: string,
    destination: string,
    vehicle: string
  ) => {
    router.push(
      `/shift?projectId=${projectId}&projectName=${projectName}&empId=${empId}&source=${source}&destination=${destination}&vehicle=${vehicle}`
    );
    setIsLoading(true);
  };

  const handleMaintenance = (
    projectId: string,
    projectName: string,
    empId: string
  ) => {
    setIsLoading(true);
    router.push(
      `/maintenance?projectId=${projectId}&projectName=${projectName}&empId=${empId}`
    );
  };

  const handleFuel = (
    projectId: string,
    projectName: string,
    empId: string
  ) => {
    setIsLoading(true);
    router.push(
      `/fuel?projectId=${projectId}&projectName=${projectName}&empId=${empId}`
    );
  };

  const handleViewShift = (
    projectId: string,
    projectName: string,
    empId: string
  ) => {
    setIsLoading(true);
    router.push(
      `/shift/viewall?projectId=${projectId}&projectName=${projectName}&empId=${empId}`
    );
  };

  const handleViewVehicle = (
    projectId: string,
    projectName: string,
    empId: string
  ) => {
    setIsLoading(true);
    router.push(
      `/maintenance/viewall?projectId=${projectId}&projectName=${projectName}&empId=${empId}`
    );
  };
  const handleViewFuel = (
    projectId: string,
    projectName: string,
    empId: string
  ) => {
    setIsLoading(true);
    router.push(
      `/fuel/viewall?projectId=${projectId}&projectName=${projectName}&empId=${empId}`
    );
  };

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
        <div className="table-main-container" style={{ margin: "40px 0" }}>
          <TableContainer component={Paper} className="table-container">
            <h3 style={{ margin: "10px" }}>Projects</h3>
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              {getProject.length === 0 ? (
                ""
              ) : (
                <caption>
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={getProject.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </caption>
              )}

              <TableHead style={{ background: "#ddff8f" }}>
                <TableRow>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    SL
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Project Name
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Source
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Destination
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Shifts
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Vehicles
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Fuel
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                    colSpan={3}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getProject.map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                    <TableCell style={{ textAlign: "center" }}>
                      {index + 1}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {row.projectName}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {row.source}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {row.destination}
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <button
                        className="py-1 px-2 bg-slate-700 text-white rounded-md"
                        onClick={() =>
                          handleViewShift(
                            row._id,
                            row.projectName,
                            row.employeeId
                          )
                        }
                      >
                        view
                      </button>
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <button
                        className="py-1 px-2 bg-slate-700 text-white rounded-md"
                        onClick={() =>
                          handleViewVehicle(
                            row._id,
                            row.projectName,
                            row.employeeId
                          )
                        }
                      >
                        view
                      </button>
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <button
                        className="py-1 px-2 bg-slate-700 text-white rounded-md"
                        onClick={() =>
                          handleViewFuel(
                            row._id,
                            row.projectName,
                            row.employeeId
                          )
                        }
                      >
                        view
                      </button>
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <MdAssignmentAdd
                        className="table-action-icon"
                        style={{ color: "green" }}
                        onClick={() =>
                          handleShift(
                            row._id,
                            row.projectName,
                            row.employeeId,
                            row.source,
                            row.destination,
                            row.vehicle
                          )
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaBus
                        className="table-action-icon"
                        style={{ color: "purple" }}
                        onClick={() =>
                          handleMaintenance(
                            row._id,
                            row.projectName,
                            row.employeeId
                          )
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <BsFillFuelPumpFill
                        className="table-action-icon"
                        style={{ color: "blue" }}
                        onClick={() =>
                          handleFuel(row._id, row.projectName, row.employeeId)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {getProject.length === 0 ? (
              <div className="table-nodata">
                <h2>NO DATA</h2>
              </div>
            ) : null}
          </TableContainer>
        </div>
      </section>
    </>
  );
};

export default HomePageManager;
