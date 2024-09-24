import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const poolPromise: Promise<sql.ConnectionPool> = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => {
    console.log('Database Connection Failed! Bad Config: ', err)
    throw err;
  });

export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    const pool = await poolPromise;
    if (!pool) {
      throw new Error('Failed to connect to the database');
    }
    const request = pool.request();
    
    params.forEach((param, index) => {
      request.input(`p${index + 1}`, param);
    });
    
    const result = await request.query(query);
    return result.recordset;
  } catch (error) {
    console.error('SQL query execution error:', error);
    throw error;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const pool = await poolPromise;
    if (!pool) {
      throw new Error('Failed to connect to the database');
    }
    console.log("Successfully connected to the database");
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}