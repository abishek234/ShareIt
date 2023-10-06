import express from "express";

import { uploadFiles, emailFiles } from "../handlers/fileHandlers.js";

const router = express.Router();

router.post("/", uploadFiles);
router.post("/send", emailFiles);

export default router;
