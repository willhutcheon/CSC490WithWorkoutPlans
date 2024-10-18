"use strict";
const db = require("../models/db-conn");

// Fetch all users
async function getAllUsers() {
    let sql = "SELECT * FROM users;";
    return await db.all(sql);
}

// Fetch user preferences including fitness goals and experience level
async function getUserPreferences(userId) {
    const sql = `
        SELECT fit_goal, exp_level, preferred_types, preferred_intensity, preferred_duration, preferred_exercise
        FROM users
        LEFT JOIN user_preferences ON users.user_id = user_preferences.user_id
        WHERE users.user_id = ?;
    `;
    return await db.get(sql, [userId]);
}

// Fetch active workout plans for the user, including associated workouts and exercises
async function getWorkoutPlans(userId) {
    const sql = `
        SELECT wp.plan_id, wp.start_date, wp.end_date, wp.active, w.*, e.exercise_name 
        FROM workout_plans wp
        JOIN workouts w ON wp.plan_id = w.plan_id
        JOIN exercises e ON w.workout_id = e.workout_id
        WHERE wp.user_id = ? AND wp.active = true;
    `;
    return await db.all(sql, [userId]);
}

// Fetch user feedback for a workout plan
async function getUserPlanFeedback(userId, planId) {
    const sql = `
        SELECT rating, total_calories_burned 
        FROM user_plan_feedback 
        WHERE user_id = ? AND plan_id = ?;
    `;
    return await db.get(sql, [userId, planId]);
}

// Store feedback for a workout plan
async function storeUserPlanFeedback(userId, planId, rating, totalCaloriesBurned) {
    const sql = `
        INSERT INTO user_plan_feedback (user_id, plan_id, rating, total_calories_burned)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (user_id, plan_id) DO UPDATE 
        SET rating = excluded.rating, total_calories_burned = excluded.total_calories_burned;
    `;
    return await db.run(sql, [userId, planId, rating, totalCaloriesBurned]);
}

// Q-table and reinforcement learning logic
let QTable = {};

// Get Q-value for a specific state-action pair
function getQValue(state, action) {
    return QTable[state]?.[action] || 0;
}

// Update Q-value based on feedback
function updateQValue(state, action, reward, nextState) {
    const learningRate = 0.1;
    const discountFactor = 0.9;
    const currentQ = getQValue(state, action);
    const maxFutureQ = Math.max(...Object.values(QTable[nextState] || {}));
    const newQ = currentQ + learningRate * (reward + discountFactor * maxFutureQ - currentQ);
    if (!QTable[state]) QTable[state] = {};
    QTable[state][action] = newQ;
}

// Calculate reward based on user feedback (rating and calories burned)
function calculateReward(feedback) {
    const ratingReward = feedback.rating;
    const performanceReward = feedback.total_calories_burned / 100;
    return ratingReward + performanceReward;
}

// Choose the best workout plan (action) based on current state and Q-values
function chooseAction(state, availablePlans) {
    const epsilon = 0.1; // Exploration-exploitation trade-off
    if (Math.random() < epsilon) {
        // Exploration: choose a random workout plan
        return availablePlans[Math.floor(Math.random() * availablePlans.length)];
    } else {
        // Exploitation: choose the workout plan with the highest Q-value
        return availablePlans.reduce((bestAction, plan) => {
            const qValue = getQValue(state, plan.plan_id);
            return (!bestAction || qValue > getQValue(state, bestAction.plan_id)) ? plan : bestAction;
        }, null);
    }
}

// Recommend workout plans using reinforcement learning
async function recommendWorkoutPlansWithRL(userPreferences, workoutPlans, userId) {
    const state = userPreferences.fit_goal + userPreferences.exp_level; // State representation
    const availablePlans = workoutPlans;

    // Choose a workout plan (action) based on the current state
    const recommendedPlan = chooseAction(state, availablePlans);

    // Get feedback after the plan is completed
    const feedback = await getUserPlanFeedback(userId, recommendedPlan.plan_id);
    const reward = calculateReward(feedback);

    // Update Q-value based on feedback and new state
    const nextState = state; // In this case, the state may remain the same
    updateQValue(state, recommendedPlan.plan_id, reward, nextState);

    return recommendedPlan;
}

module.exports = {
    getAllUsers,
    getUserPreferences,
    getWorkoutPlans,
    getUserPlanFeedback,
    storeUserPlanFeedback,
    recommendWorkoutPlansWithRL
};