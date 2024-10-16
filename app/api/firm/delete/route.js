import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Firm from "../../../../models/Firm";
export const dynamic = "force-dynamic";

export async function DELETE(req) {
  await connectDB();
  const { id } = await req.json();

  try {
    const deletedFirm = await Firm.findByIdAndDelete(id);

    if (!deletedFirm) {
      return NextResponse.json({ message: "Firm not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Firm deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
