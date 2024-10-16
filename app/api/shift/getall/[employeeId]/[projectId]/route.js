import { NextResponse } from "next/server";
import connectDB from "../../../../../../utils/db";
import Shift from "../../../../../../models/Shift";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const employeeId = params.employeeId;
  const projectId = params.projectId;
  try {
    // Fetch all Shift from the database
    const shift = await Shift.find({
      projectId: projectId,
      employeeId: employeeId,
    });
    // Return Shift data
    return NextResponse.json(shift, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
