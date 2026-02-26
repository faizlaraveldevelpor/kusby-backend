import { Request, Response } from "express";
import { getprofiles, updateProfileCategory, updateExpoPushToken } from "../services/Profile";

export const allprofiles = async (req: Request, res: Response) => {
  const userId = req.headers.authorization;
  if (!userId) {
    return res.status(400).json({ error: "Authorization header missing" });
  }
  getprofiles(req, res, userId as string);
};

export const updateCategory = async (req: Request, res: Response) => {
  const userId = req.headers.authorization;
  if (!userId) {
    return res.status(400).json({ error: "Authorization header missing" });
  }
  const { cetagory } = req.body;
  if (cetagory == null || cetagory === "") {
    return res.status(400).json({ error: "cetagory is required" });
  }
  try {
    const profile = await updateProfileCategory(userId.trim(), String(cetagory));
    return res.status(200).json({ success: true, profile });
  } catch (err: any) {
    console.error("Update category error:", err);
    return res.status(500).json({ error: err?.message || "Failed to update category" });
  }
};

/** Expo push token save – backend se DB update (RLS bypass via service role) */
export const savePushToken = async (req: Request, res: Response) => {
  console.log(req);
  
  const userId = (req.headers.authorization || "").toString().trim();
  if (!userId) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const { expo_push_token } = req.body || {};
  const tokenStr = expo_push_token != null ? String(expo_push_token).trim() : null;
  console.log("[Push] savePushToken: userId length=" + userId.length + ", token=" + (tokenStr ? tokenStr.substring(0, 30) + "..." : "null"));
  try {
    await updateExpoPushToken(userId, tokenStr || null);
    console.log("[Push] savePushToken: OK for user " + userId.substring(0, 8) + "...");
    return res.status(200).json({ success: true });
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error("[Push] savePushToken error:", msg);
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY not set")) {
      return res.status(503).json({ error: "Server config: SUPABASE_SERVICE_ROLE_KEY not set. Push token not saved." });
    }
    return res.status(500).json({ error: msg || "Failed to save push token" });
  }
};