require('dotenv').config();
const { query } = require('./src/config/db');

async function seedSkeletons() {
  const subjects = [
    { name: 'Chemistry', exam_type: 'BOTH' },
    { name: 'Biology', exam_type: 'NEET' },
    { name: 'Mathematics', exam_type: 'JEE' }
  ];

  try {
    for (const sub of subjects) {
      console.log(`Seeding ${sub.name}...`);
      await query(
        `INSERT INTO subjects (name, exam_type) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [sub.name, sub.exam_type]
      );
    }
    console.log('Skeleton subjects seeded successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

seedSkeletons();
