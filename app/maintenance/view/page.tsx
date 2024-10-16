"use client";
import React, { useEffect, useState, Suspense } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { SelectChangeEvent } from "@mui/material/Select";
import Image from "next/image";
import Navbar from "../../common/Navbar";
import Elipse from "../../../public/elipse.png";
import { TextField, Button, Select, MenuItem } from "@mui/material";
import { FaDownload } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";

interface MaintenanceItem {
  id: string;
  vehicle: string;
  tyreRotation: string;
  tyreRotationFile: string;
  tyreRotationDesc: string;
  maintenance: string;
  maintenanceFile: string;
  maintenanceDesc: string;
  odometer: string;
  odometerFile: string;
  odometerDesc: string;
  washing: string;
  washingFile: string;
  washingDesc: string;
}

interface DecodedToken extends JwtPayload {
  userId: string;
}

const ShiftViewTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const [role, setRole] = useState("");

  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");
  const empId = searchParams.get("empId");
  const maintenanceId = searchParams.get("maintenanceId");

  const [getMaintenanceData, setGetMaintenanceData] = useState<
    MaintenanceItem[]
  >([]);

  const [getMaintenanceId, setGetMaintenanceId] = useState([]);

  const fetchMaintenanceData = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/vehicle/maintenance/${maintenanceId}`);
      setGetMaintenanceId(res.data.data._id);
      setGetMaintenanceData(res.data.data?.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const [getVehicle, setGetVehicle] = useState<any[]>([]);
  const [update, setUpdate] = useState(false);

  const [getProject, setGetProject] = useState<any[]>([]);
  const projectDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/project/get/${empId}`);
      if (!res.data.message) {
        const filteredData = res.data.filter(
          (project: any) => project._id === projectId
        );

        setGetProject(filteredData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (empId) {
      projectDetails();
    }
    if (getMaintenanceData.length === 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    fetchMaintenanceData();
  }, [empId, maintenanceId]);

  useEffect(() => {
    if (getProject[0]?.vehicle) {
      setGetVehicle(getProject[0]?.vehicle.split(","));
    }
  }, [getProject]);

  const getFormattedDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [item, setItem] = useState([
    {
      id: new Date().getTime().toString(),
      vehicle: "",
      tyreRotation: "",
      tyreRotationFile: "",
      tyreRotationDesc: "",
      maintenance: "",
      maintenanceFile: "",
      maintenanceDesc: "",
      odometer: "",
      odometerFile: "",
      odometerDesc: "",
      washing: "",
      washingFile: "",
      washingDesc: "",
    },
  ]);

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
        if (
          !response.data.isLoggedIn ||
          !accessToken ||
          decodedToken?.role !== "manager"
        ) {
          router.push("/");
        }
      } catch (error) {
        try {
          // First attempt: validate with the general API
          const response = await axios.get("/api/auth/validate", {
            withCredentials: true,
          });

          let accessToken = response?.data?.accessToken;
          let decodedToken = accessToken
            ? decodeAccessToken(accessToken)
            : null;

          // If the first call succeeds and the user is logged in, route based on role
          setRole(decodedToken?.role);
        } catch (error) {
          console.error("Error in login validation:", error);
        }
      }
    };

    checkLoginStatus();
  }, [router]);

  const [formData, setFormData] = useState({
    projectId: projectId,
    projectName: projectName,
    employeeId: empId,
    date: getFormattedDate(),
    items: [
      {
        id: "",
        vehicle: "",
        tyreRotation: "",
        tyreRotationFile: "",
        tyreRotationDesc: "",
        maintenance: "",
        maintenanceFile: "",
        maintenanceDesc: "",
        odometer: "",
        odometerFile: "",
        odometerDesc: "",
        washing: "",
        washingFile: "",
        washingDesc: "",
      },
    ],
  });

  const addItem = () => {
    const newItem: MaintenanceItem = {
      id: new Date().getTime().toString(),
      vehicle: "",
      tyreRotation: "",
      tyreRotationFile: "",
      tyreRotationDesc: "",
      maintenance: "",
      maintenanceFile: "",
      maintenanceDesc: "",
      odometer: "",
      odometerFile: "",
      odometerDesc: "",
      washing: "",
      washingFile: "",
      washingDesc: "",
    };
    setItem([...item, newItem]);
    setFormData({
      ...formData,
      items: item,
    });
  };

  useEffect(() => {
    setFormData({
      ...formData,
      items: item,
    });
  }, [item]);

  const handleItemChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
    id: string
  ) => {
    const { name, files, value } = e.target as HTMLInputElement;

    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onloadend = () => {
        const updatedItems = formData.items.map((item) =>
          item.id === id ? { ...item, [name]: reader.result } : item
        );
        setItem(updatedItems);
      };
    } else {
      const updatedItems = item.map((elem) =>
        elem.id === id
          ? {
              ...elem,
              [name]: value,
            }
          : elem
      );

      setItem(updatedItems);
    }
  };

  const deleteRow = (id: string) => {
    const updatedData = item.filter((elem) => elem.id !== id);
    setItem(updatedData);
  };

  const handleUpdateClick = () => {
    setUpdate(true);
    setItem(getMaintenanceData ?? []);
  };

  const handleUpdateSubmit = async () => {
    setUpdate(false);
    setIsLoading(true);

    try {
      if (getMaintenanceId) {
        await axios.put(`/api/vehicle/maintenance/update`, {
          id: getMaintenanceId,
          formData,
        });
        alert("Shift updated successfully");
      }
      if (role === "admin") {
        router.push("/dashboard");
      } else if (role === "manager") {
        router.push("/dashboard/manager");
      }
    } catch (err) {
      console.error("Error saving shift:", err);
    } finally {
      setIsLoading(false);
      setFormData({
        projectId: projectId,
        projectName: projectName,
        employeeId: empId,
        date: getFormattedDate(),
        items: [
          {
            id: "",
            vehicle: "",
            tyreRotation: "",
            tyreRotationFile: "",
            tyreRotationDesc: "",
            maintenance: "",
            maintenanceFile: "",
            maintenanceDesc: "",
            odometer: "",
            odometerFile: "",
            odometerDesc: "",
            washing: "",
            washingFile: "",
            washingDesc: "",
          },
        ],
      });
      setItem([
        {
          id: "",
          vehicle: "",
          tyreRotation: "",
          tyreRotationFile: "",
          tyreRotationDesc: "",
          maintenance: "",
          maintenanceFile: "",
          maintenanceDesc: "",
          odometer: "",
          odometerFile: "",
          odometerDesc: "",
          washing: "",
          washingFile: "",
          washingDesc: "",
        },
      ]);
    }
  };

  const handleDownloadPO = (poFile: any) => {
    const link = document.createElement("a");

    link.href = poFile;
    link.download = poFile.split("/").pop();

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);

  return (
    <Suspense fallback={<div>Loading maintenance view...</div>}>
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
          Home / <span style={{ color: "white" }}>Shifts</span>
        </p>

        <div className="table-main-container">
          <div
            className="title-button-container"
            style={{ justifyContent: "flex-start", gap: "20px" }}
          >
            <h3 className="table-h3">Shift</h3>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              <TableHead style={{ background: "#ddff8f" }}>
                <TableRow>
                  {[
                    "SL",
                    "Vehicle",
                    "Expense Type",
                    "Amount",
                    "Image",
                    "Description",
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      colSpan={header === "Actions" && update === true ? 2 : 1}
                      style={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                  {update ? (
                    <TableCell
                      colSpan={2}
                      style={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      Actions
                    </TableCell>
                  ) : null}
                </TableRow>
              </TableHead>
              {update
                ? item.map((row, index) => (
                    <TableBody key={row.id}>
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}>
                          {index + 1}
                        </TableCell>

                        {/* Vehicle */}
                        <TableCell style={{ width: "200px" }}>
                          <Select
                            fullWidth
                            name="vehicle"
                            style={{ width: "200px" }}
                            value={row.vehicle}
                            onChange={(e) => handleItemChange(e, row.id)}
                          >
                            {Array.isArray(getVehicle) &&
                            getVehicle.length > 0 ? (
                              getVehicle.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No data available</MenuItem>
                            )}
                          </Select>
                        </TableCell>
                        {/* Fuel */}
                        <TableCell style={{ textAlign: "center" }}>
                          Tyre Rotation
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="tyreRotation"
                            value={row.tyreRotation}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="file"
                            name="tyreRotationFile"
                            onChange={(e) =>
                              handleItemChange(
                                e as React.ChangeEvent<HTMLInputElement>,
                                row.id
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="tyreRotationDesc"
                            value={row.tyreRotationDesc}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                      </TableRow>
                      {/* Maintenance */}
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          Maintenance
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="maintenance"
                            value={row.maintenance}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="file"
                            name="maintenanceFile"
                            onChange={(e) =>
                              handleItemChange(
                                e as React.ChangeEvent<HTMLInputElement>,
                                row.id
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="maintenanceDesc"
                            value={row.maintenanceDesc}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                      </TableRow>
                      {/* Odometer */}
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          Odometer
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="odometer"
                            value={row.odometer}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="file"
                            name="odometerFile"
                            onChange={(e) =>
                              handleItemChange(
                                e as React.ChangeEvent<HTMLInputElement>,
                                row.id
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="odometerDesc"
                            value={row.odometerDesc}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                      </TableRow>
                      {/* Washing */}
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          Washing
                        </TableCell>
                        <TableCell style={{ width: "200px" }}>
                          <TextField
                            fullWidth
                            type="text"
                            name="washing"
                            value={row.washing}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                        <TableCell style={{ width: "250px" }}>
                          <TextField
                            fullWidth
                            type="file"
                            name="washingFile"
                            onChange={(e) =>
                              handleItemChange(
                                e as React.ChangeEvent<HTMLInputElement>,
                                row.id
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            type="text"
                            name="washingDesc"
                            value={row.washingDesc}
                            onChange={(e) => handleItemChange(e, row.id)}
                          />
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {formData.items.length !== 1 && (
                            <MdDelete
                              color="red"
                              size={24}
                              style={{ cursor: "pointer" }}
                              onClick={() => deleteRow(row.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {formData.items.length === index + 1 && (
                            <IoMdAdd
                              color="green"
                              size={24}
                              style={{ cursor: "pointer" }}
                              onClick={addItem}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ))
                : getMaintenanceData?.map((row, index) => (
                    <TableBody key={row.id}>
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}>
                          {index + 1}
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {row.vehicle}
                        </TableCell>
                        {/* Fuel */}
                        <TableCell style={{ textAlign: "center" }}>
                          Tyre Rotation
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {row.tyreRotation}
                        </TableCell>
                        <TableCell>
                          <FaDownload
                            className="table-action-icon m-[auto]"
                            style={{ color: "grey" }}
                            onClick={() =>
                              handleDownloadPO(row.tyreRotationFile)
                            }
                          />
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {row.tyreRotationDesc}
                        </TableCell>
                      </TableRow>
                      {/* Maintenance */}
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          Maintenance
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {row.maintenance}
                        </TableCell>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.maintenanceFile)}
                        />
                        <TableCell style={{ textAlign: "center" }}>
                          {row.maintenanceDesc}
                        </TableCell>
                      </TableRow>
                      {/* Odometer */}
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          Odometer
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {row.odometer}
                        </TableCell>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.odometerFile)}
                        />
                        <TableCell style={{ textAlign: "center" }}>
                          {row.odometerDesc}
                        </TableCell>
                      </TableRow>
                      {/* Washing */}
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}></TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          Washing
                        </TableCell>
                        <TableCell style={{ textAlign: "center" }}>
                          {row.washing}
                        </TableCell>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.washingFile)}
                        />
                        <TableCell style={{ textAlign: "center" }}>
                          {row.washingDesc}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  ))}
            </Table>
            <div className="ml-10 m-2.5">
              <Button
                id="input-btn-submit"
                className="submit"
                type="submit"
                variant="outlined"
                onClick={update ? handleUpdateSubmit : handleUpdateClick}
              >
                {update ? "Submit" : "Update"}
              </Button>
              <Button
                id="input-btn-cancel"
                className="submit"
                type="submit"
                variant="outlined"
                onClick={() => setUpdate(false)}
              >
                Cancel
              </Button>
            </div>
          </TableContainer>
        </div>
      </section>
    </Suspense>
  );
};

export default ShiftViewTable;
