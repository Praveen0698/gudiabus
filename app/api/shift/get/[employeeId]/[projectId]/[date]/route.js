import { NextResponse } from "next/server";
import connectDB from "../../../../../../../utils/db";
import Shift from "../../../../../../../models/Shift";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();

  const projectId = params.projectId;
  const employeeId = params.employeeId;
  const date = params.date;

  try {
    // Fetch the shift document based on projectId and employeeId
    const shift = await Shift.findOne({
      projectId: projectId,
      employeeId: employeeId,
      date: date,
    });
    // console.log(shift);

    if (!shift) {
      return NextResponse.json(
        { message: "No shift found for the provided projectId and employeeId" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Shift found in the first element", data: shift.items },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
