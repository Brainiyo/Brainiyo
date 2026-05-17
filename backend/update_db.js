const { query } = require('./src/config/db');

async function update() {
  try {
    await query("UPDATE subjects SET exam_type = 'BOTH'");
    console.log("Subjects updated successfully.");
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
update();
