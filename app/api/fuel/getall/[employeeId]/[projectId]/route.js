import { NextResponse } from "next/server";
import connectDB from "../../../../../../utils/db";
import Fuel from "../../../../../../models/Fuel";
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();
  const employeeId = params.employeeId;
  const projectId = params.projectId;
  try {
    // Fetch all fuel from the database
    const fuel = await Fuel.find({
      projectId: projectId,
      employeeId: employeeId,
    });
    // Return fuel data
    return NextResponse.json(fuel, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
