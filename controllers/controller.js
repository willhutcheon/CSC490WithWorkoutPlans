"use strict";

const express = require("express");
const app = express();
const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const model = require("../models/model");

async function getAllUsers(req, res, next) {
    try {
        let users = await model.getAllUsers();
        res.render("users-all", { users: users, title: 'All Users', user: req.user });
    } catch (error) {
        next(error);
    }
}

// Reinforcement Learning for recommending workout plans
async function getRecommendedPlans(req, res, next) {
    try {
        const userId = parseInt(req.query.user_id, 10);
        if (isNaN(userId)) {
            throw new Error('Invalid User ID');
        }
        const userPreferences = await model.getUserPreferences(userId);
        if (!userPreferences) {
            throw new Error('No preferences found for user.');
        }
        const workoutPlans = await model.getWorkoutPlans(userId);
        if (!workoutPlans || workoutPlans.length === 0) {
            throw new Error('No workout plans available.');
        }

        const recommendedPlan = await model.recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId);
        res.render("recommended-plans", {
            plans: [recommendedPlan],
            title: 'Recommended Workout Plans',
            user: { user_id: userId }
        });
    } catch (error) {
        next(error);
    }
}

async function submitPlanFeedback(req, res, next) {
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;
        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);
        res.send({ success: true });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllUsers,
    getRecommendedPlans,
    submitPlanFeedback
};