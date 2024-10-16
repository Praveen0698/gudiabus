import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String },
    brand: { type: String },
    model: { type: String },
    rc: { type: String },
    rcFile: { type: String },
    insurance: { type: String },
    insuranceFile: { type: String },
    fitness: { type: String },
    fitnessFile: { type: String },
    pollution: { type: String },
    pollutionFile: { type: String },
    roadTax: { type: String },
    roadTaxFile: { type: String },
    odometer: { type: String },
    vehiclePass: { type: String },
    vehiclePassFile: { type: String },
    otherFile: { type: String },
    chessisNumber: { type: String },
    engineNumber: { type: String },
    permitExpiryDate: { type: String },
    emiAmount: { type: String },
    emiDate: { type: String },
    financer: { type: String },
    bankAccount: { type: String },
    hpStatus: { type: String },
  },
  { timestamps: true }
);

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
