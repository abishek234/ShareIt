import express from "express";

import { getFiles } from "../handlers/fileHandlers.js";

const router = express.Router();

router.get("/:uuid", getFiles);

export default router;
