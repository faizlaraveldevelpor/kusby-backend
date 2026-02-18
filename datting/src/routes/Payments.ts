import {Router} from "express";
import express from 'express'
import { allprofiles } from "../controller/Profiles";
import { handleInteraction } from "../services/actions";
import { payments, webhooks } from "../services/payments";
 const Payments=Router();
Payments.post("/webhook",express.raw({ type: 'application/json' }),webhooks) 
Payments.post("/create-payment-intent",payments) 

export default Payments