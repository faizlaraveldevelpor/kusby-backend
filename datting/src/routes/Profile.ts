import { Router } from "express";
import { allprofiles, updateCategory, savePushToken } from "../controller/Profiles";

const Profiles = Router();
Profiles.post("/profiles", allprofiles);
Profiles.patch("/profiles/category", updateCategory);
Profiles.patch("/profiles/push-token", savePushToken);

export default Profiles;