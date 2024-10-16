import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Expense from "../../../../models/Expense";
export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDB();

  const expenseData = await req.json();
  console.log(expenseData);
  const { employeeId, employeeName, adminName, amount, date } =
    expenseData.formData;

  try {
    const newExpense = new Expense({
      employeeId,
      employeeName,
      adminName,
      amount,
      date,
    });

    await newExpense.save();
    return NextResponse.json(
      { message: "Expense created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
