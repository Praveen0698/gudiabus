import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Vehicle from "../../../../models/Vehicle";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid"; // For generating unique filenames

// Configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const dynamic = "force-dynamic";

// Helper function to delete old files from S3
const deleteS3Object = async (fileUrl) => {
  if (!fileUrl) return; // Skip if no file URL is provided
  const fileKey = fileUrl.replace(/^https:\/\/[^/]+\/(.+)/, "$1"); // Extract S3 key from URL

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3.send(command);
    console.log(`Deleted old file from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Error deleting file ${fileKey}:`, error);
  }
};

// Helper function to upload a new file to S3
const uploadToS3 = async (base64String, folder) => {
  const base64Pattern = /^data:(.*?);base64,/;
  const matches = base64String.match(base64Pattern);
  const mimeType = matches ? matches[1] : "";
  const fileExtension = mimeType.includes("pdf")
    ? "pdf"
    : mimeType.split("/")[1] || "png";

  const buffer = Buffer.from(base64String.replace(base64Pattern, ""), "base64");
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
    console.log(`Uploaded new file to S3: ${key}`);
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("S3 upload error:", error);
    throw new Error("Failed to upload file to S3");
  }
};

// PUT handler to update vehicle
export async function PUT(req) {
  await connectDB();

  try {
    const vehicleData = await req.json();
    const {
      _id,
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

    // Fetch the existing vehicle to check for old files
    const existingVehicle = await Vehicle.findById(_id);
    if (!existingVehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Handle file uploads and deletion of old files
    const handleFileUpdate = async (newFile, oldFileUrl, folder) => {
      if (newFile) {
        if (oldFileUrl) await deleteS3Object(oldFileUrl); // Delete old file from S3
        return await uploadToS3(newFile, folder); // Upload new file to S3
      }
      return oldFileUrl; // Return old file URL if no new file is provided
    };

    // Update or retain file URLs
    const updatedRcFile = await handleFileUpdate(
      rcFile,
      existingVehicle.rcFile,
      "rc"
    );
    const updatedInsuranceFile = await handleFileUpdate(
      insuranceFile,
      existingVehicle.insuranceFile,
      "insurance"
    );
    const updatedFitnessFile = await handleFileUpdate(
      fitnessFile,
      existingVehicle.fitnessFile,
      "fitness"
    );
    const updatedPollutionFile = await handleFileUpdate(
      pollutionFile,
      existingVehicle.pollutionFile,
      "pollution"
    );
    const updatedRoadTaxFile = await handleFileUpdate(
      roadTaxFile,
      existingVehicle.roadTaxFile,
      "roadTax"
    );
    const updatedVehiclePassFile = await handleFileUpdate(
      vehiclePassFile,
      existingVehicle.vehiclePassFile,
      "vehiclePass"
    );
    const updatedOtherFile = await handleFileUpdate(
      otherFile,
      existingVehicle.otherFile,
      "other"
    );

    // Prepare the update data object
    const updateData = {
      vehicleNumber,
      brand,
      model,
      rc,
      insurance,
      fitness,
      pollution,
      roadTax,
      odometer,
      vehiclePass,
      chessisNumber,
      engineNumber,
      permitExpiryDate,
      emiAmount,
      emiDate,
      financer,
      bankAccount,
      hpStatus,
      rcFile: updatedRcFile,
      insuranceFile: updatedInsuranceFile,
      fitnessFile: updatedFitnessFile,
      pollutionFile: updatedPollutionFile,
      roadTaxFile: updatedRoadTaxFile,
      vehiclePassFile: updatedVehiclePassFile,
      otherFile: updatedOtherFile,
    };

    // Update the vehicle in the database
    const updatedVehicle = await Vehicle.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedVehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Vehicle updated successfully", vehicle: updatedVehicle },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred while updating vehicle:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
