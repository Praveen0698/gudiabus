import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Employee from "../../../../models/Employee";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    // Fetch all Employees from the database
    const employees = await Employee.find({});

    // Return Employees data
    return NextResponse.json(employees, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
