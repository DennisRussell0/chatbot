import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import messagesRouter from "./routes/messages.js";

const app = express();
app.use(express.json());

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve client
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "../client")));

// Routes
app.use("/messages", messagesRouter);

const PORT = 3000;
try {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
} catch (err) {
  console.error("Failed to start server:", err);
}
