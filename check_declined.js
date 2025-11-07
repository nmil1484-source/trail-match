import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

console.log('Checking tripParticipants table for declined requests...\n');

const [rows] = await connection.execute(`
  SELECT 
    tp.id,
    tp.userId,
    tp.tripId,
    tp.status,
    tp.denialReason,
    tp.message,
    tp.createdAt,
    u.email as userEmail,
    t.title as tripTitle
  FROM tripParticipants tp
  LEFT JOIN users u ON tp.userId = u.id
  LEFT JOIN trips t ON tp.tripId = t.id
  WHERE tp.status = 'declined'
  ORDER BY tp.createdAt DESC
  LIMIT 10
`);

console.log('Declined requests:', JSON.stringify(rows, null, 2));

await connection.end();
