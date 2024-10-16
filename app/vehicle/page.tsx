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
import { Modal, TextField, Button } from "@mui/material";
import { RxCrossCircled } from "react-icons/rx";
import axios from "axios";
import { IoDocumentsSharp } from "react-icons/io5";
import { FaEdit, FaDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";
interface DecodedToken extends JwtPayload {
  userId: string;
}

const VehicleTable: React.FC = () => {
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
        console.log(cookieAccessToken);
        const accessToken = response.data.accessToken;

        const decodedToken = accessToken
          ? decodeAccessToken(accessToken)
          : null;
        console.log(
          response.data.isLoggedIn ||
            cookieAccessToken ||
            decodedToken?.role === "admin"
        );
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

  const docField = {
    vehicleNumber: "",
    brand: "",
    model: "",
    rc: "",
    rcFile: null,
    insurance: "",
    insuranceFile: null,
    fitness: "",
    fitnessFile: null,
    pollution: "",
    pollutionFile: null,
    roadTax: "",
    roadTaxFile: null,
    odometer: "",
    vehiclePass: "",
    vehiclePassFile: null,
    otherFile: null,
    chessisNumber: "",
    engineNumber: "",
    permitExpiryDate: "",
    emiAmount: "",
    emiDate: "",
    financer: "",
    bankAccount: "",
    hpStatus: "",
  };
  const [open, setOpen] = useState(false);
  const [openDoc, setOpenDoc] = useState(false);
  const [openOther, setOpenOther] = useState(false);
  const [update, setUpdate] = useState(false);
  const [vehicleDocument, setVehicleDocument] = useState(docField);
  const [formData, setFormData] = useState(docField);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleOpenDoc = (doc: any) => {
    setVehicleDocument(doc);
    setOpenDoc(true);
  };
  const handleOpenOther = (doc: any) => {
    setVehicleDocument(doc);
    setOpenOther(true);
  };

  const handleClose = () => {
    setToggle(false);
    setOpen(false);
    setFormData(docField);
  };

  const handleCloseDoc = () => {
    setToggle(false);
    setOpenDoc(false);
    setVehicleDocument(docField);
  };

  const handleCloseOther = () => {
    setToggle(false);
    setOpenOther(false);
    setVehicleDocument(docField);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === "rcFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "insuranceFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "fitnessFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "pollutionFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "roadTaxFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "vehiclePassFile") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
    } else if (name === "otherFile") {
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
    setIsLoading(true);
    e.preventDefault();
    await axios
      .post("/api/vehicle/create", formData)
      .then((res) => {
        if (res.data.message === "exists") {
          alert("Project already exists");
        } else {
          fetchVehicle();
        }
      })
      .catch((err) => console.error(err));
    handleClose();
  };

  const [getVehicle, setGetVehicle] = useState<any[]>([]);

  const fetchVehicle = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/vehicle/getall");
      setGetVehicle(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  const updateClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .get(`/api/vehicle/${id}`)
      .then((res) => {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...res.data,
          rcFile: null,
          insuranceFile: null,
          fitnessFile: null,
          pollutionFile: null,
          roadTaxFile: null,
          vehiclePassFile: null,
          otherFile: null,
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
      .put(`/api/vehicle/update`, formData)
      .then(() => {
        handleClose();
        setUpdate(false);
        fetchVehicle();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const deleteClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .delete(`/api/vehicle/delete`, { data: { id } })
      .then(() => {
        fetchVehicle();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleDownloadPO = (file: any) => {
    const link = document.createElement("a");

    link.href = file;
    link.download = file.split("/").pop();

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  };

  function getExpiryMessage(expiryDate: string): string {
    const currentDate = new Date();
    const expirationDate = new Date(expiryDate);

    const diffInMilliseconds = expirationDate.getTime() - currentDate.getTime();
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
    if (diffInDays < 0) {
      return "Expired";
    }
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "1 day remaining";
    } else if (diffInDays <= 7) {
      return `${diffInDays} days remaining`;
    } else if (diffInDays <= 30) {
      const weeksRemaining = Math.floor(diffInDays / 7);
      return weeksRemaining === 1
        ? "1 week remaining"
        : `${weeksRemaining} weeks remaining`;
    } else {
      const monthsRemaining = Math.floor(diffInDays / 30);
      return monthsRemaining === 1
        ? "1 month remaining"
        : `${monthsRemaining} months remaining`;
    }
  }

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
          Home / <span style={{ color: "white" }}>Vehicles</span>
        </p>

        <Modal
          className="bus-form-modal"
          open={openDoc}
          onClose={handleCloseDoc}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="bus-form-container" style={{ width: "45%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>Vehicle Documents</h3>
              <RxCrossCircled
                className="bus-form-cross"
                onClick={handleCloseDoc}
              />
            </div>
            <TableContainer component={Paper} className="table-container">
              <Table sx={{ minWidth: 650 }} aria-label="caption table">
                <TableHead style={{ background: "#ddff8f" }}>
                  <TableRow>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        top: 40,
                        minWidth: 50,
                        textAlign: "center",
                      }}
                    >
                      Document
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        top: 40,
                        minWidth: 50,
                        textAlign: "center",
                      }}
                    >
                      File
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        top: 40,
                        minWidth: 50,
                        textAlign: "center",
                      }}
                    >
                      Expiry
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Insurance
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaDownload
                        className="table-action-icon m-[auto]"
                        style={{ color: "grey" }}
                        onClick={() =>
                          handleDownloadPO(vehicleDocument.insuranceFile)
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {getExpiryMessage(vehicleDocument.insurance)}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Fitness
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaDownload
                        className="table-action-icon m-[auto]"
                        style={{ color: "grey" }}
                        onClick={() =>
                          handleDownloadPO(vehicleDocument.fitnessFile)
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {getExpiryMessage(vehicleDocument.fitness)}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Pollution
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaDownload
                        className="table-action-icon m-[auto]"
                        style={{ color: "grey" }}
                        onClick={() =>
                          handleDownloadPO(vehicleDocument.pollutionFile)
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {getExpiryMessage(vehicleDocument.pollution)}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Road Tax
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaDownload
                        className="table-action-icon m-[auto]"
                        style={{ color: "grey" }}
                        onClick={() =>
                          handleDownloadPO(vehicleDocument.roadTaxFile)
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {getExpiryMessage(vehicleDocument.roadTax)}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Vehicle Pass
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaDownload
                        className="table-action-icon m-[auto]"
                        style={{ color: "grey" }}
                        onClick={() =>
                          handleDownloadPO(vehicleDocument.vehiclePassFile)
                        }
                      />
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {getExpiryMessage(vehicleDocument.vehiclePass)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Modal>
        <Modal
          className="bus-form-modal"
          open={openOther}
          onClose={handleCloseOther}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <div className="bus-form-container" style={{ width: "45%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3>Other Details</h3>
              <RxCrossCircled
                className="bus-form-cross"
                onClick={handleCloseOther}
              />
            </div>
            <TableContainer component={Paper} className="table-container">
              <Table sx={{ minWidth: 650 }} aria-label="caption table">
                <TableHead style={{ background: "#ddff8f" }}>
                  <TableRow>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        top: 40,
                        minWidth: 50,
                        textAlign: "center",
                      }}
                    >
                      Details
                    </TableCell>
                    <TableCell
                      style={{
                        fontWeight: "bold",
                        top: 40,
                        minWidth: 50,
                        textAlign: "center",
                      }}
                    >
                      Value
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Other Documents
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <FaDownload
                        className="table-action-icon m-[auto]"
                        style={{ color: "grey" }}
                        onClick={() =>
                          handleDownloadPO(vehicleDocument.otherFile)
                        }
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Chessis Number
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.chessisNumber}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Engine Number
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.engineNumber}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Permit Expiry Date
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.permitExpiryDate}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      EMI Amount
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.emiAmount}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      EMI Date
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.emiDate}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Financer
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.financer}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      Bank Account
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.bankAccount}
                    </TableCell>
                  </TableRow>
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell style={{ textAlign: "center" }}>
                      HP Status
                    </TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      {vehicleDocument.hpStatus}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Modal>
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
                <h3>Add Vehicle</h3>
                <RxCrossCircled
                  className="bus-form-cross"
                  onClick={handleClose}
                />
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Vehicle Number</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="vehicleNumber"
                    id="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Brand</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="brand"
                    id="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Model</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="model"
                    id="model"
                    value={formData.model}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Chessis Number</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="chessisNumber"
                      id="chessisNumber"
                      value={formData.chessisNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Engine Number</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="engineNumber"
                      id="engineNumber"
                      value={formData.engineNumber}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Permit Expiry Date</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="permitExpiryDate"
                      id="permitExpiryDate"
                      value={formData.permitExpiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">EMI Amount</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="emiAmount"
                      id="emiAmount"
                      value={formData.emiAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">EMI Date</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="emiDate"
                      id="emiDate"
                      value={formData.emiDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Financer</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="financer"
                      id="financer"
                      value={formData.financer}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Bank Account</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="bankAccount"
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">
                    Registration Certificate Number
                  </label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="rc"
                      id="rc"
                      value={formData.rc}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="rcFile"
                      type="file"
                      name="rcFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="rcFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.rcFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="bus-input-label">
                  <label className="input-label">Insurance Expiry</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="insurance"
                      id="insurance"
                      value={formData.insurance}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="insuranceFile"
                      type="file"
                      name="insuranceFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="insuranceFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.insuranceFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Fitness Expiry</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="fitness"
                      id="fitness"
                      value={formData.fitness}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="fitnessFile"
                      type="file"
                      name="fitnessFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="fitnessFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.fitnessFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Pollution Expiry</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="pollution"
                      id="pollution"
                      value={formData.pollution}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="pollutionFile"
                      type="file"
                      name="pollutionFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="pollutionFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.pollutionFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>

                <div className="bus-input-label">
                  <label className="input-label">Road Tax Expiry</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="roadTax"
                      id="roadTax"
                      value={formData.roadTax}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="roadTaxFile"
                      type="file"
                      name="roadTaxFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="roadTaxFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.roadTaxFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Odometer Reading</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="odometer"
                    id="odometer"
                    value={formData.odometer}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Vehicle Pass Expiry</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="date"
                      fullWidth
                      name="vehiclePass"
                      id="vehiclePass"
                      value={formData.vehiclePass}
                      onChange={handleInputChange}
                    />
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="vehiclePassFile"
                      type="file"
                      name="vehiclePassFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="vehiclePassFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.vehiclePassFile ? "DONE" : "UPLOAD"}
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">Other File</label>

                  <div
                    className="input-upload-container"
                    style={{ justifyContent: "flex-start" }}
                  >
                    <input
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      id="otherFile"
                      type="file"
                      name="otherFile"
                      onChange={handleInputChange}
                    />
                    <label htmlFor="otherFile">
                      <Button
                        variant="contained"
                        component="span"
                        style={{ background: "#202023" }}
                      >
                        {formData.otherFile ? "DONE" : "UPLOAD OTHER FILE"}
                      </Button>
                    </label>
                  </div>
                </div>
                <div className="bus-input-label">
                  <label className="input-label">HP Status</label>

                  <div className="input-upload-container">
                    <TextField
                      className="bus-input"
                      margin="dense"
                      type="text"
                      fullWidth
                      name="hpStatus"
                      id="hpStatus"
                      value={formData.hpStatus}
                      onChange={handleInputChange}
                    />
                  </div>
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
            <h3 className="table-h3">Vehicles</h3>
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
                  + ADD VEHICLE
                </div>
              )}
            </Button>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              {getVehicle.length === 0 ? (
                ""
              ) : (
                <caption>
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={getVehicle.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </caption>
              )}

              <TableHead style={{ background: "#ddff8f" }}>
                <TableRow style={{ textAlign: "center" }}>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    SL
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Vehicle Number
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Brand
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Model
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    RC File
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Odometer
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Documents & Expiry
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Other Details
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getVehicle
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                      <TableCell style={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.vehicleNumber}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.brand}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.model}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <FaDownload
                          className="table-action-icon m-[auto]"
                          style={{ color: "grey" }}
                          onClick={() => handleDownloadPO(row.rcFile)}
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.odometer}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <IoDocumentsSharp
                          className="table-action-icon m-[auto]"
                          style={{ color: "#000" }}
                          onClick={() => handleOpenDoc(row)}
                        />
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        <IoDocumentsSharp
                          className="table-action-icon m-[auto]"
                          style={{ color: "#000" }}
                          onClick={() => handleOpenOther(row)}
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
            {getVehicle.length === 0 ? (
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

export default VehicleTable;
