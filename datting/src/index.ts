import express from "express";
import cors from "cors";
import actions from "./routes/actions";
import Profiles from "./routes/Profile";
import Chats from "./routes/chat";
import Payments from "./routes/Payments";
import Dotenv from "dotenv";
import { webhooks } from "./services/payments";

Dotenv.config({});

const app = express();

app.use(cors({ origin: "*", credentials: true }));

// Webhook ko express.json() se PEHLE register karo – Stripe ko raw body chahiye signature ke liye
app.post("/api/v1/webhook", express.raw({ type: "application/json" }), webhooks);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", Profiles);
app.use("/api/v1", actions);
app.use("/api/v1", Chats);
app.use("/api/v1", Payments);
// app.use("/api/profile", profileRoutes); 

app.listen(3000, "0.0.0.0",() => {

  console.log("Server is running on port 3000"); 
})

export default app;
