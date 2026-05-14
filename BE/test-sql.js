const sql = require('mssql');

const config = {
  user: 'sa',
  password: '412005',
  server: 'localhost\\SQLEXPRESS', // Hoặc thử '127.0.0.1\\SQLEXPRESS'
  database: 'da3chdl',
  options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(config)
  .then(() => {
    console.log('✅ KẾT NỐI THÀNH CÔNG! SQL Server đã sẵn sàng cho Node.js');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ LỖI KẾT NỐI:', err.message);
    console.log('👉 SQL Server đang chặn đăng nhập bằng sa. Làm tiếp Bước 2.');
    process.exit(1);
  });