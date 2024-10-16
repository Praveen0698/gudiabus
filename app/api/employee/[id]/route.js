import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Employee from "../../../../models/Employee";
export const dynamic = "force-dynamic";

// Handler to get firm by ID
export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;
  try {
    // Fetch Employee by ID
    const employee = await Employee.findById(id);
    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Return Employee data
    return NextResponse.json(employee, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
