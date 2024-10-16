import { NextResponse } from "next/server";
import connectDB from "../../../../../../../utils/db";
import Fuel from "../../../../../../../models/Fuel";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();

  const projectId = params.projectId;
  const employeeId = params.employeeId;
  const date = params.date;

  try {
    // Fetch the shift document based on projectId and employeeId
    const fuel = await Fuel.findOne({
      projectId: projectId,
      employeeId: employeeId,
      date: date,
    });

    if (!fuel) {
      return NextResponse.json(
        { message: "No fuel found for the provided projectId and employeeId" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Fuel found in the first element", data: fuel.items },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
