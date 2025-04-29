const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Check for required dependencies
try {
  require('sqlite3');
  require('pg');
} catch (err) {
  console.error('Missing required dependencies. Please run:');
  console.error('npm install sqlite3 pg dotenv');
  process.exit(1);
}

const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

// Get SQLite DB path
const dbPath = path.join(__dirname, 'phishing simulator', 'phishing.db');

// Check if SQLite DB exists
if (!fs.existsSync(dbPath)) {
  console.error(`SQLite database not found at: ${dbPath}`);
  console.error('Please check the path and try again');
  process.exit(1);
}

// SQLite database connection
const sqliteDb = new sqlite3.Database(
  dbPath,
  sqlite3.OPEN_READONLY,
  (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err.message);
      process.exit(1);
    }
    console.log('Connected to SQLite database');
  }
);

// Check for environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`Missing environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file with these variables');
  process.exit(1);
}

// PostgreSQL connection
const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function migrateData() {
  console.log('Starting migration...');
  
  try {
    // Test PostgreSQL connection
    await pgPool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL database');
    
    // 1. Migrate targets
    await migrateTable(
      'Target',
      'SELECT id, name, email, department FROM target',
      'INSERT INTO "Targets" (id, name, email, department, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW())'
    );
    
    // 2. Migrate campaigns
    await migrateTable(
      'Campaign',
      'SELECT id, name, template, subject, sender_name, sender_email, status, scheduled_date FROM campaign',
      'INSERT INTO "Campaigns" (id, name, template, subject, sender_name, sender_email, status, scheduled_date, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())'
    );
    
    // 3. Migrate campaign results
    await migrateTable(
      'CampaignResult',
      `SELECT id, campaign_id, target_id, unique_token, email_sent, email_opened, 
       link_clicked, credentials_submitted, clicked_at, submitted_at, 
       captured_username, captured_password, user_agent, ip_address FROM campaign_result`,
      `INSERT INTO "CampaignResults" 
       (id, campaign_id, target_id, unique_token, email_sent, email_opened, 
       link_clicked, credentials_submitted, clicked_at, submitted_at, 
       captured_username, captured_password, user_agent, ip_address, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())`
    );
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    sqliteDb.close((err) => {
      if (err) {
        console.error('Error closing SQLite connection:', err.message);
      } else {
        console.log('SQLite connection closed');
      }
    });
    
    await pgPool.end();
    console.log('PostgreSQL connection closed');
  }
}

async function migrateTable(tableName, selectSql, insertSql) {
  return new Promise((resolve, reject) => {
    console.log(`Migrating ${tableName}...`);
    
    // First check if table exists in SQLite
    sqliteDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName.toLowerCase()}'`, (err, row) => {
      if (err) {
        return reject(new Error(`Error checking for table ${tableName}: ${err.message}`));
      }
      
      if (!row) {
        console.log(`Table ${tableName} doesn't exist in SQLite database, skipping...`);
        return resolve();
      }
      
      // Table exists, proceed with migration
      sqliteDb.all(selectSql, async (err, rows) => {
        if (err) {
          return reject(new Error(`Error selecting from ${tableName}: ${err.message}`));
        }
        
        if (!rows || rows.length === 0) {
          console.log(`No data found in ${tableName}, skipping...`);
          return resolve();
        }
        
        console.log(`Found ${rows.length} rows in ${tableName}`);
        
        try {
          // Begin transaction
          await pgPool.query('BEGIN');
          
          // Process rows in batches for better performance
          const batchSize = 100;
          for (let i = 0; i < rows.length; i += batchSize) {
            const batch = rows.slice(i, i + batchSize);
            
            // Process each row in the batch
            for (const row of batch) {
              const values = Object.values(row);
              await pgPool.query(insertSql, values);
            }
            
            console.log(`Processed ${Math.min(i + batchSize, rows.length)} of ${rows.length} rows`);
          }
          
          // Reset PostgreSQL sequences
          await pgPool.query(`SELECT setval('"${tableName}s_id_seq"', (SELECT MAX(id) FROM "${tableName}s"), true)`);
          
          // Commit transaction
          await pgPool.query('COMMIT');
          console.log(`${tableName} migration completed`);
          resolve();
          
        } catch (pgError) {
          // Rollback on error
          await pgPool.query('ROLLBACK');
          reject(new Error(`Error migrating ${tableName}: ${pgError.message}`));
        }
      });
    });
  });
}

migrateData();