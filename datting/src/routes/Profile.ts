import { Router } from "express";
import { allprofiles, updateCategory } from "../controller/Profiles";

const Profiles = Router();
Profiles.post("/profiles", allprofiles);
Profiles.patch("/profiles/category", updateCategory);

export default Profiles;