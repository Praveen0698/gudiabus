// import { NextResponse } from "next/server";
// import connectDB from "../../../../utils/db";
// import Employee from "../../../../models/Employee";
// import {
//   S3Client,
//   PutObjectCommand,
//   DeleteObjectCommand,
// } from "@aws-sdk/client-s3";

// export const dynamic = "force-dynamic";

// // Initialize S3 client with credentials and region
// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Function to delete an S3 object
// const deleteS3Object = async (fileKey) => {
//   if (!fileKey) return; // Skip if no key is provided

//   try {
//     const command = new DeleteObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: fileKey,
//     });
//     await s3.send(command);
//     console.log(`Deleted old file from S3: ${fileKey}`);
//   } catch (error) {
//     console.error(`Error deleting file ${fileKey}:`, error);
//   }
// };

// // Function to upload a file to S3
// const uploadToS3 = async (base64File, folder) => {
//   const base64Pattern = /^data:(.*?);base64,/;
//   const matches = base64File.match(base64Pattern);
//   const mimeType = matches ? matches[1] : "";
//   const fileExtension = mimeType.split("/")[1] || "png";
//   const buffer = Buffer.from(base64File.replace(base64Pattern, ""), "base64");

//   const filename = `${Date.now()}_${folder}.${fileExtension}`;
//   const key = `${folder}/${filename}`; // File path in S3

//   try {
//     const command = new PutObjectCommand({
//       Bucket: process.env.AWS_S3_BUCKET_NAME,
//       Key: key,
//       Body: buffer,
//       ContentType: mimeType,
//     });
//     await s3.send(command);
//     console.log(`Uploaded new file to S3: ${key}`);
//     return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
//   } catch (error) {
//     console.error("S3 upload error:", error);
//     throw new Error("Failed to upload file to S3");
//   }
// };

// export async function PUT(req) {
//   await connectDB();

//   const employeeData = await req.json();
//   const {
//     _id,
//     employeeName,
//     age,
//     address,
//     aadharNumber,
//     aadharFile,
//     dlNumber,
//     dlFile,
//     experience,
//     designation,
//   } = employeeData;

//   try {
//     const existingEmployee = await Employee.findById(_id);
//     if (!existingEmployee) {
//       return NextResponse.json(
//         { message: "Employee not found" },
//         { status: 404 }
//       );
//     }

//     // Upload new Aadhar and DL files if provided, and delete old ones
//     let aadharFilePath = existingEmployee.aadharFile;
//     let dlFilePath = existingEmployee.dlFile;

//     if (aadharFile) {
//       if (aadharFilePath) {
//         const oldAadharKey = aadharFilePath.replace(
//           /^https:\/\/[^/]+\/(.+)/,
//           "$1"
//         );
//         await deleteS3Object(oldAadharKey); // Delete old Aadhar file
//       }
//       aadharFilePath = await uploadToS3(aadharFile, "aadhar");
//     }

//     if (dlFile) {
//       if (dlFilePath) {
//         const oldDLKey = dlFilePath.replace(/^https:\/\/[^/]+\/(.+)/, "$1");
//         await deleteS3Object(oldDLKey); // Delete old DL file
//       }
//       dlFilePath = await uploadToS3(dlFile, "dl");
//     }

//     // Prepare the update data
//     const updateData = {
//       employeeName,
//       age,
//       address,
//       aadharNumber,
//       dlNumber,
//       experience,
//       designation,
//       aadharFile: aadharFilePath,
//       dlFile: dlFilePath,
//     };

//     const updatedEmployee = await Employee.findByIdAndUpdate(_id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     return NextResponse.json(
//       { message: "Employee updated successfully", Employee: updatedEmployee },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({ message: "Server error" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "../../../../utils/db";
import Employee from "../../../../models/Employee";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

// Initialize S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Function to delete a file from S3
const deleteS3Object = async (fileKey) => {
  if (!fileKey) return; // Skip if no key provided

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    });
    await s3.send(command);
    console.log(`Deleted old file from S3: ${fileKey}`);
  } catch (error) {
    console.error(`Error deleting ${fileKey} from S3:`, error);
  }
};

// Function to upload a file to S3
const uploadToS3 = async (base64File, folder) => {
  const base64Pattern = /^data:(.*?);base64,/;
  const matches = base64File.match(base64Pattern);
  const mimeType = matches ? matches[1] : "";
  const fileExtension = mimeType.split("/")[1] || "png";
  const buffer = Buffer.from(base64File.replace(base64Pattern, ""), "base64");

  const filename = `${Date.now()}_${folder}.${fileExtension}`;
  const key = `${folder}/${filename}`; // S3 file path

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

// Helper function to extract S3 key from URL
const getFileKey = (fileUrl) => {
  if (!fileUrl) return null;
  return fileUrl.replace(/^https:\/\/[^/]+\/(.+)/, "$1");
};

export async function PUT(req) {
  await connectDB();
  const employeeData = await req.json();

  const {
    _id,
    employeeName,
    age,
    address,
    aadharNumber,
    aadharFile,
    dlNumber,
    dlFile,
    experience,
    designation,
  } = employeeData;

  try {
    // Find existing employee
    const existingEmployee = await Employee.findById(_id);
    if (!existingEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }

    // Manage Aadhar file: delete old if new is provided
    let aadharFilePath = existingEmployee.aadharFile;
    if (aadharFile) {
      if (aadharFilePath) {
        const oldAadharKey = getFileKey(aadharFilePath);
        await deleteS3Object(oldAadharKey);
      }
      aadharFilePath = await uploadToS3(aadharFile, "aadhar");
    }

    // Manage DL file: delete old if new is provided
    let dlFilePath = existingEmployee.dlFile;
    if (dlFile) {
      if (dlFilePath) {
        const oldDLKey = getFileKey(dlFilePath);
        await deleteS3Object(oldDLKey);
      }
      dlFilePath = await uploadToS3(dlFile, "dl");
    }

    // Prepare update data
    const updateData = {
      employeeName,
      age,
      address,
      aadharNumber,
      dlNumber,
      experience,
      designation,
      aadharFile: aadharFilePath,
      dlFile: dlFilePath,
    };

    // Update employee in the database
    const updatedEmployee = await Employee.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      { message: "Employee updated successfully", employee: updatedEmployee },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
