import express, { urlencoded } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToMongoDB } from "./connection.js";
import handleAddMusic from "./routes/addMusic.js";
import handleGetMusic from "./routes/getMusic.js";

const app = express();
app.use(cors())
dotenv.config();

const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use('/addmusic', handleAddMusic);
app.use('/', handleGetMusic);



connectToMongoDB(process.env.MONGO_DB)
    .then(() => {
        console.log("Mongo DB Connected");
    })
    .catch(err => console.log(err));


app.listen(PORT, () => console.log(`App is listening on ${PORT}`));