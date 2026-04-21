import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';

// ✅ Ép dotenv đọc file .env tại thư mục gốc dự án
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log kiểm tra (giữ lại để debug)
console.log('🔍 DB Config Check:', {
  user: process.env.DB_USER,
  hasPassword: !!process.env.DB_PASSWORD, // Ẩn password thật khi log
  server: process.env.DB_SERVER
});

const config: sql.config = {
  // ✅ Dùng fallback giá trị mặc định nếu env vẫn undefined
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '412005',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'da3chdl',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: false, // Local thì để false
    trustServerCertificate: true, // Bắt buộc true cho local
  },
  connectionTimeout: 30000,
};

const pool = new sql.ConnectionPool(config);
// ✅ Bắt buộc await kết nối để biết lỗi ngay khi khởi động
const poolConnect = pool.connect();

pool.on('error', (err) => console.error('❌ SQL Pool Error:', err));

export default poolConnect;