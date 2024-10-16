import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  employeeName: { type: String },
  adminName: { type: String },
  employeeId: { type: String },
  amount: { type: String },
  date: { type: String },
});

const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);

export default Expense;
