import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Shift from "../../../../models/Shift";
export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDB();
  const shiftData = await req.json();
  const { projectId, projectName, employeeId, date, items } = shiftData;
  try {
    const newShift = new Shift({
      projectId,
      projectName,
      employeeId,
      date,
      items,
    });

    await newShift.save();

    return NextResponse.json(
      { message: "Shift registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}
