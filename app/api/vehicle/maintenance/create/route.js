// import { NextResponse } from "next/server";
// import path from "path";
// import fs from "fs";
// import connectDB from "../../../../../utils/db";
// import Maintenance from "../../../../../models/Maintenance";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   await connectDB();

//   try {
//     const maintenanceData = await req.json();
//     const { projectId, projectName, employeeId, date, items } = maintenanceData;

//     const saveBase64File = (base64String, folder) => {
//       const base64Pattern = /^data:(.*?);base64,/;
//       const matches = base64String.match(base64Pattern);
//       const mimeType = matches ? matches[1] : "";

//       let fileExtension = "png";
//       if (mimeType.includes("pdf")) {
//         fileExtension = "pdf";
//       } else if (mimeType.includes("image")) {
//         fileExtension = mimeType.split("/")[1];
//       }

//       const base64Data = base64String.replace(base64Pattern, "");
//       const buffer = Buffer.from(base64Data, "base64");

//       const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
//       if (!fs.existsSync(uploadDir)) {
//         fs.mkdirSync(uploadDir, { recursive: true });
//       }

//       const filename = `${Date.now()}.${fileExtension}`;
//       const filePath = `/uploads/${folder}/${filename}`;
//       const fullPath = path.join(uploadDir, filename);

//       fs.writeFileSync(fullPath, buffer);
//       return filePath;
//     };

//     const processedItems = items.map((item) => {
//       return {
//         ...item,
//         tyreRotationFile: item.tyreRotationFile
//           ? saveBase64File(item.tyreRotationFile, "tyreRotation")
//           : null,
//         odometerFile: item.odometerFile
//           ? saveBase64File(item.odometerFile, "odometer")
//           : null,
//         maintenanceFile: item.maintenanceFile
//           ? saveBase64File(item.maintenanceFile, "maintenance")
//           : null,
//         washingFile: item.washingFile
//           ? saveBase64File(item.washingFile, "washing")
//           : null,
//       };
//     });

//     const newMaintenance = new Maintenance({
//       projectId,
//       projectName,
//       employeeId,
//       date,
//       items: processedItems,
//     });

//     await newMaintenance.save();

//     return NextResponse.json(
//       { message: "Maintenance registered successfully" },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error saving maintenance:", error);
//     return NextResponse.json(
//       { message: "Server error", error },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import connectDB from "../../../../../utils/db";
import Maintenance from "../../../../../models/Maintenance";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // Import the necessary S3 commands
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating unique filenames

// Configure the S3 client
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

  try {
    const maintenanceData = await req.json();
    const { projectId, projectName, employeeId, date, items } = maintenanceData;

    const uploadToS3 = async (base64String, folder) => {
      const base64Pattern = /^data:(.*?);base64,/;
      const matches = base64String.match(base64Pattern);
      const mimeType = matches ? matches[1] : "";
      const fileExtension = mimeType.includes("pdf")
        ? "pdf"
        : mimeType.split("/")[1] || "png"; // Default to png if not recognized

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

    const processedItems = await Promise.all(
      items.map(async (item) => {
        return {
          ...item,
          tyreRotationFile: item.tyreRotationFile
            ? await uploadToS3(item.tyreRotationFile, "tyreRotation")
            : null,
          odometerFile: item.odometerFile
            ? await uploadToS3(item.odometerFile, "odometer")
            : null,
          maintenanceFile: item.maintenanceFile
            ? await uploadToS3(item.maintenanceFile, "maintenance")
            : null,
          washingFile: item.washingFile
            ? await uploadToS3(item.washingFile, "washing")
            : null,
        };
      })
    );

    const newMaintenance = new Maintenance({
      projectId,
      projectName,
      employeeId,
      date,
      items: processedItems,
    });

    await newMaintenance.save();

    return NextResponse.json(
      { message: "Maintenance registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving maintenance:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message }, // Return error message for clarity
      { status: 500 }
    );
  }
}
