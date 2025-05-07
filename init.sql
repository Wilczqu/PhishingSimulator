-- Create Users table with all required columns
CREATE TABLE IF NOT EXISTS "Users" (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    email VARCHAR(255),
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    department VARCHAR(100),
    "lastLogin" TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "deletedAt" TIMESTAMP WITH TIME ZONE
);

-- Create Quizzes table
CREATE TABLE IF NOT EXISTS "Quizzes" (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questions JSON NOT NULL,
    active BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create QuizResults table
CREATE TABLE IF NOT EXISTS "QuizResults" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    score INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSON,
    "completedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "Users" (id) ON UPDATE CASCADE,
    FOREIGN KEY ("quizId") REFERENCES "Quizzes" (id) ON UPDATE CASCADE
);

-- Create Campaigns table
CREATE TABLE IF NOT EXISTS "Campaigns" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    template TEXT,
    subject VARCHAR(255),
    sender_name VARCHAR(100),
    sender_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "userId" INTEGER,
    FOREIGN KEY ("userId") REFERENCES "Users" (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create Targets table
CREATE TABLE IF NOT EXISTS "Targets" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    department VARCHAR(100),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create campaign_results table
CREATE TABLE IF NOT EXISTS "campaign_results" (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER,
    target_id INTEGER,
    user_id INTEGER,
    unique_token VARCHAR(100) UNIQUE NOT NULL,
    email_sent BOOLEAN DEFAULT false,
    email_opened BOOLEAN DEFAULT false,
    link_clicked BOOLEAN DEFAULT false,
    credentials_submitted BOOLEAN DEFAULT false,
    clicked_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    captured_username VARCHAR(100),
    captured_password VARCHAR(100),
    user_agent VARCHAR(500),
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (campaign_id) REFERENCES "Campaigns" (id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (target_id) REFERENCES "Targets" (id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES "Users" (id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Insert default admin user (password is 'admintud' but stored as a bcrypt hash)
-- Only insert if the user doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Users" WHERE username = 'admintud') THEN
        INSERT INTO "Users" (
            username,
            password,
            role,
            active,
            "createdAt",
            "updatedAt"
        ) VALUES (
            'admintud',
            '$2b$10$xkwmTU0ZiVPqQvVUoQJyJuA9NLysWl.heBHnE1mxJJQTnPyVZzjxa', -- bcrypt hash of 'admintud'
            'admin',
            true,
            NOW(),
            NOW()
        );
    END IF;
END
$$;

-- Insert a sample quiz if none exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "Quizzes" WHERE title = 'Email Quiz') THEN
        INSERT INTO "Quizzes" (
            title,
            description,
            questions,
            active,
            "createdAt",
            "updatedAt"
        ) VALUES (
            'Email Quiz',
            'Test your knowledge about email security and phishing threats',
            '[{"question":"Which of the following is a sign of a phishing email?","options":["Email is from someone you know","Contains urgent requests for personal information","Has a company logo","Is written in proper English"],"correctAnswer":1,"explanation":"Urgent requests for personal information are common in phishing emails to create a sense of urgency."},{"question":"What should you do if you receive a suspicious email?","options":["Click links to investigate","Reply asking for clarification","Delete it immediately","Report it to IT security"],"correctAnswer":3,"explanation":"The best practice is to report suspicious emails to your IT security team."},{"question":"Which email sender is most likely legitimate?","options":["paypal-secure@service.info","accounts@paypal.com","paypal-verification@gmail.com","customer-paypal@verification.net"],"correctAnswer":1,"explanation":"Official emails from companies come from their own domain (paypal.com) not from free email providers."}]',
            true,
            NOW(),
            NOW()
        );
    END IF;
END
$$;