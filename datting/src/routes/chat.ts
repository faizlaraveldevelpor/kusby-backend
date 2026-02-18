import {Router} from "express";
import { allprofiles } from "../controller/Profiles";
import { handleInteraction } from "../services/actions";
import { getChatsByProfile } from "../services/chats";
 const Chats=Router();
Chats.post("/chats",getChatsByProfile) 

export default Chats