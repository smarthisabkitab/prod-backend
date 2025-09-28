import csvParser from "csv-parser";
import fs from "fs";

import { cleanupUploadedFile } from "../../../config/multer.config.js";

export const createShopTransaction = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded",
    });
  }
  try {
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", () => {
          console.log(`Processed ${results.length} records`);
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });

    // TODO: Add database insertion logic here

    return res.status(201).json({
      success: true,
      message: "Data Uploaded Successfully",
      items: results,
    });
  } catch (error) {
    console.error(`Shop Transaction -> ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  } finally {
    if (req.file) cleanupUploadedFile(req.file.path);
  }
};
