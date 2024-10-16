"use client";
import React, { Suspense, useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { SelectChangeEvent } from "@mui/material/Select";
import Image from "next/image";
import Navbar from "../common/Navbar";
import Elipse from "../../public/elipse.png";
import { TextField, Button, Select, MenuItem } from "@mui/material";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import jwt, { JwtPayload } from "jsonwebtoken";

interface Item {
  id: string;
  vehicle: string;
  odometer: string;
  odometerFile: string;
  amount: string;
  amountFile: string;
  paymentType: string;
  pumpName: string;
}

interface DecodedToken extends JwtPayload {
  userId: string;
}

const FuelTable: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectId = searchParams.get("projectId");
  const projectName = searchParams.get("projectName");
  const empId = searchParams.get("empId");

  const getFormattedDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [item, setItem] = useState([
    {
      id: new Date().getTime().toString(),
      vehicle: "",
      odometer: "",
      odometerFile: "",
      amount: "",
      amountFile: "",
      paymentType: "",
      pumpName: "",
    },
  ]);

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
        const accessToken = response.data.accessToken;
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

  const [formData, setFormData] = useState({
    projectId: projectId,
    projectName: projectName,
    employeeId: empId,
    date: getFormattedDate(),
    items: [
      {
        id: "",
        vehicle: "",
        odometer: "",
        odometerFile: "",
        amount: "",
        amountFile: "",
        paymentType: "",
        pumpName: "",
      },
    ],
  });
  console.log(formData);

  const addItem = () => {
    const newItem: Item = {
      id: new Date().getTime().toString(),
      vehicle: "",
      odometer: "",
      odometerFile: "",
      amount: "",
      amountFile: "",
      paymentType: "",
      pumpName: "",
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

  const [getVehicle, setGetVehicle] = useState<any[]>([]);

  const fetchVehicle = async () => {
    try {
      const res = await axios.get("/api/vehicle/getall");
      setGetVehicle(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    await axios
      .post("/api/fuel/create", formData)
      .then((res) => console.log("success"))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
    setFormData({
      projectId: projectId,
      projectName: projectName,
      employeeId: empId,
      date: getFormattedDate(),
      items: [
        {
          id: "",
          vehicle: "",
          odometer: "",
          odometerFile: "",
          amount: "",
          amountFile: "",
          paymentType: "",
          pumpName: "",
        },
      ],
    });

    setItem([
      {
        id: new Date().getTime().toString(),
        vehicle: "",
        odometer: "",
        odometerFile: "",
        amount: "",
        amountFile: "",
        paymentType: "",
        pumpName: "",
      },
    ]);
  };

  return (
    <Suspense fallback={<div>Loading fuel view...</div>}>
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
          Home / <span style={{ color: "white" }}>Fuel</span>
        </p>

        <div className="table-main-container">
          <div className="title-button-container">
            <h3 className="table-h3">Fuel Expenses</h3>
          </div>
          <TableContainer component={Paper} className="table-container">
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
              <TableHead style={{ background: "#ddff8f" }}>
                <TableRow>
                  {[
                    "SL",
                    "Vehicle",
                    "Odometer",
                    "Odometer Image",
                    "Amount",
                    "Amount Reciept",
                    "Payment Type",
                    "Pump Name",
                    "Actions",
                  ].map((header, index) => (
                    <TableCell
                      key={index}
                      colSpan={header === "Actions" ? 2 : 1}
                      style={{ fontWeight: "bold", textAlign: "center" }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              {formData.items.map((row, index) => (
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
                        value={row.vehicle}
                        onChange={(e) => handleItemChange(e, row.id)}
                      >
                        {getVehicle.length > 0 ? (
                          getVehicle.map((type) => (
                            <MenuItem key={type._id} value={type.vehicleNumber}>
                              {type.vehicleNumber}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No data available</MenuItem>
                        )}
                      </Select>
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
                        name="amount"
                        value={row.amount}
                        onChange={(e) => handleItemChange(e, row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="file"
                        name="amountFile"
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
                        name="paymentType"
                        value={row.paymentType}
                        onChange={(e) => handleItemChange(e, row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="text"
                        name="pumpName"
                        value={row.pumpName}
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
                  {/* Washing */}
                </TableBody>
              ))}
            </Table>
            <div
              className="data-buttons"
              style={{ margin: "10px", textAlign: "right" }}
            >
              <Button
                id="input-btn-submit"
                className="submit"
                type="submit"
                variant="outlined"
                onClick={handleSave}
              >
                Submit
              </Button>
            </div>
          </TableContainer>
        </div>
      </section>
    </Suspense>
  );
};

export default FuelTable;
