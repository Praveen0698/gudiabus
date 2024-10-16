import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String },
    poNumber: { type: String },
    poFile: { type: String },
    fleetSize: { type: String },
    firmName: { type: String },
    vehicle: { type: String },
    source: { type: String },
    destination: { type: String },
    supervisor: { type: String },
    employeeId: { type: String },
  },
  { timestamps: true }
);

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

export default Project;
