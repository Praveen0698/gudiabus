import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Shift from "../../../../models/Shift";
export const dynamic = "force-dynamic";

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  try {
    const deletedShift = await Shift.findByIdAndDelete(id);

    if (!deletedShift) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Shift deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
