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
  const userId = (req.headers.authorization || "").toString().trim();
  if (!userId) {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  const { expo_push_token } = req.body || {};
  try {
    await updateExpoPushToken(userId, expo_push_token ?? null);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Save push token error:", err?.message || err);
    return res.status(500).json({ error: err?.message || "Failed to save push token" });
  }
};