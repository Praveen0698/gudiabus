import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Vehicle from "../../../../models/Vehicle";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    // Fetch all Vehicles from the database
    const Vehicles = await Vehicle.find();
    // Return Vehicles data
    return NextResponse.json(Vehicles, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
