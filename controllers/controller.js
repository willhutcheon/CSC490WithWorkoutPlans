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
/* async function getRecommendedPlans(req, res, next) {
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
} */

// ADDED, above works
async function getRecommendedPlans(req, res, next) {
    try {
        const userId = parseInt(req.query.user_id, 10);
        if (isNaN(userId)) {
            return res.status(400).send('Invalid User ID');
        }

        const userPreferences = await model.getUserPreferences(userId);
        if (!userPreferences) {
            return res.status(404).send('No preferences found for user.');
        }

        const workoutPlans = await model.getWorkoutPlans(userId);
        if (!workoutPlans || workoutPlans.length === 0) {
            return res.status(404).send('No workout plans available.');
        }

        // Use reinforcement learning to get recommended plan
        const recommendedPlan = await model.recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId);

        res.render("recommendations", {
            title: 'Recommended Workout Plans',
            plans: [recommendedPlan],  // Pass the recommended plan to the template
            user: { user_id: userId }
        });
    } catch (error) {
        next(error);
    }
}


// ADDED
/* async function getRecommendedPlans(req, res) {
    const userId = req.query.user_id;  // Fetching user_id from the query

    // Parse userId to an integer and check if it's valid
    const parsedUserId = parseInt(userId, 10);

    console.log("Parsed User ID:", parsedUserId, "Type:", typeof parsedUserId);

    if (isNaN(parsedUserId)) {
        return res.status(400).send('Invalid User ID');
    }

    try {
        const plans = await model.getUserWorkoutPlans(parsedUserId);  // Pass the parsed userId

        // Structure the data to have workouts grouped by plan
        const structuredPlans = plans.reduce((acc, plan) => {
            const { plan_id, start_date, end_date, active, workout_id, exercise_name, intensity, duration } = plan;

            let planData = acc.find(p => p.plan_id === plan_id);
            if (!planData) {
                planData = {
                    plan_id,
                    start_date,
                    end_date,
                    active,
                    workouts: []
                };
                acc.push(planData);
            }

            if (workout_id) {
                planData.workouts.push({
                    workout_id,
                    exercise_name,
                    intensity,
                    duration
                });
            }

            return acc;
        }, []);

        res.render('recommendations', { title: 'Workout Recommendations', plans: structuredPlans });
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        res.status(500).send('Internal Server Error');
    }
} */

/* async function submitPlanFeedback(req, res, next) {
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;
        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);
        res.send({ success: true });
    } catch (error) {
        next(error);
    }
} */

// ADDED, above works
async function submitPlanFeedback(req, res, next) {
    try {
        const { userId, planId, rating, totalCaloriesBurned } = req.body;

        // Store the feedback in the database
        await model.storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned);

        // Calculate reward based on feedback
        const feedback = { rating, totalCaloriesBurned };
        const reward = model.calculateReward(feedback);

        // Update Q-value with feedback
        const state = await model.getUserPreferences(userId); // Assume state is based on user preferences
        model.updateQValue(state, planId, reward, state);

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