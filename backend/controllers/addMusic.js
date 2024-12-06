import { getDb } from "../connection.js";
import multer from "multer";
import { Readable } from "stream";
import mongodb from "mongodb";

// Configure Multer Globally
const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fields: 3, fileSize: 6000000, files: 2, parts: 4 }, // Adjusted for 2 files (music and image)
});

export const addMusic = async (req, res) => {
    // Use the global Multer middleware to handle multiple files (track and image)
    upload.fields([{ name: 'track', maxCount: 1 }, { name: 'image', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            console.error("Multer Error:", err);
            return res.status(400).json({ message: "Upload Request Validation Failed", error: err.message });
        }

        // Check if the track file is received
        if (!req.files || !req.files.track) {
            console.error("No track file received");
            return res.status(400).json({ message: "No track uploaded" });
        }

        // Check if the image file is received (optional)
        if (!req.files.image) {
            console.error("No image file received");
            // You can handle this case differently, e.g., allow the music without an image
        }

        // Check if track name is provided
        if (!req.body.name) {
            console.error("No track name in request body");
            return res.status(400).json({ message: "No track name in request body" });
        }

        console.log("Track file received:", req.files.track[0]);
        console.log("Image file received:", req.files.image ? req.files.image[0] : "No image file");
        console.log("Track name:", req.body.name);

        const trackName = req.body.name;
        const trackBuffer = req.files.track[0].buffer;
        const imageBuffer = req.files.image ? req.files.image[0].buffer : null;

        try {
            const db = getDb();

            // Upload the music track to GridFS
            const readableTrackStream = new Readable();
            readableTrackStream.push(trackBuffer);
            readableTrackStream.push(null);

            const trackBucket = new mongodb.GridFSBucket(db, { bucketName: 'tracks' });
            const uploadTrackStream = trackBucket.openUploadStream(trackName);
            const trackId = uploadTrackStream.id;
            readableTrackStream.pipe(uploadTrackStream);

            uploadTrackStream.on('error', () => {
                return res.status(500).json({ message: "Error uploading track" });
            });

            uploadTrackStream.on('finish', () => {
                console.log(`Track uploaded with ID: ${trackId}`);

            
                if (imageBuffer) {
                    const readableImageStream = new Readable();
                    readableImageStream.push(imageBuffer);
                    readableImageStream.push(null);

                    const imageBucket = new mongodb.GridFSBucket(db, { bucketName: 'images' });
                    const uploadImageStream = imageBucket.openUploadStream(`${trackName}-cover`);
                    const imageId = uploadImageStream.id;
                    readableImageStream.pipe(uploadImageStream);

                    uploadImageStream.on('error', () => {
                        return res.status(500).json({ message: "Error uploading image" });
                    });

                    uploadImageStream.on('finish', () => {
                        console.log(`Image uploaded with ID: ${imageId}`);
                        return res.status(201).json({
                            message: `File uploaded successfully: Track ID: ${trackId}, Image ID: ${imageId}`,
                        });
                    });
                } else {
                    // If no image was uploaded, return only the track information
                    return res.status(201).json({
                        message: `Track uploaded successfully, stored under Mongo ObjectID: ${trackId}`,
                    });
                }
            });
        } catch (error) {
            console.error("Error during upload:", error);
            return res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    });
};
