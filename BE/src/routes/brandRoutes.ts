import { Router } from 'express';
import sql from 'mssql';
import { getPool } from '../config/database';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM brands WHERE status = \'active\' ORDER BY name');
    res.json({ success: true, data: result.recordset });
  } catch (error: any) {
    console.error('❌ Get brands error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;