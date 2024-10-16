import mongoose from "mongoose";

// Define the schema for individual items
const ItemSchema = new mongoose.Schema({
  id: { type: String },
  vehicle: { type: String },
  odometer: { type: String },
  odometerFile: { type: String },
  amount: { type: String },
  amountFile: { type: String },
  paymentType: { type: String },
  pumpName: { type: String },
});

// Define the main schema for maintenance records
const FuelSchema = new mongoose.Schema({
  projectId: { type: String },
  projectName: { type: String },
  employeeId: { type: String },
  date: { type: String },
  items: [ItemSchema], // Array of items
});

// Export the model if it doesn't already exist
export default mongoose.models.Fuel || mongoose.model("Fuel", FuelSchema);
