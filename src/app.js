import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import logger from "./config/logger.js";
import { notFound } from "./middlewares/not-found.middleware.js";


import authRoute from "./routes/auth.route.js";
import userProfileRoute from "./routes/userProfile.route.js";
import returnOrderRoute from "./routes/returnOrder.route.js";
import receiptRoute from "./routes/reciept.route.js"
import trackingRoute from "./routes/tracking.route.js"
import customerRoute from "./routes/customer.route.js"
import privacyRoute from "./routes/privacy.route.js"
import feedbackRoute from "./routes/feedback.route.js";


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
app.use('/api/auth', authRoute);
app.use('/api/customer', userProfileRoute);
app.use('/api/create-return-order', returnOrderRoute);
app.use("/api/receipts", receiptRoute);
app.use("/api/tracking", trackingRoute);
app.use("/api/customer", customerRoute);
app.use("/api/customer", privacyRoute);
app.use("/api/feedback", feedbackRoute);


app.use(notFound);

export default app;