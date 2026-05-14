import sql, { ConnectionPool } from 'mssql';

// Fallback mật khẩu khớp với test-sql.js đã chạy thành công
const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '412005', 
  server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
  database: process.env.DB_NAME || 'da3chdl',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

let pool: ConnectionPool | null = null;

export const connectDB = async (): Promise<ConnectionPool> => {
  try {
    console.log('🔍 Connecting with:', {
      server: config.server,
      user: config.user,
      password: config.password ? `***${config.password.slice(-3)}` : 'UNDEFINED',
      database: config.database
    });

    if (!pool || !pool.connected) {
      pool = await sql.connect(config);
      console.log('✅ Database connected successfully');
    }
    return pool;
  } catch (error: any) {
    console.error('❌ DB Error:', error.message);
    throw error;
  }
};

export const getPool = async (): Promise<ConnectionPool> => {
  if (!pool || !pool.connected) return await connectDB();
  return pool;
};

export default getPool;