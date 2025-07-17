import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import { notFound } from "./middlewares/not-found.middleware.js";


import authRoute from "./routes/auth.route.js";
import userProfileRoute from "./routes/userProfile.route.js";

const app = express();

connectDB();
app.use(cors());
app.use(express.json());
app.use(logger);
app.use(cookieParser());


app.get('/', (req, res) => {
    res.send('Hello World 🌍');
});


// Mounting the routes
app.use('/api/auth',authRoute)
app.use('/api/user', userProfileRoute);




app.use(notFound)

export default app;