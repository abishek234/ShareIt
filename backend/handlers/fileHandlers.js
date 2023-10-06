import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

import File from "../models/File.js";
import { sendMail } from "../services/emailService.js";
import { emailTemplate } from "../services/emailTemplate.js";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: "1000000 * 100" },
}).single("myFile");

// @description     Upload a file
// @route           POST /api/files/
// @access          Public
export const uploadFiles = (req, res) => {
  // Store file
  upload(req, res, async (err) => {
    // Validate requests
    if (!req.file) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "All the fields are required",
      });
    }

    if (err) {
      return res.status(500).json({
        success: false,
        statusCode: 500,
        message: err.message,
      });
    }

    // Store into Databse
    const response = await File.create({
      filename: req.file.filename,
      uuid: uuidv4(),
      path: req.file.path,
      size: req.file.size,
    });

    // Response -> Link
    return res.status(200).json({
      success: true,
      statusCode: 200,
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`, // It will look like this: http://localhost:5002/files/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
      message: "All the fields are required",
    });
  });
};

// @description     Get file info
// @route           GET /files/:uuid
// @access          Public
export const getFiles = async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });

    // If file is not present in database
    if (!file) {
      return res.render("download", { error: "Link has been expired." });
    }

    res.render("download", {
      uuid: file.uuid,
      filename: file.filename,
      size: file.size,
      downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`, // It will look like this: http://localhost:5002/files/download/1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed
    });
  } catch (err) {
    return res.render("download", { error: "Something went wrong." });
  }
};

// @description     Download a file
// @route           GET /files/download/:uuid
// @access          Public
export const downloadFiles = async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });

    // If file is not present in database
    if (!file) {
      return res.render("download", { error: "Link has been expired." });
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url)); // The __dirname or __filename global variables are not available in ECMAScript module files.
    const filePath = `${__dirname}/../${file.path}`; // Relative path of download file

    return res.download(filePath);
  } catch (err) {
    return res.render("download", { error: "Something went wrong." });
  }
};

// @description     Send email with download link
// @route           GET /api/files/send
// @access          Public
export const emailFiles = async (req, res) => {
  try {
    // Validate request
    const { uuid, emailTo, emailFrom } = req.body;

    // Check if all the fields are present
    if (!uuid || !emailTo || !emailFrom) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "All the fields are required.",
      });
    }

    // Get data from database
    const file = await File.findOne({ uuid });

    // If sender present it means email already sent
    if (file.sender) {
      return res.status(422).json({
        success: false,
        statusCode: 422,
        message: "Email already sent.",
      });
    }

    // Update sender and receiver
    await File.findByIdAndUpdate(file._id, {
      sender: emailFrom,
      receiver: emailTo,
    });

    // Send email
    sendMail({
      emailFrom: emailFrom,
      emailTo: emailTo,
      subject: "easyShare file sharing",
      text: `${emailFrom} shared a file with you`,
      html: emailTemplate({
        emailFrom: emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
        size: `${parseInt(file.size / 1000)} KB`,
        expires: "24 hours",
        developerName: "Rohit Tewari",
        developerProfileLink: "https://www.linkedin.com/in/rtewari056/",
      }),
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Email successfully sent.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: err.message,
    });
  }
};
