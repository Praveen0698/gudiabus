"use client";
import React, { useEffect, useState, Suspense, ChangeEvent } from "react";
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
import { jsPDF } from "jspdf";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";

interface Item {
  id: string;
  vehicle: string;
  source: string;
  destination: string;
  aincout: string;
  generalIn: string;
  binaout: string;
  generalOut: string;
  cincout: string;
  shuttle2: string;
  shuttle3: string;
}

interface ShiftRow {
  id: string;
  vehicle: string;
  source: string;
  destination: string;
  aincout: string;
  generalIn: string;
  binaout: string;
  generalOut: string;
  cincout: string;
  shuttle2: string;
  shuttle3: string;
}

interface ShiftData {
  _id: string;
  projectId: string;
  projectName: string;
  employeeId: string;
  date: string;
  items: ShiftRow[];
}

interface DecodedToken extends JwtPayload {
  userId: string;
}

const ShiftViewTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");
  const empId = searchParams.get("empId");

  const shiftData = searchParams.get("shift");
  const getShiftData: ShiftData | null = shiftData
    ? JSON.parse(shiftData)
    : null;

  const [getSource, setGetSource] = useState<any[]>([]);
  const [getDestination, setGetDestination] = useState<any[]>([]);
  const [getVehicle, setGetVehicle] = useState<any[]>([]);
  const [update, setUpdate] = useState(false);
  const [shiftId, setShiftId] = useState("");

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
    setShiftId(getShiftData?._id || "");
  }, [empId]);

  useEffect(() => {
    if (getProject[0]?.source) {
      if (getProject[0]?.source.trim().endsWith(",")) {
        setGetSource(getProject[0]?.source.trim().slice(0, -1).split(","));
      } else {
        setGetSource(getProject[0]?.source.split(","));
      }
    }

    if (getProject[0]?.destination) {
      if (getProject[0]?.destination.trim().endsWith(",")) {
        setGetDestination(
          getProject[0]?.destination.trim().slice(0, -1).split(",")
        );
      } else {
        setGetDestination(getProject[0].destination.split(","));
      }
    }

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
      source: "",
      destination: "",
      aincout: "",
      generalIn: "",
      binaout: "",
      generalOut: "",
      cincout: "",
      shuttle2: "",
      shuttle3: "",
    },
  ]);

  // Utility function to get cookie
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

  const [role, setRole] = useState("");

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [formData, setFormData] = useState({
    projectId: projectId,
    projectName: projectName,
    employeeId: empId,
    date: getFormattedDate(),
    items: [
      {
        id: "",
        vehicle: "",
        source: "",
        destination: "",
        aincout: "",
        generalIn: "",
        binaout: "",
        generalOut: "",
        cincout: "",
        shuttle2: "",
        shuttle3: "",
      },
    ],
  });

  const addItem = () => {
    const newItem: Item = {
      id: new Date().getTime().toString(),
      vehicle: "",
      source: "",
      destination: "",
      aincout: "",
      generalIn: "",
      binaout: "",
      generalOut: "",
      cincout: "",
      shuttle2: "",
      shuttle3: "",
    };
    setItem([...item, newItem]);
    setFormData({
      ...formData,
      items: item,
    });
  };

  const deleteRow = (id: string) => {
    const updatedData = item.filter((elem) => elem.id !== id);
    setItem(updatedData);
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
    const updatedItems = item.map((elem) =>
      elem.id === id ? { ...elem, [e.target.name]: e.target.value } : elem
    );
    setItem(updatedItems);
    setFormData({
      ...formData,
      items: item,
    });
  };

  const [getEmployee, setGetEmployee] = useState<any[]>([]);

  const fetchEmployee = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/employee/getall");
      setGetEmployee(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const [getShift, setGetShift] = useState<any[]>([]);

  const fetchShift = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/shift/getall/${empId}/${projectId}`);
      setGetShift(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShift();
    fetchEmployee();
  }, [empId, projectId]);

  const handleUpdateClick = () => {
    setUpdate(true);
    setItem(getShiftData?.items ?? []);
  };

  const handleUpdateSubmit = async () => {
    setUpdate(false);
    setIsLoading(true);

    try {
      if (shiftId) {
        await axios.put(`/api/shift/update`, {
          id: shiftId, // Use the _id of the existing shift
          formData, // Send the updated formData
        });
        alert("Shift updated successfully");
      }

      fetchShift();
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
            source: "",
            destination: "",
            aincout: "",
            generalIn: "",
            binaout: "",
            generalOut: "",
            cincout: "",
            shuttle2: "",
            shuttle3: "",
          },
        ],
      });
      setItem([
        {
          id: "",
          vehicle: "",
          source: "",
          destination: "",
          aincout: "",
          generalIn: "",
          binaout: "",
          generalOut: "",
          cincout: "",
          shuttle2: "",
          shuttle3: "",
        },
      ]);
    }
  };

  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);

  const options = [
    "aincout",
    "generalIn",
    "binaout",
    "generalOut",
    "cincout",
    "shuttle2",
    "shuttle3",
  ];

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (selectedOptions.length > 0 && isOpen === false) {
      setSelectedOptions([]);
    }
  };

  const handleOptionChange = (option: string) => {
    setSelectedOptions(
      (prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option) // Deselect if already selected
          : [...prev, option] // Add to selected options
    );
  };

  const handleExport = (data: ShiftData, options: (keyof Item)[]) => {
    const doc = new jsPDF();
    console.log(data);
    const { projectId, projectName, employeeId, date, items } = data;

    // Add project and employee details
    doc.text(`Project ID: ${projectId}`, 10, 10);
    doc.text(`Project Name: ${projectName}`, 10, 20);
    doc.text(`Employee ID: ${employeeId}`, 10, 30);
    doc.text(`Date: ${date}`, 10, 40);

    // Add selected item details
    items.forEach((item, index) => {
      const baseYPosition = 50 + index * 50; // Adjust base spacing between items

      doc.text(`Vehicle: ${item.vehicle}`, 10, baseYPosition);
      doc.text(`Source: ${item.source}`, 10, baseYPosition + 10);
      doc.text(`Destination: ${item.destination}`, 10, baseYPosition + 20);

      // Iterate over options to display each selected option
      options.forEach((option) => {
        doc.text(
          `${option}: ${item[option]}`,
          10,
          baseYPosition + 30 + options.indexOf(option) * 10
        );
      });
    });

    // Save the PDF
    doc.save("shift-data.pdf");
  };

  // Update handleButtonClick to pass an array of keys
  const handleButtonClick = () => {
    if (getShiftData) {
      handleExport(getShiftData, selectedOptions as (keyof Item)[]); // Ensure selectedOptions is an array of valid keys of Item
    } else {
      alert("No data available to export.");
    }
    setSelectedOptions([]);
  };

  console.log(role);

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
          Home / <span style={{ color: "white" }}>Shift</span>
        </p>

        <div className="table-main-container">
          <div
            className="title-button-container"
            style={{ justifyContent: "space-between" }}
          >
            <h3 className="table-h3">Shift</h3>
            <div className="flex justify-center items-center gap-2">
              <div
                style={{
                  position: "relative",
                  width: selectedOptions.length > 1 ? "auto" : "150px",
                }}
              >
                <button
                  className="border-2 border-black"
                  onClick={toggleDropdown}
                  style={{ width: "100%", padding: "5px  10px" }}
                >
                  {selectedOptions.length > 0
                    ? selectedOptions.join(", ")
                    : "Select Options"}
                </button>
                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      background: "#fff",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      width: "100%",
                      maxHeight: "150px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {options.map((option) => (
                      <label
                        className="flex justify-start gap-2 items-center p-2.5"
                        key={option}
                        // style={{ display: "block", padding: "10px" }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedOptions.includes(option)}
                          onChange={() => handleOptionChange(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleButtonClick}
                className="px-2 py-1"
                id="input-btn-submit"
              >
                Export
              </button>
            </div>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
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
                    Vehicle
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
                    A-in / C-out
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    General In
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Shuttle 2
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    B-in / A-out
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Shuttle 3
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    General Out
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    C-in / C-out
                  </TableCell>
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
              {update ? (
                <TableBody>
                  {item.map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell style={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="vehicle"
                          style={{ width: "200px" }}
                          value={row.vehicle}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {Array.isArray(getSource) && getVehicle.length > 0 ? (
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
                      <TableCell>
                        <Select
                          fullWidth
                          name="source"
                          style={{ width: "200px" }}
                          value={row.source}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {Array.isArray(getSource) && getSource.length > 0 ? (
                            getSource.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="destination"
                          style={{ width: "200px" }}
                          value={row.destination}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {Array.isArray(getDestination) &&
                          getDestination.length > 0 ? (
                            getDestination.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="aincout"
                          style={{ width: "200px" }}
                          value={row.aincout}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="generalIn"
                          style={{ width: "200px" }}
                          value={row.generalIn}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="shuttle2"
                          style={{ width: "200px" }}
                          value={row.shuttle2}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="binaout"
                          style={{ width: "200px" }}
                          value={row.binaout}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="shuttle3"
                          style={{ width: "200px" }}
                          value={row.shuttle3}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="generalOut"
                          style={{ width: "200px" }}
                          value={row.generalOut}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          fullWidth
                          name="cincout"
                          style={{ width: "200px" }}
                          value={row.cincout}
                          onChange={(e) => handleItemChange(e, row.id)}
                        >
                          {getEmployee.length > 0 ? (
                            getEmployee
                              .filter((type) => type.designation === "driver")
                              .map((type) => (
                                <MenuItem
                                  key={type._id}
                                  value={type.employeeName}
                                >
                                  {type.employeeName}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No data available</MenuItem>
                          )}
                        </Select>
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
                  ))}
                </TableBody>
              ) : (
                <TableBody>
                  {getShiftData?.items.map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      <TableCell style={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.vehicle}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.source}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.destination}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.aincout}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.generalIn}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.shuttle2}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.binaout}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.shuttle3}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.generalOut}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.cincout}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
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
