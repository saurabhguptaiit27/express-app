import express from "express";
import path from "path";
import { fileURLToPath } from 'url';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Set up a route for SSE
app.get("/sse", (req, res) => {
    // Set headers for Server-Sent Events
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send initial response
    res.write("data: This is express app\n\n");

    // Send updates every 3 seconds
    const intervalId = setInterval(() => {
        res.write("data: This is express app " + Date.now() + "\n\n");
    }, 3000);

    // Clean up on client disconnect
    req.on("close", () => {
        clearInterval(intervalId);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const server = app.listen(PORT, () => {
    console.log("App is listening at port: " + PORT);
});



// Custom control interface endpoints
app.get("/control/stop", (req, res) => {
    server.close(() => {
        console.log('Server has been gracefully closed.');
        process.exit(0);
    });
    res.send("Server stopped successfully!");

});


// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully...');
    // Close the server
    server.close(() => {
        console.log('Server has been gracefully closed.');
        process.exit(0);
    });
});



