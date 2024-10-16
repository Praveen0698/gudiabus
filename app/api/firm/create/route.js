import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Firm from "../../../../models/Firm";
export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDB();
  const firmData = await req.json();

  const {
    firmName,
    firmType,
    gstNumber,
    gstAddress,
    panTanNumber,
    propertiorName,
  } = firmData;

  try {
    const existingFirm = await Firm.findOne({ firmName });
    if (existingFirm) {
      return NextResponse.json({ message: "exists" });
    }

    const user = new Firm({
      firmName,
      firmType,
      gstNumber,
      gstAddress,
      panTanNumber,
      propertiorName,
    });

    await user.save();

    return NextResponse.json(
      { message: "Firm registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
