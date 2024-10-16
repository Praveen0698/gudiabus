import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Firm from "../../../../models/Firm";
export const dynamic = "force-dynamic";

export async function PUT(req) {
  await connectDB();
  const firmData = await req.json();
  const {
    _id,
    firmName,
    firmType,
    gstNumber,
    gstAddress,
    panTanNumber,
    propertiorName,
  } = firmData;

  try {
    const updatedFirm = await Firm.findByIdAndUpdate(
      _id,
      {
        firmName,
        firmType,
        gstNumber,
        gstAddress,
        panTanNumber,
        propertiorName,
      },
      { new: true, runValidators: true }
    );

    if (!updatedFirm) {
      return NextResponse.json({ message: "Firm not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Firm updated successfully", firm: updatedFirm },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
