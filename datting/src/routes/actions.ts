import { Router } from "express";
import { getPeopleWhoLikedMe, handleInteraction } from "../services/actions";

 const actions = Router(); // ✅ Router use karo

actions.post("/createaction", handleInteraction);
actions.post("/wholike", getPeopleWhoLikedMe);

export default actions
