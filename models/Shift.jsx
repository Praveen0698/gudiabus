import mongoose from "mongoose";

// Define the schema for the items array
const ItemSchema = new mongoose.Schema({
  id: { type: String },
  vehicle: { type: String },
  source: { type: String },
  destination: { type: String },
  aincout: { type: String },
  generalIn: { type: String },
  shuttle2: { type: String },
  binaout: { type: String },
  shuttle3: { type: String },
  generalOut: { type: String },
  cincout: { type: String },
});

// Define the main schema for the project
const ShiftSchema = new mongoose.Schema({
  projectId: { type: String },
  projectName: { type: String },
  employeeId: { type: String },
  date: { type: String },
  items: [ItemSchema],
});

export default mongoose.models.Shift || mongoose.model("Shift", ShiftSchema);
