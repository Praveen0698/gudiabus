import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Expense from "../../../../models/Expense";
export const dynamic = "force-dynamic";

export async function PUT(req) {
  await connectDB();

  const expenseData = await req.json();
  const { _id, amount, date } = expenseData;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      _id,
      { amount, date },
      { new: true }
    );

    if (!updatedExpense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Expense updated successfully", expense: updatedExpense },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
