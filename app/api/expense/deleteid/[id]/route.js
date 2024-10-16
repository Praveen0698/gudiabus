import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Expense from "../../../../../models/Expense";
export const dynamic = "force-dynamic";

export async function DELETE(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const deletedExpenses = await Expense.deleteMany({ employeeId: id });

    if (deletedExpenses.deletedCount === 0) {
      return NextResponse.json(
        { message: "No expenses found for this employee" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Expenses deleted successfully",
        deletedCount: deletedExpenses.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
