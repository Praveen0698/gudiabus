import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Expense from "../../../../models/Expense";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    // Fetch all expenses from the database
    const expenses = await Expense.find({}, { expenses: 0 });

    // Return expenses data
    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
