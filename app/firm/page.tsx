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

  const [open, setOpen] = useState(false);
  const [update, setUpdate] = useState(false);
  const [formData, setFormData] = useState({
    firmName: "",
    firmType: "",
    gstNumber: "",
    gstAddress: "",
    panTanNumber: "",
    propertiorName: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setToggle(false);
    setOpen(false);
    setFormData({
      firmName: "",
      firmType: "",
      gstNumber: "",
      gstAddress: "",
      panTanNumber: "",
      propertiorName: "",
    });
  };

  const [firmType] = useState([
    { label: "Proprietorship", value: "proprietorship" },
    { label: "Parntership", value: "partnerShip" },
    { label: "Private Limited", value: "pvtLimited" },
  ]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .post("/api/firm/create", formData)
      .then((res) => {
        if (res.data.message === "exists") {
          alert("Firm already exists");
        } else {
          fetchFirms();
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    handleClose();
  };

  const updateClick = async (id: string) => {
    setIsLoading(true);
    await axios
      .get(`/api/firm/${id}`)
      .then((res) => {
        handleOpen();
        setFormData(res.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    setUpdate(true);
  };

  const handleUpdate = async (e: any) => {
    setIsLoading(true);
    e.preventDefault();
    await axios
      .put(`/api/firm/update`, formData)
      .then(() => {
        handleClose();
        setUpdate(false);
        fetchFirms();
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const [getFirm, setGetFirm] = useState<any[]>([]);

  const fetchFirms = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/firm/getall");
      setGetFirm(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchFirms();
  }, []);

  const deleteClick = async (id: string) => {
    await axios
      .delete(`/api/firm/delete`, { data: { id } })
      .then(() => {
        fetchFirms();
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
          Home / <span style={{ color: "white" }}>Firm</span>
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
                <h3>{update ? "Update Firm" : "Add Firm"}</h3>
                <RxCrossCircled
                  className="bus-form-cross"
                  onClick={handleClose}
                />
              </div>

              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">Firm Name</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="firmName"
                    id="firmName"
                    value={formData.firmName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bus-input-label">
                  <label className="input-label">Firm Type</label>
                  <Select
                    fullWidth
                    name="firmType"
                    value={formData.firmType}
                    onChange={handleInputChange}
                  >
                    {firmType.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">GST Number</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="gstNumber"
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bus-input-label">
                  <label className="input-label">GST Address</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="gstAddress"
                    id="gstAddress"
                    value={formData.gstAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="data-input-fields">
                <div className="bus-input-label">
                  <label className="input-label">PAN/TAN Number</label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="panTanNumber"
                    id="panTanNumber"
                    value={formData.panTanNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="bus-input-label">
                  <label className="input-label">
                    Propertior/Directors Name
                  </label>
                  <TextField
                    className="bus-input"
                    margin="dense"
                    type="text"
                    fullWidth
                    name="propertiorName"
                    id="propertiorName"
                    value={formData.propertiorName}
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
            <h3 className="table-h3">Firms</h3>
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
                  + ADD FIRM
                </div>
              )}
            </Button>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              {getFirm.length === 0 ? (
                ""
              ) : (
                <caption>
                  <TablePagination
                    rowsPerPageOptions={[5]}
                    component="div"
                    count={getFirm.length}
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
                    Firm Name
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Firm Type
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    GST
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Address
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    PAN/TAN
                  </TableCell>
                  <TableCell
                    style={{ fontWeight: "bold", textAlign: "center" }}
                  >
                    Propertior/Directors
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
                {getFirm
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                      <TableCell style={{ textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.firmName}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.firmType}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.gstNumber}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.gstAddress}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.panTanNumber}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.propertiorName}
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
            {getFirm.length === 0 ? (
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
