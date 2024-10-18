"use strict";
const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");

// Route to get all users
router.get("/allusers", controller.getAllUsers);

// Route to get workout plan recommendations using reinforcement learning
router.get("/recommendations", controller.getRecommendedPlans);

// Route to submit feedback for a workout plan
router.post("/feedback", controller.submitPlanFeedback);

module.exports = router;