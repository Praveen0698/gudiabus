import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDB();

  const { fullName, username, password } = await req.json();

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ username, fullName, password: hashedPassword });

    await user.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
