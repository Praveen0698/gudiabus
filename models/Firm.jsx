import mongoose from "mongoose";

const firmSchema = new mongoose.Schema({
  firmName: { type: String },
  firmType: { type: String },
  gstNumber: { type: String },
  gstAddress: { type: String },
  panTanNumber: { type: String },
  propertiorName: { type: String },
});

const Firm = mongoose.models.Firm || mongoose.model("Firm", firmSchema);

export default Firm;
