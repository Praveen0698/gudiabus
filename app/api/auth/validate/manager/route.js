import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Employee from "../../../../../models/Employee";
import { generateAccessManagerToken } from "../../../../../utils/auth";
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
      const employee = await Employee.findById(decoded.employeeId);
      if (!employee) {
        return NextResponse.json({ isLoggedIn: false }, { status: 401 });
      }
      const accessToken = generateAccessManagerToken(employee);
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
