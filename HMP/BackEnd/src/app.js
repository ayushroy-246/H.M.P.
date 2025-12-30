import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true
}))

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());


import adminRouter from "./routes/admin.routes.js"
import wardenRouter from "./routes/warden.routes.js";
import studentRouter from "./routes/student.routes.js";

app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/warden", wardenRouter);
app.use("/api/v1/student", studentRouter);


export { app };