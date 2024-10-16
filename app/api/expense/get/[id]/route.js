import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Expense from "../../../../../models/Expense";
export const dynamic = "force-dynamic";

// Handler to get expense by employeeId
export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;
  try {
    const expenses = await Expense.find({ employeeId: id });

    if (!expenses || expenses.length === 0) {
      return NextResponse.json(
        { message: "No expenses found for this employee" }
        // { status: 404 }
      );
    }

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
