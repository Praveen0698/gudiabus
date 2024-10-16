import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  amount: { type: String },
  date: { type: String },
});

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
    },
    age: {
      type: String,
    },
    address: {
      type: String,
    },
    aadharNumber: {
      type: String,
    },
    aadharFile: {
      type: String,
    },
    dlNumber: {
      type: String,
    },
    dlFile: {
      type: String,
    },
    experience: {
      type: String,
    },
    designation: {
      type: String,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    expenses: [expenseSchema],
  },
  { timestamps: true }
);

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

export default Employee;
