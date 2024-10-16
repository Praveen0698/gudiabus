import mongoose from "mongoose";

// Define the schema for individual items
const ItemSchema = new mongoose.Schema({
  id: { type: String },
  vehicle: { type: String },
  tyreRotation: { type: String },
  tyreRotationFile: { type: String },
  tyreRotationDesc: { type: String },
  maintenance: { type: String },
  maintenanceFile: { type: String },
  maintenanceDesc: { type: String },
  odometer: { type: String },
  odometerFile: { type: String },
  odometerDesc: { type: String },
  washing: { type: String },
  washingFile: { type: String },
  washingDesc: { type: String },
});

// Define the main schema for maintenance records
const MaintenanceSchema = new mongoose.Schema({
  projectId: { type: String },
  projectName: { type: String },
  employeeId: { type: String },
  date: { type: String },
  items: [ItemSchema], // Array of items
});

// Export the model if it doesn't already exist
export default mongoose.models.Maintenance ||
  mongoose.model("Maintenance", MaintenanceSchema);
