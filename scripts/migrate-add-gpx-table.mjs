import mysql from 'mysql2/promise';

async function migrate() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Creating gpxFiles table...');
  
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gpxFiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uploadedBy INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        state VARCHAR(50),
        fileUrl TEXT NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        fileSize INT,
        distance DECIMAL(10, 2),
        elevationGain INT,
        elevationLoss INT,
        minElevation INT,
        maxElevation INT,
        downloadCount INT DEFAULT 0 NOT NULL,
        viewCount INT DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        INDEX idx_uploadedBy (uploadedBy),
        INDEX idx_location (location),
        INDEX idx_state (state),
        INDEX idx_createdAt (createdAt)
      )
    `);
    console.log('✅ gpxFiles table created successfully!');
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_DB') {
      console.log('ℹ️  gpxFiles table already exists, skipping...');
    } else {
      console.error('❌ Error creating gpxFiles table:', error.message);
      throw error;
    }
  }
  
  await connection.end();
  console.log('\n✅ Migration completed successfully!');
}

migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
