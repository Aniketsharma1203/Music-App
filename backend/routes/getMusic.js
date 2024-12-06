import express from "express";
import { getMusic, getAudio, getImage } from "../controllers/getMusic.js"
const router = express.Router();

// Endpoint to fetch all songs
router.get("/getmusic", getMusic);

router.get("/getAudio/:audioId", getAudio);

router.get("/getImage/:imageId", getImage);

export default router;