import {Router} from "express";
import { allprofiles } from "../controller/Profiles";
import { handleInteraction } from "../services/actions";
 const Profiles=Router();
Profiles.post("/profiles",allprofiles) 

export default Profiles