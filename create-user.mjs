import bcrypt from 'bcrypt';

const email = 'nicholasmilward@gmail.com';
const password = '01Ni04ck!!';
const name = 'Nicholas Milward';

const passwordHash = await bcrypt.hash(password, 10);

console.log('INSERT INTO users (openId, email, name, loginMethod, passwordHash, role, createdAt, updatedAt, lastSignedIn) VALUES');
console.log(`('email_${email}', '${email}', '${name}', 'email', '${passwordHash}', 'admin', NOW(), NOW(), NOW());`);
