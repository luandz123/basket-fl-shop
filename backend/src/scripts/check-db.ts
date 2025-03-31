import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkDatabaseConnection() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USERNAME || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_DATABASE || 'gio_hoa';

  console.log(`Checking MySQL connection to ${host}:${port}...`);

  try {
    // Try to create a connection
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    // Test query
    const [rows] = await connection.execute('SELECT 1 as result');
    
    console.log('✅ Successfully connected to the database!');
    console.log('Connection details:');
    console.log(`- Host: ${host}`);
    console.log(`- Port: ${port}`);
    console.log(`- User: ${user}`);
    console.log(`- Database: ${database}`);
    
    await connection.end();
    
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:');
    console.error(error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\nPossible solutions:');
      console.log('1. Make sure MySQL server is running');
      console.log(`2. Verify that MySQL is configured to listen on ${host}:${port}`);
      console.log('3. Check if your username and password are correct');
      console.log('4. Ensure that the database exists');
      console.log('\nCommon MySQL default ports:');
      console.log('- MySQL: 3306');
      console.log('- MariaDB: 3306');
      console.log('- XAMPP: 3306');
    }
    
    return false;
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  checkDatabaseConnection()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export { checkDatabaseConnection };
