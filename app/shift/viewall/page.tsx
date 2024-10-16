"use client";
import React, { useEffect, useState, Suspense } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Paper from "@mui/material/Paper";
import Image from "next/image";
import Navbar from "../../common/Navbar";
import Elipse from "../../../public/elipse.png";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  userId: string;
}

const ShiftViewTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const router = useRouter();

  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId");
  const empId = searchParams.get("empId");
  const projectName = searchParams.get("projectName");

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
        const accessToken = getCookie("accessToken");
        const decodedToken = accessToken
          ? decodeAccessToken(accessToken)
          : null;
        console.log(decodedToken);
        if (
          !response.data.isLoggedIn ||
          !accessToken ||
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
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
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

  const [getShift, setGetShift] = useState<any[]>([]);

  const fetchShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/shift/getall/${empId}/${projectId}`);
      console.log(res.data);
      setGetShift(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShiftView = (shift: object) => {
    setIsLoading(true);
    const encodedShift = encodeURIComponent(JSON.stringify(shift));
    router.push(
      `/shift/view?shift=${encodedShift}&empId=${empId}&projectId=${projectId}&projectName=${projectName}`
    );
  };

  useEffect(() => {
    fetchShift();
  }, [empId, projectId]);

  const deleteClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .delete(`/api/shift/delete`, { data: { id } })
      .then(() => {
        fetchShift();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <Suspense fallback={<div>Loading shift view...</div>}>
      {isLoading ? (
        <div className="loader-container">
          <div className="loader-container">
            <i>GTT</i>
          </div>
        </div>
      ) : null}
      <section className="firm-main-container">
        <Navbar />
        <Image
          src={Elipse}
          alt="elipse_design"
          style={{ width: "100%" }}
          className="elipse-home-image"
        />
        <p className="text-p card-badge">
          Home / <span style={{ color: "white" }}>All Shifts</span>
        </p>

        <div className="table-main-container">
          <div className="title-button-container">
            <h3 className="table-h3">All Shifts</h3>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              {getShift.length === 0 ? (
                ""
              ) : (
                <caption>
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={getShift.length}
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
                    Date
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                    colSpan={2}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getShift
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                      <TableCell style={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.projectName}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.date}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaEye
                          className="table-action-icon m-[auto]"
                          style={{ color: "blue" }}
                          onClick={() => handleShiftView(row)}
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <MdDelete
                          className="table-action-icon m-[auto]"
                          style={{ color: "red" }}
                          onClick={() => deleteClick(row._id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {getShift.length === 0 ? (
              <div className="table-nodata">
                <h2>NO DATA</h2>
              </div>
            ) : null}
          </TableContainer>
        </div>
      </section>
    </Suspense>
  );
};

export default ShiftViewTable;
