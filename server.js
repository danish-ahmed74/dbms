/**
 * RedPulse: Blood Bank Management System - Backend Server
 * Technology Stack: Node.js (Express.js), MySQL (XAMPP)
 * Project Team: Atharv Malviya (0827CS241044), Danish Ahmed (0827CS241062)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// MySQL Connection Pool (XAMPP default settings: root with no password)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'redpulse_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper: Calculate 90-day cooldown
function calculateEligibility(lastDonationDate) {
  if (!lastDonationDate) {
    return { isEligible: true, daysRemaining: 0, message: 'Eligible (First time voluntary donor)' };
  }
  const lastDate = new Date(lastDonationDate);
  const now = new Date();
  const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
  if (diffDays >= 90) {
    return { isEligible: true, daysRemaining: 0, message: `Eligible (${diffDays} days since last donation)` };
  } else {
    return { isEligible: false, daysRemaining: 90 - diffDays, message: `In cooldown (${90 - diffDays} days remaining)` };
  }
}

// ==========================================
// API ROUTES
// ==========================================

// 1. GET Blood Inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM BLOOD_INVENTORY ORDER BY blood_group ASC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. PUT Update Blood Inventory Units (Admin)
app.put('/api/inventory/:blood_group', async (req, res) => {
  const { blood_group } = req.params;
  const { available_units } = req.body;
  try {
    await pool.query(
      'UPDATE BLOOD_INVENTORY SET available_units = ? WHERE blood_group = ?',
      [available_units, blood_group]
    );
    res.json({ success: true, message: `Inventory for ${blood_group} updated successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. GET Donors List with 90-day Cooldown verification
app.get('/api/donors', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM DONORS ORDER BY donor_id DESC');
    const enriched = rows.map(d => ({
      ...d,
      eligibility: calculateEligibility(d.last_donation_date)
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. POST Register New Voluntary Donor
app.post('/api/donors', async (req, res) => {
  const { full_name, blood_group, age, gender, contact_no, city, last_donation_date } = req.body;
  if (!full_name || !blood_group || !age || !gender || !contact_no || !city) {
    return res.status(400).json({ success: false, error: 'Missing mandatory fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO DONORS (full_name, blood_group, age, gender, contact_no, city, last_donation_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [full_name, blood_group, age, gender, contact_no, city, last_donation_date || null]
    );
    res.status(201).json({ success: true, donor_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. GET Inbound Requisitions
app.get('/api/requests', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM BLOOD_REQUESTS ORDER BY request_id DESC');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. POST Submit Emergency Requisition
app.post('/api/requests', async (req, res) => {
  const { patient_name, blood_group_needed, units_requested, hospital_name, contact_person, contact_no } = req.body;
  if (!patient_name || !blood_group_needed || !units_requested || !hospital_name || !contact_person || !contact_no) {
    return res.status(400).json({ success: false, error: 'Missing required requisition fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO BLOOD_REQUESTS (patient_name, blood_group_needed, units_requested, hospital_name, contact_person, contact_no, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_name, blood_group_needed, units_requested, hospital_name, contact_person, contact_no, 'Pending']
    );
    res.status(201).json({ success: true, request_id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. PUT Adjudicate Blood Request with ACID Transaction
app.put('/api/requests/:request_id/adjudicate', async (req, res) => {
  const { request_id } = req.params;
  const { action } = req.body; // 'Approve', 'Fulfill', 'Reject'

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [requests] = await conn.query('SELECT * FROM BLOOD_REQUESTS WHERE request_id = ? FOR UPDATE', [request_id]);
    if (requests.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const reqData = requests[0];

    if (action === 'Approve') {
      const [inv] = await conn.query('SELECT * FROM BLOOD_INVENTORY WHERE blood_group = ? FOR UPDATE', [reqData.blood_group_needed]);
      if (inv.length === 0 || inv[0].available_units < reqData.units_requested) {
        await conn.rollback();
        return res.status(400).json({ 
          success: false, 
          error: `Insufficient stock! Available: ${inv[0]?.available_units || 0}, Requested: ${reqData.units_requested}` 
        });
      }

      // Decrement units atomically
      await conn.query('UPDATE BLOOD_INVENTORY SET available_units = available_units - ? WHERE blood_group = ?', [reqData.units_requested, reqData.blood_group_needed]);
      await conn.query('UPDATE BLOOD_REQUESTS SET status = "Approved" WHERE request_id = ?', [request_id]);
    } else if (action === 'Fulfill') {
      await conn.query('UPDATE BLOOD_REQUESTS SET status = "Fulfilled" WHERE request_id = ?', [request_id]);
    } else if (action === 'Reject') {
      await conn.query('UPDATE BLOOD_REQUESTS SET status = "Rejected" WHERE request_id = ?', [request_id]);
    }

    await conn.commit();
    res.json({ success: true, message: `Request #${request_id} processed as ${action}.` });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ success: false, error: error.message });
  } finally {
    conn.release();
  }
});

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`RedPulse Blood Bank Management System Server`);
  console.log(`Running on: http://localhost:${PORT}`);
  console.log(`Team: Atharv Malviya & Danish Ahmed`);
  console.log(`====================================================`);
});
