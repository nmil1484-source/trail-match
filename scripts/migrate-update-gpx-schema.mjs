import mysql from 'mysql2/promise';

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Updating gpxFiles table schema...');
  
  try {
    // Drop fileUrl and fileSize columns
    try {
      await connection.query(`ALTER TABLE gpxFiles DROP COLUMN fileUrl`);
      console.log('✅ Dropped fileUrl column');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  fileUrl column doesn\'t exist, skipping...');
      } else {
        throw error;
      }
    }
    
    try {
      await connection.query(`ALTER TABLE gpxFiles DROP COLUMN fileSize`);
      console.log('✅ Dropped fileSize column');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('ℹ️  fileSize column doesn\'t exist, skipping...');
      } else {
        throw error;
      }
    }
    
    // Add fileData column
    try {
      await connection.query(`ALTER TABLE gpxFiles ADD COLUMN fileData LONGTEXT NOT NULL AFTER state`);
      console.log('✅ Added fileData column');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️  fileData column already exists, skipping...');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Error updating gpxFiles table:', error.message);
    throw error;
  }
  
  await connection.end();
  console.log('\n✅ Migration completed successfully!');
}

migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
