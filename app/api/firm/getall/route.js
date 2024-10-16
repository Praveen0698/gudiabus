import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Firm from "../../../../models/Firm";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    // Fetch all firms from the database
    const firms = await Firm.find();

    // Return firms data
    return NextResponse.json(firms, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
