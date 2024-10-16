import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "../../../../models/User";
import { generateAccessToken } from "@/utils/auth";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const { cookies } = req;

  const refreshToken = cookies.get("refreshToken");
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken.value,
        process.env.REFRESH_TOKEN_SECRET
      );
      const user = await User.findById(decoded.userId);

      if (!user) {
        return NextResponse.json({ isLoggedIn: false }, { status: 401 });
      }
      const accessToken = generateAccessToken(user);
      return NextResponse.json(
        { isLoggedIn: true, accessToken },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json({ isLoggedIn: false }, { status: 401 });
    }
  }

  return NextResponse.json({ isLoggedIn: false });
}
