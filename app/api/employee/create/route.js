import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Employee from "../../../../models/Employee";
import bcrypt from "bcryptjs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configure your S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

export async function POST(req) {
  await connectDB();

  const EmployeeData = await req.json();
  const {
    employeeName,
    age,
    address,
    aadharNumber,
    aadharFile,
    dlNumber,
    dlFile,
    experience,
    designation,
    username,
    password,
  } = EmployeeData;

  try {
    const lowercaseUsername = username.toLowerCase();
    // Function to upload base64 file to S3 bucket
    const uploadToS3 = async (base64String, folder) => {
      const base64Pattern = /^data:(.*?);base64,/;
      const matches = base64String.match(base64Pattern);
      const mimeType = matches ? matches[1] : "";
      const fileExtension = mimeType.split("/")[1] || "png";
      const buffer = Buffer.from(
        base64String.replace(base64Pattern, ""),
        "base64"
      );

      const filename = `${Date.now()}.${fileExtension}`;
      const key = `${folder}/${filename}`; // S3 key (file path within the bucket)

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        });
        await s3.send(command);

        // Return the public S3 URL of the uploaded file
        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      } catch (error) {
        console.error("S3 upload error:", error);
        throw new Error("Failed to upload file to S3");
      }
    };

    // Upload files to S3 (if provided)
    let aadharFilePath = aadharFile
      ? await uploadToS3(aadharFile, "aadhar")
      : null;
    let dlFilePath = dlFile ? await uploadToS3(dlFile, "dl") : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = new Employee({
      employeeName,
      age,
      address,
      aadharNumber,
      aadharFile: aadharFilePath,
      dlNumber,
      dlFile: dlFilePath,
      experience,
      designation,
      username: lowercaseUsername,
      password: hashedPassword,
      expenses: [],
    });

    await newEmployee.save();
    return NextResponse.json(
      { message: "Employee created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
