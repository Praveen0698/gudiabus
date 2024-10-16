import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Expense from "../../../../models/Expense";
export const dynamic = "force-dynamic";

// Handler to get firm by ID
export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;
  try {
    // Fetch Expense by ID
    const expense = await Expense.findById(id);
    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    // Return Expense data
    return NextResponse.json(expense, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
