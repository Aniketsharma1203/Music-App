import { getDb } from "../connection.js";
import { ObjectId } from "mongodb";
import mongodb from "mongodb";

// Fetch all songs with metadata
export const getMusic = async (req, res) => {
    try {
        const db = getDb();
        const trackFiles = db.collection('tracks.files'); // Tracks metadata
        const imageFiles = db.collection('images.files'); // Images metadata

        // Get all tracks and their corresponding images
        const tracks = await trackFiles.find().toArray();

        // Map through tracks to combine metadata with image data
        const songs = await Promise.all(tracks.map(async (track) => {
            const image = await imageFiles.findOne({
                filename: `${track.filename.split('.')[0]}-cover` // Assuming the image filename matches
            });

            return {
                name: track.filename.split('.')[0], // Extract name from filename
                audioUrl: `/getAudio/${track._id}`, // Endpoint to fetch audio
                imageUrl: image ? `/getImage/${image._id}` : null, // Endpoint to fetch image
            };
        }));

        res.status(200).json(songs);
    } catch (err) {
        console.error("Error fetching songs:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// Serve audio files
export const getAudio = async (req, res) => {
    try {
        const trackID = new ObjectId(req.params.audioId); // Audio ID from the URL
        const db = getDb();
        const trackBucket = new mongodb.GridFSBucket(db, { bucketName: 'tracks' });

        res.setHeader('Content-Type', 'audio/mp3');
        const downloadStream = trackBucket.openDownloadStream(trackID);
        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error("Error downloading audio:", err);
            res.status(404).send("Audio not found");
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ message: "Invalid audio ID" });
    }
};

// Serve image files
export const getImage = async (req, res) => {
    try {
        const imageID = new ObjectId(req.params.imageId); // Image ID from the URL
        const db = getDb();
        const imageBucket = new mongodb.GridFSBucket(db, { bucketName: 'images' });

        res.setHeader('Content-Type', 'image/jpeg');
        const downloadStream = imageBucket.openDownloadStream(imageID);
        downloadStream.pipe(res);

        downloadStream.on('error', (err) => {
            console.error("Error downloading image:", err);
            res.status(404).send("Image not found");
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ message: "Invalid image ID" });
    }
};
