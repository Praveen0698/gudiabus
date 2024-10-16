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
import { FaEdit, FaDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
interface DecodedToken extends JwtPayload {
  userId: string;
}
const EmployeeTable: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [toggle, setToggle] = useState<boolean>(false);
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
        console.log(cookieAccessToken);
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

  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: "",
    age: "",
    address: "",
    aadharNumber: "",
    aadharFile: null,
    dlNumber: "",
    dlFile: null,
    experience: "",
    designation: "",
    username: "",
    password: "Gudiabus@900",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setToggle(false);
    setOpen(false);
    setFormData({
      employeeName: "",
      age: "",
      address: "",
      aadharNumber: "",
      aadharFile: null,
      dlNumber: "",
      dlFile: null,
      experience: "",
      designation: "",
      username: "",
      password: "Gudiabus@900",
    });
    setUpdate(false);
  };

  const [designation] = useState([
    { label: "Project Manager", value: "manager" },
    { label: "Onsite Supervisor", value: "onsite supervisor" },
    { label: "Driver-1", value: "driver-1" },
    { label: "Driver-2", value: "driver-2" },
    { label: "Driver-3", value: "driver-3" },
    { label: "Maintenance Incharge", value: "maintenance incharge" },
    { label: "Safety Officer", value: "safety officer" },
    { label: "HR", value: "hr" },
    { label: "Operations", value: "operations" },
    { label: "Helper", value: "helper" },
  ]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "aadharFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "dlFile") {
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    await axios
      .post("/api/employee/create", formData)
      .then((res) => {
        if (res.data.message === "exists") {
          alert("Project already exists");
        } else {
          fetchEmployee();
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    handleClose();
  };

  const [getEmployee, setGetEmployee] = useState<any[]>([]);

  const fetchEmployee = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/employee/getall");
      setGetEmployee(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchEmployee();
  }, []);

  const updateClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .get(`/api/employee/${id}`)
      .then((res) => {
        handleOpen();
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...res.data,
          aadharFile: null,
          dlFile: null,
        }));
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    setUpdate(true);
  };

  const handleUpdate = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .put(`/api/employee/update`, formData)
      .then(() => {
        handleClose();
        setUpdate(false);
        fetchEmployee();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const deleteClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .delete(`/api/employee/delete`, { data: { id } })
      .then(() => {
        fetchEmployee();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    await axios
      .delete(`/api/expense/deleteid/${id}`)
      .then(() => {
        fetchEmployee();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleDownloadPO = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl, { method: "GET" });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = fileUrl.split("/").pop() || "downloaded-file"; // Extract filename
      document.body.appendChild(link);

      link.click(); // Trigger the download
      document.body.removeChild(link);

      // Release the object URL to free memory
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  interface ExpensesTableRowProps {
    employeeId: string;
  }

  interface Expense {
    amount: string;
    date: string;
  }

  const fetchExpensesByEmployeeId = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/expense/get/${employeeId}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          `Error fetching expenses for employeeId: ${employeeId}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching expenses:", error);
      return null;
    }
  };

  const isWithinDateRangeOrCurrentMonth = (
    expenseDate: string,
    fromDate: string | null,
    toDate: string | null
  ) => {
    const expenseDateObj = new Date(expenseDate);
    const now = new Date();

    if (fromDate && toDate) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      return expenseDateObj >= fromDateObj && expenseDateObj <= toDateObj;
    }

    return (
      expenseDateObj.getMonth() === now.getMonth() &&
      expenseDateObj.getFullYear() === now.getFullYear()
    );
  };
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const ExpensesTableRow: React.FC<ExpensesTableRowProps> = ({
    employeeId,
  }) => {
    const [expenses, setExpenses] = useState<number | null>(null);

    useEffect(() => {
      const fetchData = async () => {
        const data = await fetchExpensesByEmployeeId(employeeId);

        if (!data.message) {
          const totalAmount = data
            .filter((expense: Expense) =>
              isWithinDateRangeOrCurrentMonth(expense.date, fromDate, toDate)
            )
            .reduce(
              (total: number, expense: Expense) =>
                total + parseFloat(expense.amount),
              0
            );
          setExpenses(totalAmount);
        }
      };

      fetchData();
    }, [employeeId, fromDate, toDate]);

    return (
      <>
        <TableCell style={{ textAlign: "center" }}>
          {expenses !== null ? expenses : 0}
        </TableCell>
      </>
    );
  };

  const generateUsername = (designation: String) => {
    const startCount = 10 + getEmployee.length;

    let maxCount = startCount;

    let prefix = "";
    if (designation.toLowerCase() === "manager") {
      prefix = "MGTT";
    } else if (designation.toLowerCase() === "onsite supervisor") {
      prefix = "OSGTT";
    } else if (designation.toLowerCase() === "driver-1") {
      prefix = "D1GTT";
    } else if (designation.toLowerCase() === "driver-2") {
      prefix = "D2GTT";
    } else if (designation.toLowerCase() === "driver-3") {
      prefix = "D3GTT";
    } else if (designation.toLowerCase() === "maintenance incharge") {
      prefix = "MIGTT";
    } else if (designation.toLowerCase() === "safety officer") {
      prefix = "SOGTT";
    } else if (designation.toLowerCase() === "hr") {
      prefix = "HRGTT";
    } else if (designation.toLowerCase() === "operations") {
      prefix = "OGTT";
    } else if (designation.toLowerCase() === "helper") {
      prefix = "HGTT";
    } else {
      prefix = "AGTT";
    }

    const newUsername = `${prefix}${maxCount.toString().padStart(4, "0")}`;
    setFormData((prevFormData) => ({
      ...prevFormData,
      username: newUsername,
    }));
  };

  useEffect(() => {
    if (formData.designation) {
      generateUsername(formData.designation);
    }
  }, [formData.designation, getEmployee]);

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
          Home / <span style={{ color: "white" }}>Employees</span>
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
                <h3>Add Employee</h3>
                <RxCrossCircled
                  className="bus-form-cross"
                  onClick={handleClose}
                />
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Employee Name</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="employeeName"
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={handleInputChange}
                    style={{ padding: "5px 0px", margin: "0" }}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Age</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="age"
                    id="age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Address</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Experience</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="experience"
                    id="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bus-input-label">
                  <label className="input-label">Designation</label>
                  <Select
                    fullWidth
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                  >
                    {designation.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Aadhar Number</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="aadharNumber"
                      id="aadharNumber"
                      value={formData.aadharNumber}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="aadharFile"
                      type="file"
                      name="aadharFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="aadharFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.aadharFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="bus-input-label">
                  <label className="input-label">DL Number</label>
                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="dlNumber"
                      id="dlNumber"
                      value={formData.dlNumber}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="dlFile"
                      type="file"
                      name="dlFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="dlFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.dlFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Username</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    style={{ padding: "5px 0px", margin: "0" }}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Password</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
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
            <h3 className="table-h3">Employees</h3>
            <div className="flex justify-center items-center gap-3">
              <div className="flex justify-center items-center gap-2">
                <label className="input-label">From</label>
                <TextField
                  className="bus-input"
                  margin="dense"
                  type="date"
                  fullWidth
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <span className="font-bold">--</span>
              <div className="flex justify-center items-center gap-2">
                <label className="input-label">To</label>
                <TextField
                  className="bus-input"
                  margin="dense"
                  type="date"
                  fullWidth
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="outlined"
              onClick={() => {
                setToggle(!toggle);
              }}
              id="add-btn"
              className="add-btn-table"
            >
              {" "}
              {toggle ? (
                <div className="hide" onClick={handleClose}>
                  HIDE
                </div>
              ) : (
                <div className="add" onClick={handleOpen}>
                  + ADD EMPLOYEE
                </div>
              )}
            </Button>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              {getEmployee.length === 0 ? (
                ""
              ) : (
                <caption>
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={getEmployee.length}
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
                    Employee Name
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Age
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Address
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Aadhar Number
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Aadhar File
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    DL Number
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    DL File
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Experience
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Designation
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Expenses
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
                {getEmployee
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                      <TableCell style={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.employeeName}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.age}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.address}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.aadharNumber}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.aadharFile)}
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.dlNumber}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.dlFile)}
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.experience}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.designation}
                      </TableCell>
                      <ExpensesTableRow employeeId={row._id} />
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
            {getEmployee.length === 0 ? (
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

export default EmployeeTable;
