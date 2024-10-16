import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateAccessToken } from "../../../../utils/auth";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const refreshToken = req.cookies.get("refreshToken");

  if (!refreshToken) {
    return NextResponse.json(
      { message: "No refresh token provided" },
      { status: 401 }
    );
  }

  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const accessToken = generateAccessToken(user);

    return NextResponse.json({ accessToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid refresh token" },
      { status: 403 }
    );
  }
}
