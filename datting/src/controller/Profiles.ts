import { Request, Response } from "express";
import { getprofiles } from "../services/Profile";

export const allprofiles=async(req:Request,res:Response)=>{
    const userId = req.headers.authorization;

if (!userId) {
      return res.status(400).json({ error: "Authorization header missing" });
    }
    getprofiles(req,res,userId as string);
}