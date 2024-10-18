--
-- File generated with SQLiteStudio v3.4.4 on Fri Oct 18 00:15:44 2024
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: exercises
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id   INT           NOT NULL
                                UNIQUE,
    workout_id    INT           NOT NULL,
    api_id        INT           NOT NULL,
    plan_sets     INT           NOT NULL,
    plan_reps     INT           NOT NULL,
    plan_weight   DECIMAL       NOT NULL,
    rest_time     INT           NOT NULL,
    exercise_name VARCHAR (255) NOT NULL
                                DEFAULT 'Unknown',
    PRIMARY KEY (
        exercise_id
    ),
    FOREIGN KEY (
        workout_id
    )
    REFERENCES workouts (workout_id) ON DELETE CASCADE
);

-- Table: feedback
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT NOT NULL
                    UNIQUE,
    exercise_id INT NOT NULL,
    user_id     INT NOT NULL,
    rating      INT NOT NULL,
    PRIMARY KEY (
        feedback_id
    ),
    FOREIGN KEY (
        exercise_id
    )
    REFERENCES exercises (exercise_id) ON DELETE CASCADE,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id) ON DELETE CASCADE
);

-- Table: user_feedback
CREATE TABLE IF NOT EXISTS user_feedback (
    user_id INT,
    workout_id INT,
    rating INT,
    calories_burned REAL,
    feedback_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (
        user_id,
        workout_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users(user_id),
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
);


-- Table: user_preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id       INT           NOT NULL
                                      UNIQUE,
    user_id             INT           NOT NULL,
    preferred_types     VARCHAR (255),
    preferred_intensity VARCHAR (50),
    preferred_duration  INT,
    preferred_exercise  VARCHAR (255),
    PRIMARY KEY (
        preference_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id) ON DELETE CASCADE
);

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    user_id    INT           NOT NULL
                             UNIQUE,
    fname      VARCHAR (50)  NOT NULL,
    lname      VARCHAR (50)  NOT NULL,
    username   VARCHAR (50)  NOT NULL,
    email      VARCHAR (255) NOT NULL,
    fit_goal   VARCHAR (255) NOT NULL,
    exp_level  VARCHAR (50)  NOT NULL,
    created_at DATETIME      NOT NULL,
    PRIMARY KEY (
        user_id
    )
);

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      7572,
                      'Ursa',
                      'Moses',
                      'Joseph F. Dudley',
                      'vulputate.dui.nec@icloud.ca',
                      'Strength',
                      'Beginner',
                      '2025-01-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      9014,
                      'Nora',
                      'Anthony',
                      'Nadine L. Harrison',
                      'nunc.sed@aol.com',
                      'Endurance',
                      'Advanced',
                      '2024-11-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      2710,
                      'Lucius',
                      'Puckett',
                      'Benedict Y. Meadows',
                      'cras.sed@yahoo.net',
                      'Hypertrophy',
                      'Beginner',
                      '2015-01-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      3601,
                      'Connor',
                      'Hurst',
                      'Chaim D. Guy',
                      'vel.arcu@aol.net',
                      'Strength',
                      'Advanced',
                      '2024-01-09 01:16:10'
                  );

INSERT INTO users (
                      user_id,
                      fname,
                      lname,
                      username,
                      email,
                      fit_goal,
                      exp_level,
                      created_at
                  )
                  VALUES (
                      2624,
                      'Lila',
                      'Jacobson',
                      'Bryar Y. Richards',
                      'egestas.urna@icloud.net',
                      'Endurance',
                      'intermediate',
                      '2020-01-09 01:16:10'
                  );


-- Table: workout_performance
CREATE TABLE IF NOT EXISTS workout_performance (
    perf_id       INT      NOT NULL,
    exercise_id   INT      NOT NULL,
    actual_sets   INT      NOT NULL,
    actual_reps   INT      NOT NULL,
    actual_weight DECIMAL  NOT NULL,
    perf_date     DATETIME NOT NULL,
    PRIMARY KEY (
        perf_id
    ),
    FOREIGN KEY (
        exercise_id
    )
    REFERENCES exercises (exercise_id) ON DELETE CASCADE
);

-- Table: workout_plans
CREATE TABLE IF NOT EXISTS workout_plans (
    plan_id    INT           NOT NULL
                             UNIQUE,
    user_id    INT           NOT NULL,
    start_date DATE          NOT NULL,
    end_date   DATE          NOT NULL,
    active     BOOL          NOT NULL,
    PRIMARY KEY (
        plan_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workouts (
    workout_id       INT          NOT NULL
                                  UNIQUE,
    plan_id          INT          NOT NULL,
    exercise_name    TEXT         NOT NULL,
    intensity        TEXT         NOT NULL,
    duration         INT          NOT NULL,
    PRIMARY KEY (
        workout_id
    ),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans (plan_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS q_values (
    state            TEXT         NOT NULL,
    action           INT          NOT NULL,
    q_value          REAL         NOT NULL,
    PRIMARY KEY (
        state,
        action
    )
);

CREATE TABLE IF NOT EXISTS user_plan_feedback (
    user_id               INT,
    plan_id               INT,
    rating INT, -- User's rating of the plan
    total_calories_burned REAL, -- Total calories burned over the plan
    feedback_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (
        user_id, plan_id
    ),
    FOREIGN KEY (
        user_id
    )
    REFERENCES users(user_id),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans(plan_id)
);

CREATE TABLE IF NOT EXISTS user_plan_history (
    user_id INT,
    plan_id INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (
        user_id
    )
    REFERENCES users(user_id),
    FOREIGN KEY (
        plan_id
    )
    REFERENCES workout_plans(plan_id)
);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
