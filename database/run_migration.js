const path = require('path');
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });
const mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'hostelcare_db',
  });

  console.log('Connected to MySQL. Applying migration...');

  // 1. Insert new categories
  await conn.query(`
    INSERT INTO complaint_categories (category_name, description, default_priority)
    SELECT 'Mess', 'Food quality, mess hygiene, drinking water, menu availability and timings', 'HIGH'
    WHERE NOT EXISTS (SELECT 1 FROM complaint_categories WHERE category_name = 'Mess')
  `);
  await conn.query(`
    INSERT INTO complaint_categories (category_name, description, default_priority)
    SELECT 'Sports', 'Sports equipment, facility maintenance, courts and sports area lighting', 'MEDIUM'
    WHERE NOT EXISTS (SELECT 1 FROM complaint_categories WHERE category_name = 'Sports')
  `);
  await conn.query(`
    INSERT INTO complaint_categories (category_name, description, default_priority)
    SELECT 'Network', 'Wi-Fi, internet speed, connectivity, authentication and network coverage', 'HIGH'
    WHERE NOT EXISTS (SELECT 1 FROM complaint_categories WHERE category_name = 'Network')
  `);
  console.log('✓ Categories inserted/verified (Mess, Sports, Network).');

  // 2. Add reported_room_number column if not exists
  const [cols] = await conn.query(`
    SELECT COUNT(*) as cnt FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'complaints' AND COLUMN_NAME = 'reported_room_number'
  `);
  if (cols[0].cnt === 0) {
    await conn.query(`ALTER TABLE complaints ADD COLUMN reported_room_number VARCHAR(20) DEFAULT NULL AFTER room_id`);
    console.log('✓ Column reported_room_number added to complaints table.');
  } else {
    console.log('✓ Column reported_room_number already exists.');
  }

  // 3. Make room_id nullable
  await conn.query(`ALTER TABLE complaints MODIFY COLUMN room_id INT NULL`);
  console.log('✓ Column room_id modified to NULLABLE.');

  // 4. Update view v_complaint_details
  await conn.query(`
    CREATE OR REPLACE VIEW v_complaint_details AS
    SELECT
        c.complaint_id,
        c.title,
        c.description,
        c.priority,
        c.status,
        c.created_at,
        u.full_name AS student_name,
        COALESCE(r.room_number, c.reported_room_number) AS room_number,
        h.hostel_name,
        cc.category_name,
        c.reported_room_number
    FROM complaints c
    JOIN student_profiles sp ON c.student_id = sp.student_id
    JOIN users u ON sp.user_id = u.user_id
    LEFT JOIN rooms r ON c.room_id = r.room_id
    LEFT JOIN hostels h ON r.hostel_id = h.hostel_id
    JOIN complaint_categories cc ON c.category_id = cc.category_id
  `);
  console.log('✓ View v_complaint_details updated with LEFT JOIN.');

  // Verification queries
  const [categories] = await conn.query('SELECT category_id, category_name, default_priority FROM complaint_categories ORDER BY category_id');
  console.log('\nAll Active Categories:');
  console.table(categories);

  const [complaintsStructure] = await conn.query('DESCRIBE complaints');
  console.log('\nComplaints Table Structure (room fields):');
  console.table(complaintsStructure.filter(c => ['room_id', 'reported_room_number'].includes(c.Field)));

  await conn.end();
  console.log('\nMigration 001 executed and verified successfully!');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
