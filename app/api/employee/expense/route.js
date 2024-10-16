import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Employee from "../../../../models/Employee";
export const dynamic = "force-dynamic";

// PATCH request to update expenses of an employee
export async function PATCH(req) {
  await connectDB();
  const expenseData = await req.json();
  const { employeeId, amount, date } = expenseData.formData;
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        $push: { expenses: { amount, date } },
      },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Expense added successfully", data: updatedEmployee },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
