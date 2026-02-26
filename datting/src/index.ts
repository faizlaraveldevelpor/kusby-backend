import path from "path";
import Dotenv from "dotenv";

// 1. Load kubsy/datting/.env
Dotenv.config({});

// 2. Push token save ke liye: agar SUPABASE_SERVICE_ROLE_KEY nahi mili to self-hosted supabase/docker/.env se load karo
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const dockerEnvPath = path.resolve(process.cwd(), "../../supabase/docker/.env");
  Dotenv.config({ path: dockerEnvPath });
  if (process.env.SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;
  }
}

import express from "express";
import cors from "cors";
import actions from "./routes/actions";
import Profiles from "./routes/Profile";
import Chats from "./routes/chat";
import Payments from "./routes/Payments";
import { webhooks } from "./services/payments";

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

app.listen(3001, "0.0.0.0",() => {

  console.log("Server is running on port 3001"); 
})

export default app;
