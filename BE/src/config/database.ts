import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '412005',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'da3chdl',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  connectionTimeout: 30000,
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

pool.on('error', (err) => {
  console.error('❌ SQL Pool Error:', err);
});

export default poolConnect;