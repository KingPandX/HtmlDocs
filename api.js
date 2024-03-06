import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pdfGen from "./pdfEngine.js";
import path from "node:path";
import { cwd } from "node:process";

const app = express();
app.use(bodyParser.text())
/**
 * Configuration options for CORS (Cross-Origin Resource Sharing).
 * @typedef {Object} CorsOptions
 * @property {string} origin - The allowed origin for CORS requests.
 * @property {number} optionsSuccessStatus - The HTTP status code to be returned for successful preflight requests.
 */

/**
 * CORS options for the API.
 * @type {CorsOptions}
 */
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.post("/generate-pdf", async (req, res) => {
    const page = req.body;
    console.log(page)
    try {
        await pdfGen(page);
        console.log("PDF generated successfully");
        res.status(200).sendFile(path.join(cwd(), 'yourDoc.pdf'));
    } catch (error) {
        console.error("Error generating PDF", error);
        res.status(500).send("Error generating PDF");
    }
});

//Test
app.get("/test", (req, res) => {
    res.send("Hello World");
    console.log("Hello World");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});