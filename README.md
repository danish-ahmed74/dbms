# RedPulse - Blood Bank Management System

**A Relational Web Application for Real-Time Blood Inventory, Donor Registry and Emergency Request Management**

- **Domain:** Database Management Systems (Relational Web Application)
- **Team Name:** RedPulse
- **Team Members:**
  - **Atharv Malviya** (Roll No. `0827CS241044`)
  - **Danish Ahmed** (Roll No. `0827CS241062`)
- **Technology Stack:** HTML5, CSS3, JavaScript, Bootstrap 5, Node.js (Express.js), MySQL (XAMPP)

---

## 🌟 Overview & Key Modules

### A. Public & Donor/Recipient Module
1. **Donor Onboarding & 90-Day Cooldown Registry:**
   - Digital registration capturing donor demographics (full name, blood group, age [18-65], gender, contact number, city, last donation date).
   - **Automated 90-Day Physiological Cooldown Calculator:** dynamically verifies whether the donor is eligible to donate today or shows exact days remaining.
2. **Real-Time Inventory Availability Lookup:**
   - Public inquiry panel displaying current blood unit reserves across all 8 standard blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
   - Categorized stock thresholds (`Optimal Supply`, `Moderate Stock`, `Critical Shortage`).
   - Interactive **Blood Compatibility Calculator** (Universal Donor `O-`, Universal Recipient `AB+`).
3. **Emergency Blood Request Portal:**
   - Intake portal for hospitals and patient representatives detailing unit requirements, patient name, hospital, priority level, and clinical urgency.
   - Dynamic inventory check notifies the user if current stock is sufficient.
4. **Requisition Status Tracker:**
   - Look up real-time status of submitted requests via Request ID or patient name.

### B. Administrative & Inventory Module
1. **Stock Management Console:**
   - Modify unit reserves based on fresh donation batches, screening tests, and expirations (+/- unit controls with instant updates).
2. **Requisition Adjudication Pipeline:**
   - Review inbound clinical requisitions.
   - **Atomic Stock Deduction:** Approving a request validates stock availability, deducts units atomically from inventory, and updates the requisition status to `Approved` or `Fulfilled`.
3. **Donor Eligibility & Donation Logging:**
   - One-click "Log Donation" automatically sets `last_donation_date` to today, recalculates cooldown, and increments the corresponding blood group inventory by +1 unit.
4. **Relational Schema & Data Dictionary View:**
   - Complete view of the database schema (`DONORS`, `BLOOD_INVENTORY`, `BLOOD_REQUESTS`, `ADMINISTRATORS`), functional dependencies, and copyable SQL script.

---

## 🚀 How to Run the Website

### Option 1: Instant Browser Launch (Zero Installation Required)
The web application is fully client-side functional with an embedded relational state engine and persistent `localStorage` database pre-seeded with sample data.

1. Double-click or open [index.html](file:///c:/Users/ahmed/Desktop/test/index.html) in any modern browser (Chrome, Edge, Firefox, Brave, Safari).
2. The site works immediately offline or online without needing a web server or database setup!

### Option 2: Full-Stack Mode with Node.js & MySQL (XAMPP)
If you wish to run the project using the Express.js backend and MySQL database:

1. **Start MySQL in XAMPP:**
   - Open XAMPP Control Panel and start **Apache** and **MySQL**.
   - Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
   - Import or run the contents of [database.sql](file:///c:/Users/ahmed/Desktop/test/database.sql) to create `redpulse_db` with all tables and seed records.

2. **Run Node.js Server:**
   ```bash
   npm install
   node server.js
   ```
3. Open `http://localhost:3000` in your web browser.

---

## 🗄️ Relational Database Schema & Data Dictionary

| Table | Primary Key | Key Attributes / Foreign Keys | Description |
|---|---|---|---|
| `DONORS` | `donor_id` (PK) | `full_name`, `blood_group`, `age`, `gender`, `contact_no`, `city`, `last_donation_date` | Registered donor demographics and historical donation date for 90-day cooldown calculation |
| `BLOOD_INVENTORY` | `inventory_id` (PK) | `blood_group` (Unique), `available_units`, `last_updated` | Ledger tracking available units for the 8 standard blood groups |
| `BLOOD_REQUESTS` | `request_id` (PK) | `patient_name`, `blood_group_needed`, `units_requested`, `hospital_name`, `contact_person`, `contact_no`, `status` | Inbound clinical blood requests from hospitals |
| `ADMINISTRATORS` | `admin_id` (PK) | `username` (Unique), `password_hash` | Admin authentication credentials |

---

## 👥 Project Team
- **Atharv Malviya** (Roll No. `0827CS241044`)
- **Danish Ahmed** (Roll No. `0827CS241062`)
- **Institution:** Computer Science & Engineering Department
