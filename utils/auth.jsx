import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, name: user.fullName, role: "admin" },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  ); // Shorter expiration
};

export const generateAccessManagerToken = (employee) => {
  console.log(employee);
  return jwt.sign(
    {
      name: employee.employeeName,
      id: employee._id,
      role: "manager",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    }
  ); // Shorter expiration
};

export const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const generateRefreshManagerToken = (employee) => {
  return jwt.sign(
    { employeeId: employee._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
