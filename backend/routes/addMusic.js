import express from "express";
import { addMusic } from "../controllers/addMusic.js";

const router = express.Router();

router.post("/", addMusic);


export default router;