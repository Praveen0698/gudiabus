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
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
interface DecodedToken extends JwtPayload {
  userId: string;
}
const FirmsTable: React.FC = () => {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [toggle, setToggle] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const router = useRouter();

  const handleFilter = () => {
    const filtered = getExpense.filter((expense) => {
      const expenseDate = new Date(expense.date);
      const isWithinDateRange =
        (!startDate || expenseDate >= new Date(startDate)) &&
        (!endDate || expenseDate <= new Date(endDate));

      return (
        (selectedEmployee ? expense.employeeId === selectedEmployee : true) &&
        isWithinDateRange
      );
    });

    setFilteredExpenses(filtered);
  };

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
    adminName: "",
    employeeId: "",
    amount: "",
    date: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setToggle(false);
    setOpen(false);
    setFormData({
      employeeName: "",
      adminName: "",
      employeeId: "",
      amount: "",
      date: "",
    });
    setUpdate(false);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmployeeChange = (e: any) => {
    const selectedEmployee = getEmployee.find(
      (emp) => emp._id === e.target.value
    );

    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        employeeId: selectedEmployee._id,
        employeeName: selectedEmployee.employeeName,
      }));
    }
  };

  const [getEmployee, setGetEmployee] = useState<any[]>([]);

  const fetchEmployee = async () => {
    try {
      const res = await axios.get("/api/employee/getall");
      setGetEmployee(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    await axios
      .patch("/api/employee/expense", { formData })
      .then((res) => console.log(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    await axios
      .post("/api/expense/create", { formData })
      .then(() => fetchExpense())
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    handleClose();
  };

  const updateClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .get(`/api/expense/${id}`)
      .then((res) => {
        handleOpen();
        const employeeData = getEmployee.find(
          (emp) => emp._id === res.data.employeeId
        );

        setFormData({
          ...res.data,
          employeeId: employeeData ? employeeData._id : "",
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    setUpdate(true);
  };

  const handleUpdate = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .put(`/api/expense/update`, formData)
      .then(() => {
        handleClose();
        setUpdate(false);
        fetchExpense();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const [getExpense, setGetExpense] = useState<any[]>([]);
  const [getAdmin, setGetAdmin] = useState<any[]>([]);

  const fetchExpense = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/expense/getall");
      setGetExpense(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdmin = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/auth/register/get");
      setGetAdmin(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAdmin();
    fetchExpense();
  }, []);

  const deleteClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .delete(`/api/expense/delete`, { data: { id } })
      .then(() => {
        fetchExpense();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
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
          Home / <span style={{ color: "white" }}>Expenses</span>
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
                <h3>Add Expense</h3>
                <RxCrossCircled
                  className="bus-form-cross"
                  onClick={handleClose}
                />
              </div>
              {update ? (
                <></>
              ) : (
                <div className="data-input-fields">
                  <div className="bus-input-label">
                    <label className="input-label">Employee Name</label>
                    <Select
                      fullWidth
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleEmployeeChange}
                    >
                      {getEmployee.length > 0 ? (
                        getEmployee.map((type) => (
                          <MenuItem key={type._id} value={type._id}>
                            {type.employeeName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No data available</MenuItem>
                      )}
                    </Select>
                  </div>
                </div>
              )}
              {update ? (
                <></>
              ) : (
                <div className="data-input-fields">
                  <div className="bus-input-label">
                    <label className="input-label">Admin Name</label>
                    <Select
                      fullWidth
                      name="adminName"
                      value={formData.adminName}
                      onChange={handleInputChange}
                    >
                      {getAdmin.length > 0 ? (
                        getAdmin.map((type) => (
                          <MenuItem key={type._id} value={type.fullName}>
                            {type.fullName}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No data available</MenuItem>
                      )}
                    </Select>
                  </div>
                </div>
              )}

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Amount</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="amount"
                    id="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Date</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="Date"
                    fullWidth
                    name="date"
                    id="date"
                    value={formData.date}
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
                  + ADD EXPENSE
                </div>
              )}
            </Button>
            <div className="flex justify-center items-center gap-2">
              <Select
                className="w-[150px]"
                name="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <MenuItem value="" disabled>
                  All Employees
                </MenuItem>
                {getEmployee.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    {employee.employeeName}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />

              <Button
                variant="outlined"
                id="input-btn-submit"
                onClick={handleFilter}
              >
                Filter
              </Button>
            </div>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              {getExpense.length === 0 ? (
                ""
              ) : (
                <caption>
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={getExpense.length}
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
                    Admin Name
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Amount
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
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(filteredExpenses.length > 0 ? filteredExpenses : getExpense)
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
                        {row.adminName}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.amount}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.date}
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
            {getExpense.length === 0 ? (
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

export default FirmsTable;
