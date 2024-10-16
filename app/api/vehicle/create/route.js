import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Vehicle from "../../../../models/Vehicle";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid"; // For unique filenames

// Configure S3 client
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
  const vehicleData = await req.json();
  const {
    vehicleNumber,
    brand,
    model,
    rc,
    rcFile,
    insurance,
    insuranceFile,
    fitness,
    fitnessFile,
    pollution,
    pollutionFile,
    roadTax,
    roadTaxFile,
    odometer,
    vehiclePass,
    vehiclePassFile,
    otherFile,
    chessisNumber,
    engineNumber,
    permitExpiryDate,
    emiAmount,
    emiDate,
    financer,
    bankAccount,
    hpStatus,
  } = vehicleData;

  try {
    const existingVehicle = await Vehicle.findOne({ vehicleNumber });
    if (existingVehicle) {
      return NextResponse.json({ message: "Vehicle already exists" });
    }

    // Helper function to upload files to S3
    const uploadToS3 = async (base64String, folder) => {
      const base64Pattern = /^data:(.*?);base64,/;
      const matches = base64String.match(base64Pattern);
      const mimeType = matches ? matches[1] : "application/octet-stream";
      const fileExtension = mimeType.split("/")[1] || "png";
      const buffer = Buffer.from(
        base64String.replace(base64Pattern, ""),
        "base64"
      );

      const filename = `${uuidv4()}.${fileExtension}`;
      const key = `${folder}/${filename}`;

      try {
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        });

        await s3.send(command);
        return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      } catch (error) {
        console.error("S3 upload error:", error);
        throw new Error("Failed to upload file to S3");
      }
    };

    // Upload files to S3 if they exist
    const rcFilePath = rcFile ? await uploadToS3(rcFile, "rc") : null;
    const insuranceFilePath = insuranceFile
      ? await uploadToS3(insuranceFile, "insurance")
      : null;
    const fitnessFilePath = fitnessFile
      ? await uploadToS3(fitnessFile, "fitness")
      : null;
    const pollutionFilePath = pollutionFile
      ? await uploadToS3(pollutionFile, "pollution")
      : null;
    const roadTaxFilePath = roadTaxFile
      ? await uploadToS3(roadTaxFile, "roadTax")
      : null;
    const vehiclePassFilePath = vehiclePassFile
      ? await uploadToS3(vehiclePassFile, "vehiclePass")
      : null;
    const otherFilePath = otherFile
      ? await uploadToS3(otherFile, "other")
      : null;

    // Create a new vehicle document
    const newVehicle = new Vehicle({
      vehicleNumber,
      brand,
      model,
      rc,
      rcFile: rcFilePath,
      insurance,
      insuranceFile: insuranceFilePath,
      fitness,
      fitnessFile: fitnessFilePath,
      pollution,
      pollutionFile: pollutionFilePath,
      roadTax,
      roadTaxFile: roadTaxFilePath,
      odometer,
      vehiclePass,
      vehiclePassFile: vehiclePassFilePath,
      otherFile: otherFilePath,
      chessisNumber,
      engineNumber,
      permitExpiryDate,
      emiAmount,
      emiDate,
      financer,
      bankAccount,
      hpStatus,
    });

    // Save the new vehicle to the database
    await newVehicle.save();

    return NextResponse.json(
      { message: "Vehicle created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
