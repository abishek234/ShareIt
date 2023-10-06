import express from "express";

import { downloadFiles } from "../handlers/fileHandlers.js";

const router = express.Router();

router.get("/:uuid", downloadFiles);

export default router;
