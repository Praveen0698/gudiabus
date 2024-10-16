"use client";
import React, { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TablePagination from "@mui/material/TablePagination";
import Image from "next/image";
import Navbar from "../common/Navbar";
import Elipse from "../../public/elipse.png";
import { Modal, TextField, Button, Select, MenuItem } from "@mui/material";
import { RxCrossCircled } from "react-icons/rx";
import axios from "axios";
import { FaEdit, FaDownload, FaBus } from "react-icons/fa";
import { MdAssignmentAdd } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import jwt, { JwtPayload } from "jsonwebtoken";
interface DecodedToken extends JwtPayload {
  userId: string;
}
const ProjectTable: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [toggle, setToggle] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
    setIsLoading(true);
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get("/api/auth/validate", {
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
          decodedToken?.role !== "admin"
        ) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error in login validation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  useEffect(() => {
    const timer: NodeJS.Timeout = setTimeout(() => {
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

  const projectFields = {
    projectName: "",
    poNumber: "",
    poFile: null,
    fleetSize: "",
    firmName: "",
    vehicle: "",
    source: "",
    destination: "",
    supervisor: "",
    employeeId: "",
  };

  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [formData, setFormData] = useState(projectFields);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setToggle(false);
    setOpen(false);
    setFormData(projectFields);
  };

  const [getFirm, setGetFirm] = useState<any[]>([]);
  const [getProject, setGetProject] = useState<any[]>([]);
  const [getVehicle, setGetVehicle] = useState<any[]>([]);

  const fetchFirms = async () => {
    try {
      const res = await axios.get("/api/firm/getall");
      setGetFirm(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVehicle = async () => {
    try {
      const res = await axios.get("/api/vehicle/getall");
      setGetVehicle(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("/api/project/getall");
      setGetProject(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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

  useEffect(() => {
    fetchEmployee();
    fetchProjects();
    fetchFirms();
    fetchVehicle();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "poFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSupervisorChange = (event: any) => {
    const selectedEmployeeName = event.target.value;

    const selectedEmployee = getEmployee.find(
      (employee) => employee.employeeName === selectedEmployeeName
    );

    if (selectedEmployee) {
      setFormData((prevData) => ({
        ...prevData,
        supervisor: selectedEmployee.employeeName,
        employeeId: selectedEmployee._id,
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .post("/api/project/create", formData)
      .then((res) => {
        if (res.data.message === "exists") {
          alert("Project already exists");
        } else {
          fetchProjects();
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    handleClose();
  };

  const updateClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .get(`/api/project/${id}`)
      .then((res) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...res.data,
          poFile: null,
        }));
        handleOpen();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    setUpdate(true);
  };

  const handleUpdate = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .put(`/api/project/update`, formData)
      .then(() => {
        handleClose();
        setUpdate(false);
        fetchProjects();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const deleteClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .delete(`/api/project/delete`, { data: { id } })
      .then(() => {
        fetchProjects();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleDownloadPO = (poFile: any) => {
    const link = document.createElement("a");

    link.href = poFile;
    link.download = poFile.split("/").pop();

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  function validateAndProcessString(input: string) {
    const isValid = /^[a-zA-Z0-9\s,]*$/.test(input);

    if (!isValid) return false;

    const processedInput = input.trim().replace(/,+$/, "");
    return processedInput.length > 0;
  }

  const handleVehicleChange = (event: any) => {
    const value = event.target.value;
    const selectedVehicles =
      typeof value === "string" ? value.split(",") : value;

    const mergedVehicles = selectedVehicles.join(",");

    setFormData({ ...formData, vehicle: mergedVehicles });
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

  return (
    <>
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
          Home / <span style={{ color: "white" }}>Projects</span>
        </p>

        <Modal
          className="bus-form-modal"
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="bus-form-container">
            <form onSubmit={update ? handleUpdate : handleSubmit}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3>Add Project</h3>
                <RxCrossCircled
                  className="bus-form-cross"
                  onClick={handleClose}
                />
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Project Name</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="projectName"
                    id="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">PO Number</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="poNumber"
                      id="poNumber"
                      value={formData.poNumber}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="poFile"
                      type="file"
                      name="poFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="poFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.poFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Fleet Size</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="fleetSize"
                    id="fleetSize"
                    value={formData.fleetSize}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bus-input-label">
                  <label className="input-label">Firm Name</label>
                  <Select
                    fullWidth
                    name="firmName"
                    value={formData.firmName}
                    onChange={handleInputChange}
                  >
                    {getFirm.length > 0 ? (
                      getFirm.map((type) => (
                        <MenuItem key={type._id} value={type.firmName}>
                          {type.firmName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No data available</MenuItem>
                    )}
                  </Select>
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Vehicle</label>
                  <Select
                    fullWidth
                    multiple // Enable multiple selection
                    name="vehicle"
                    value={formData.vehicle ? formData.vehicle.split(", ") : []} // Split to array for multi-select
                    onChange={handleVehicleChange}
                    renderValue={(selected) => selected.join(", ")} // Display as comma-separated string
                  >
                    {getVehicle.length > 0 ? (
                      getVehicle.map((type) => (
                        <MenuItem key={type.value} value={type.vehicleNumber}>
                          <Checkbox
                            checked={formData.vehicle?.includes(
                              type.vehicleNumber
                            )}
                          />
                          <ListItemText primary={type.vehicleNumber} />
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled>No data available</MenuItem>
                    )}
                  </Select>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Enter Source</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="source"
                    id="source"
                    value={formData.source}
                    onChange={(e) => {
                      if (validateAndProcessString(e.target.value)) {
                        handleInputChange(e);
                      } else {
                        alert("Check input");
                      }
                    }}
                  />
                </div>
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Enter destination</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="destination"
                    id="destination"
                    value={formData.destination}
                    onChange={(e) => {
                      if (validateAndProcessString(e.target.value)) {
                        handleInputChange(e);
                      } else {
                        alert("Check input");
                      }
                    }}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Supervisor</label>
                  <Select
                    fullWidth
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleSupervisorChange}
                  >
                    {getEmployee.length > 0 ? (
                      getEmployee
                        .filter((type) => type.designation === "manager")
                        .map((type) => (
                          <MenuItem key={type._id} value={type.employeeName}>
                            {type.employeeName}
                          </MenuItem>
                        ))
                    ) : (
                      <MenuItem disabled>No data available</MenuItem>
                    )}
                  </Select>
                </div>
              </div>

              <div className="data-buttons" style={{ marginTop: "20px" }}>
                <Button
                  id="input-btn-submit"
                  className="submit"
                  type="submit"
                  variant="outlined"
                >
                  {update ? "Update" : "Submit"}
                </Button>
                <Button
                  id="input-btn-cancel"
                  className="cancel"
                  onClick={handleClose}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        <div className="table-main-container">
          <div className="title-button-container">
            <h3 className="table-h3">Projects</h3>
            <Button
              variant="outlined"
              onClick={() => {
                setToggle(!toggle);
              }}
              id="add-btn"
              className="add-btn-table"
            >
              {toggle ? (
                <div className="hide" onClick={handleClose}>
                  HIDE
                </div>
              ) : (
                <div className="add" onClick={handleOpen}>
                  + ADD PROJECT
                </div>
              )}
            </Button>
          </div>
          <TableContainer component={Paper} className="table-container">
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
                    PO Number
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    PO File
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Fleet Size
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Firm Name
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
                    Supervisor
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                    colSpan={4}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getProject
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
                        {row.poNumber}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.poFile)}
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.fleetSize}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.firmName}
                      </TableCell>
                      <TableCell
                        style={{
                          textAlign: "center",
                          maxWidth: "120px",
                          overflowX: "scroll",
                        }}
                      >
                        {row.vehicle}
                      </TableCell>
                      <TableCell
                        style={{
                          textAlign: "center",
                          maxWidth: "120px",
                          overflowX: "scroll",
                        }}
                      >
                        {row.source}
                      </TableCell>
                      <TableCell
                        style={{
                          textAlign: "center",
                          maxWidth: "120px",
                          overflowX: "scroll",
                        }}
                      >
                        {row.destination}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.supervisor}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <MdAssignmentAdd
                          className="table-action-icon m-[auto]"
                          style={{ color: "purple" }}
                          onClick={() =>
                            handleViewShift(
                              row._id,
                              row.projectName,
                              row.employeeId
                            )
                          }
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaBus
                          className="table-action-icon m-[auto]"
                          style={{ color: "tomato" }}
                          onClick={() =>
                            handleViewVehicle(
                              row._id,
                              row.projectName,
                              row.employeeId
                            )
                          }
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaEdit
                          className="table-action-icon m-[auto]"
                          style={{ color: "blue" }}
                          onClick={() => updateClick(row._id)}
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

export default ProjectTable;
