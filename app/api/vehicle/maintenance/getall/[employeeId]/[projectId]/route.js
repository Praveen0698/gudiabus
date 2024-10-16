import { NextResponse } from "next/server";
import connectDB from "../../../../../../../utils/db";
import Maintenance from "../../../../../../../models/Maintenance";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const employeeId = params.employeeId;
  const projectId = params.projectId;
  try {
    // Fetch all Shift from the database
    const maintenance = await Maintenance.find({
      projectId: projectId,
      employeeId: employeeId,
    });
    // Return Shift data
    return NextResponse.json(maintenance, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
