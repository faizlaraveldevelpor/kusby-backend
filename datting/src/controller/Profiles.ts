import { Request, Response } from "express";
import { getprofiles, updateProfileCategory } from "../services/Profile";

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