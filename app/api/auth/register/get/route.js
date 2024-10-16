import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import User from "../../../../../models/User";
export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();

  try {
    // Fetch all Employees from the database
    const user = await User.find({});

    // Return Employees data
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
