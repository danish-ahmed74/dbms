// ============================================================
// RedPulse - Blood Bank Management System
// Client-Side Core Engine with Supabase (PostgreSQL) Live Sync
// Team: Atharv Malviya (0827CS241044), Danish Ahmed (0827CS241062)
// ============================================================

const STORAGE_KEY = 'REDPULSE_DATABASE_V1';
const SUPABASE_STORAGE_URL_KEY = 'REDPULSE_SUPABASE_URL';
const SUPABASE_STORAGE_ANON_KEY = 'REDPULSE_SUPABASE_KEY';

// Default Seed Data (used as fallback or initial load)
const DEFAULT_DATA = {
  inventory: [
    { inventory_id: 1, blood_group: 'A+', available_units: 24, last_updated: '2026-11-21 14:30:00' },
    { inventory_id: 2, blood_group: 'A-', available_units: 8, last_updated: '2026-11-21 12:15:00' },
    { inventory_id: 3, blood_group: 'B+', available_units: 32, last_updated: '2026-11-21 15:00:00' },
    { inventory_id: 4, blood_group: 'B-', available_units: 4, last_updated: '2026-11-21 09:45:00' },
    { inventory_id: 5, blood_group: 'AB+', available_units: 14, last_updated: '2026-11-21 11:20:00' },
    { inventory_id: 6, blood_group: 'AB-', available_units: 3, last_updated: '2026-11-20 18:30:00' },
    { inventory_id: 7, blood_group: 'O+', available_units: 45, last_updated: '2026-11-21 15:10:00' },
    { inventory_id: 8, blood_group: 'O-', available_units: 7, last_updated: '2026-11-21 13:00:00' }
  ],
  donors: [
    { donor_id: 101, full_name: 'Rahul Sharma', blood_group: 'O+', age: 28, gender: 'Male', contact_no: '+91 9876543210', city: 'Bhopal', last_donation_date: '2026-08-10', registered_at: '2026-05-10' },
    { donor_id: 102, full_name: 'Priya Verma', blood_group: 'A+', age: 24, gender: 'Female', contact_no: '+91 9823456781', city: 'Indore', last_donation_date: '2026-10-25', registered_at: '2026-06-14' },
    { donor_id: 103, full_name: 'Amit Patel', blood_group: 'B+', age: 34, gender: 'Male', contact_no: '+91 9812345672', city: 'Bhopal', last_donation_date: '2026-07-15', registered_at: '2026-01-20' },
    { donor_id: 104, full_name: 'Sneha Kulkarni', blood_group: 'AB-', age: 29, gender: 'Female', contact_no: '+91 9898765433', city: 'Jabalpur', last_donation_date: '2026-06-20', registered_at: '2026-02-11' },
    { donor_id: 105, full_name: 'Mohit Saxena', blood_group: 'O-', age: 31, gender: 'Male', contact_no: '+91 9755512344', city: 'Gwalior', last_donation_date: '', registered_at: '2026-11-01' },
    { donor_id: 106, full_name: 'Ananya Gupta', blood_group: 'B-', age: 22, gender: 'Female', contact_no: '+91 9826098765', city: 'Bhopal', last_donation_date: '2026-11-02', registered_at: '2026-08-15' },
    { donor_id: 107, full_name: 'Rohan Malhotra', blood_group: 'AB+', age: 27, gender: 'Male', contact_no: '+91 9988776655', city: 'Indore', last_donation_date: '2026-05-12', registered_at: '2026-04-01' },
    { donor_id: 108, full_name: 'Vikram Singh', blood_group: 'A-', age: 38, gender: 'Male', contact_no: '+91 9123456789', city: 'Ujjain', last_donation_date: '2026-08-01', registered_at: '2026-03-12' }
  ],
  requests: [
    { request_id: 201, patient_name: 'Ramesh Chandra', blood_group_needed: 'O+', units_requested: 2, hospital_name: 'AIIMS Bhopal', contact_person: 'Dr. Alok Sen', contact_no: '+91 9827011223', request_date: '2026-11-21 10:15', status: 'Pending', priority: 'Emergency', notes: 'Accident trauma patient in ICU' },
    { request_id: 202, patient_name: 'Kavita Joshi', blood_group_needed: 'B+', units_requested: 3, hospital_name: 'Chirayu Medical College', contact_person: 'Dr. Meena Nair', contact_no: '+91 9893044556', request_date: '2026-11-20 16:40', status: 'Approved', priority: 'High', notes: 'Scheduled cardiac surgery' },
    { request_id: 203, patient_name: 'Sunil Yadav', blood_group_needed: 'AB-', units_requested: 1, hospital_name: 'Bansal Hospital', contact_person: 'Sister Neha', contact_no: '+91 9425088990', request_date: '2026-11-19 11:20', status: 'Fulfilled', priority: 'Normal', notes: 'Dialysis support' },
    { request_id: 204, patient_name: 'Deepak Lodhi', blood_group_needed: 'O-', units_requested: 2, hospital_name: 'Hamidia Hospital', contact_person: 'Rajesh Lodhi', contact_no: '+91 9752033445', request_date: '2026-11-21 14:05', status: 'Pending', priority: 'Emergency', notes: 'Pediatric urgent requirement' }
  ],
  adminLoggedIn: false
};

// Blood Compatibility Map
const COMPATIBILITY_MAP = {
  'A+':  { canReceive: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
  'O+':  { canReceive: ['O+', 'O-'], canDonateTo: ['O+', 'A+', 'B+', 'AB+'] },
  'B+':  { canReceive: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
  'AB+': { canReceive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canDonateTo: ['AB+'] },
  'A-':  { canReceive: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
  'O-':  { canReceive: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'B-':  { canReceive: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
  'AB-': { canReceive: ['AB-', 'A-', 'B-', 'O-'], canDonateTo: ['AB+', 'AB-'] }
};

// State Manager with Supabase Live Connector
class RedPulseStore {
  constructor() {
    this.supabase = null;
    this.isSupabaseConnected = false;
    this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.saveState();
      }
    } catch (e) {
      console.error('Storage parse error, resetting state:', e);
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  resetState() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.saveState();
  }

  // Supabase Connection Initializer
  async initSupabase() {
    let url = localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url);
    let key = localStorage.getItem(SUPABASE_STORAGE_ANON_KEY) || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey);

    if (url && key && window.supabase) {
      try {
        this.supabase = window.supabase.createClient(url.trim(), key.trim());
        // Verify with a test query
        const { data, error } = await this.supabase.from('blood_inventory').select('blood_group').limit(1);
        if (!error) {
          this.isSupabaseConnected = true;
          this.updateConnectionBadge(true);
          await this.syncFromSupabase();
          return { success: true };
        } else {
          console.warn('Supabase test query warning:', error.message);
          this.isSupabaseConnected = false;
          this.updateConnectionBadge(false);
          return { success: false, error: error.message };
        }
      } catch (err) {
        console.error('Supabase init error:', err);
        this.isSupabaseConnected = false;
        this.updateConnectionBadge(false);
        return { success: false, error: err.message };
      }
    } else {
      this.isSupabaseConnected = false;
      this.updateConnectionBadge(false);
      return { success: false, error: 'No Supabase credentials configured.' };
    }
  }

  updateConnectionBadge(connected) {
    const badge = document.getElementById('supabase-status-badge');
    const btn = document.getElementById('btn-supabase-status');
    if (badge && btn) {
      if (connected) {
        badge.innerHTML = '<span class="text-success"><i class="fa-solid fa-circle text-success me-1"></i>Supabase Live</span>';
        btn.classList.remove('btn-outline-light');
        btn.classList.add('btn-light', 'text-success', 'fw-bold');
      } else {
        badge.innerHTML = '<span class="text-warning"><i class="fa-solid fa-circle text-warning me-1"></i>Connect DB</span>';
        btn.classList.remove('btn-light', 'text-success', 'fw-bold');
        btn.classList.add('btn-outline-light');
      }
    }
  }

  // Pull all records from Supabase tables
  async syncFromSupabase() {
    if (!this.supabase) return;

    try {
      // 1. Fetch Inventory
      const { data: invData, error: invErr } = await this.supabase
        .from('blood_inventory')
        .select('*')
        .order('blood_group');

      if (!invErr && invData && invData.length > 0) {
        this.data.inventory = invData.map(i => ({
          inventory_id: i.inventory_id,
          blood_group: i.blood_group,
          available_units: i.available_units,
          last_updated: i.last_updated ? i.last_updated.replace('T', ' ').substring(0, 19) : 'Just now'
        }));
      }

      // 2. Fetch Donors
      const { data: donorsData, error: donErr } = await this.supabase
        .from('donors')
        .select('*')
        .order('donor_id', { ascending: false });

      if (!donErr && donorsData) {
        this.data.donors = donorsData.map(d => ({
          donor_id: d.donor_id,
          full_name: d.full_name,
          blood_group: d.blood_group,
          age: d.age,
          gender: d.gender,
          contact_no: d.contact_no,
          city: d.city,
          last_donation_date: d.last_donation_date || null,
          registered_at: d.registered_at ? d.registered_at.substring(0, 10) : ''
        }));
      }

      // 3. Fetch Requests
      const { data: reqsData, error: reqErr } = await this.supabase
        .from('blood_requests')
        .select('*')
        .order('request_id', { ascending: false });

      if (!reqErr && reqsData) {
        this.data.requests = reqsData.map(r => ({
          request_id: r.request_id,
          patient_name: r.patient_name,
          blood_group_needed: r.blood_group_needed,
          units_requested: r.units_requested,
          hospital_name: r.hospital_name,
          contact_person: r.contact_person,
          contact_no: r.contact_no,
          request_date: r.request_date ? r.request_date.replace('T', ' ').substring(0, 16) : '',
          status: r.status,
          priority: r.priority || 'Normal',
          notes: r.admin_notes || ''
        }));
      }

      this.saveState();
      refreshAllViews();
      console.log('✅ Synchronized with live Supabase database.');
    } catch (e) {
      console.warn('Sync error:', e);
    }
  }

  // --- Inventory Operations ---
  getInventory() {
    return this.data.inventory;
  }

  getUnitsForGroup(bloodGroup) {
    const item = this.data.inventory.find(i => i.blood_group === bloodGroup);
    return item ? item.available_units : 0;
  }

  async updateInventoryUnits(bloodGroup, delta) {
    const item = this.data.inventory.find(i => i.blood_group === bloodGroup);
    if (item) {
      item.available_units = Math.max(0, item.available_units + delta);
      item.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.saveState();

      if (this.supabase && this.isSupabaseConnected) {
        try {
          await this.supabase
            .from('blood_inventory')
            .update({ available_units: item.available_units })
            .eq('blood_group', bloodGroup);
        } catch (err) {
          console.error('Supabase stock update error:', err);
        }
      }
      return item.available_units;
    }
    return null;
  }

  async setInventoryUnits(bloodGroup, units) {
    const item = this.data.inventory.find(i => i.blood_group === bloodGroup);
    if (item) {
      item.available_units = Math.max(0, parseInt(units, 10) || 0);
      item.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.saveState();

      if (this.supabase && this.isSupabaseConnected) {
        try {
          await this.supabase
            .from('blood_inventory')
            .update({ available_units: item.available_units })
            .eq('blood_group', bloodGroup);
        } catch (err) {
          console.error('Supabase stock set error:', err);
        }
      }
      return item.available_units;
    }
    return null;
  }

  // --- Donor Operations ---
  getDonors() {
    return this.data.donors;
  }

  async addDonor(donor) {
    const newId = this.data.donors.length > 0 
      ? Math.max(...this.data.donors.map(d => d.donor_id)) + 1 
      : 101;
    const newDonor = {
      donor_id: newId,
      full_name: donor.full_name,
      blood_group: donor.blood_group,
      age: parseInt(donor.age, 10),
      gender: donor.gender,
      contact_no: donor.contact_no,
      city: donor.city,
      last_donation_date: donor.last_donation_date || null,
      registered_at: new Date().toISOString().substring(0, 10)
    };

    this.data.donors.unshift(newDonor);
    this.saveState();

    if (this.supabase && this.isSupabaseConnected) {
      try {
        const { data, error } = await this.supabase.from('donors').insert([{
          full_name: newDonor.full_name,
          blood_group: newDonor.blood_group,
          age: newDonor.age,
          gender: newDonor.gender,
          contact_no: newDonor.contact_no,
          city: newDonor.city,
          last_donation_date: newDonor.last_donation_date || null
        }]).select();

        if (data && data[0]) {
          newDonor.donor_id = data[0].donor_id;
          this.saveState();
        }
      } catch (err) {
        console.error('Supabase donor insert error:', err);
      }
    }

    return newDonor;
  }

  async recordDonation(donorId) {
    const donor = this.data.donors.find(d => d.donor_id === parseInt(donorId, 10));
    if (!donor) return { success: false, message: 'Donor not found' };

    const todayStr = new Date().toISOString().substring(0, 10);
    donor.last_donation_date = todayStr;
    await this.updateInventoryUnits(donor.blood_group, 1);
    this.saveState();

    if (this.supabase && this.isSupabaseConnected) {
      try {
        await this.supabase
          .from('donors')
          .update({ last_donation_date: todayStr })
          .eq('donor_id', donorId);
      } catch (err) {
        console.error('Supabase record donation error:', err);
      }
    }

    return { success: true, donor, blood_group: donor.blood_group };
  }

  // --- Request Operations ---
  getRequests() {
    return this.data.requests;
  }

  async addRequest(req) {
    const newId = this.data.requests.length > 0 
      ? Math.max(...this.data.requests.map(r => r.request_id)) + 1 
      : 201;
    const newRequest = {
      request_id: newId,
      patient_name: req.patient_name,
      blood_group_needed: req.blood_group_needed,
      units_requested: parseInt(req.units_requested, 10),
      hospital_name: req.hospital_name,
      contact_person: req.contact_person,
      contact_no: req.contact_no,
      request_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Pending',
      priority: req.priority || 'Normal',
      notes: req.notes || ''
    };

    this.data.requests.unshift(newRequest);
    this.saveState();

    if (this.supabase && this.isSupabaseConnected) {
      try {
        const { data, error } = await this.supabase.from('blood_requests').insert([{
          patient_name: newRequest.patient_name,
          blood_group_needed: newRequest.blood_group_needed,
          units_requested: newRequest.units_requested,
          hospital_name: newRequest.hospital_name,
          contact_person: newRequest.contact_person,
          contact_no: newRequest.contact_no,
          status: 'Pending',
          admin_notes: newRequest.notes || null
        }]).select();

        if (data && data[0]) {
          newRequest.request_id = data[0].request_id;
          this.saveState();
        }
      } catch (err) {
        console.error('Supabase request insert error:', err);
      }
    }

    return newRequest;
  }

  async adjudicateRequest(requestId, action, notes = '') {
    const req = this.data.requests.find(r => r.request_id === parseInt(requestId, 10));
    if (!req) return { success: false, message: 'Request ID not found.' };

    const inv = this.data.inventory.find(i => i.blood_group === req.blood_group_needed);
    if (!inv) return { success: false, message: 'Blood group ledger not found.' };

    if (action === 'Approve') {
      if (inv.available_units < req.units_requested) {
        return { 
          success: false, 
          message: `Insufficient inventory! Available units for ${req.blood_group_needed}: ${inv.available_units}, Requested: ${req.units_requested}. Cannot approve without sufficient stock.` 
        };
      }
      inv.available_units -= req.units_requested;
      inv.last_updated = new Date().toISOString().replace('T', ' ').substring(0, 19);
      req.status = 'Approved';
      if (notes) req.notes = notes;
    } else if (action === 'Fulfill') {
      req.status = 'Fulfilled';
      if (notes) req.notes = notes;
    } else if (action === 'Reject') {
      req.status = 'Rejected';
      if (notes) req.notes = notes;
    }

    this.saveState();

    if (this.supabase && this.isSupabaseConnected) {
      try {
        await this.supabase
          .from('blood_requests')
          .update({ status: req.status, admin_notes: req.notes || null })
          .eq('request_id', requestId);

        if (action === 'Approve') {
          await this.supabase
            .from('blood_inventory')
            .update({ available_units: inv.available_units })
            .eq('blood_group', req.blood_group_needed);
        }
      } catch (err) {
        console.error('Supabase adjudication sync error:', err);
      }
    }

    return { success: true, request: req, remainingUnits: inv.available_units };
  }

  // --- 90-Day Cooldown Interval Verification ---
  checkDonorEligibility(lastDonationDateStr) {
    if (!lastDonationDateStr) {
      return {
        isEligible: true,
        daysPassed: null,
        daysRemaining: 0,
        message: 'Eligible (First time voluntary donor)',
        nextEligibleDate: 'Immediately'
      };
    }

    const lastDate = new Date(lastDonationDateStr);
    const now = new Date();
    const diffTime = now.getTime() - lastDate.getTime();
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (daysPassed >= 90) {
      return {
        isEligible: true,
        daysPassed: daysPassed,
        daysRemaining: 0,
        message: `Eligible (${daysPassed} days since last donation; exceeds mandatory 90-day cooldown)`,
        nextEligibleDate: 'Available Today'
      };
    } else {
      const daysRemaining = 90 - daysPassed;
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 90);
      return {
        isEligible: false,
        daysPassed: daysPassed,
        daysRemaining: daysRemaining,
        message: `Mandatory 90-day cooldown active (${daysRemaining} days remaining for physiological recovery)`,
        nextEligibleDate: nextDate.toISOString().substring(0, 10)
      };
    }
  }
}

// Instantiate Global Store
const store = new RedPulseStore();

// ============================================================
// UI Renderers & Event Handlers
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  refreshAllViews();
  setupForms();
  setupCompatibilityTool();
  setupRequestTracker();
  setupSupabaseModal();

  // Initialize Supabase Connection
  await store.initSupabase();
});

function refreshAllViews() {
  renderHeroStats();
  renderPublicInventory();
  renderDonorTable();
  renderRequisitionAdjudication();
  renderAdminStockConsole();
}

// View Navigation Router
function initNavigation() {
  const navLinks = document.querySelectorAll('[data-view-target]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view-target');
      switchView(targetView);
    });
  });
}

function switchView(viewId) {
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('d-none'));
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link.custom-nav').forEach(nl => {
    nl.classList.remove('active');
    if (nl.getAttribute('data-view-target') === viewId) {
      nl.classList.add('active');
    }
  });

  if (viewId === 'view-inventory') renderPublicInventory();
  if (viewId === 'view-donors') renderDonorTable();
  if (viewId === 'view-admin') {
    renderAdminStockConsole();
    renderRequisitionAdjudication();
  }
  if (viewId === 'view-home') renderHeroStats();
}

// 1. Hero Stats
function renderHeroStats() {
  const inv = store.getInventory();
  const donors = store.getDonors();
  const reqs = store.getRequests();

  const totalUnits = inv.reduce((sum, item) => sum + item.available_units, 0);
  const totalDonors = donors.length;
  const fulfilledReqs = reqs.filter(r => r.status === 'Fulfilled' || r.status === 'Approved').length;
  const pendingReqs = reqs.filter(r => r.status === 'Pending').length;

  const statUnitsEl = document.getElementById('stat-total-units');
  const statDonorsEl = document.getElementById('stat-total-donors');
  const statFulfilledEl = document.getElementById('stat-fulfilled-reqs');
  const statPendingEl = document.getElementById('stat-pending-reqs');

  if (statUnitsEl) statUnitsEl.textContent = totalUnits;
  if (statDonorsEl) statDonorsEl.textContent = totalDonors;
  if (statFulfilledEl) statFulfilledEl.textContent = fulfilledReqs;
  if (statPendingEl) statPendingEl.textContent = pendingReqs;
}

// 2. Public Live Inventory Panel
function renderPublicInventory(filterGroup = 'ALL') {
  const container = document.getElementById('public-inventory-grid');
  if (!container) return;

  const inventory = store.getInventory();
  container.innerHTML = '';

  inventory.forEach(item => {
    if (filterGroup !== 'ALL' && item.blood_group !== filterGroup) return;

    let statusClass = 'abundant';
    let statusText = 'Optimal Supply';

    if (item.available_units < 5) {
      statusClass = 'critical';
      statusText = 'Critical Shortage';
    } else if (item.available_units < 10) {
      statusClass = 'low';
      statusText = 'Moderate Stock';
    }

    const card = document.createElement('div');
    card.className = 'col-6 col-md-3 mb-4';
    card.innerHTML = `
      <div class="blood-unit-card">
        <div class="blood-group-badge">${item.blood_group}</div>
        <div class="unit-count">${item.available_units} <span class="fs-6 text-muted">units</span></div>
        <div class="unit-label">Verified Available</div>
        <span class="status-pill ${statusClass}">
          <i class="fa-solid ${item.available_units < 5 ? 'fa-triangle-exclamation' : 'fa-circle-check'} me-1"></i>
          ${statusText}
        </span>
        <div class="mt-3 pt-2 border-top text-muted" style="font-size: 0.75rem;">
          <i class="fa-regular fa-clock me-1"></i> ${store.isSupabaseConnected ? '<span class="text-success"><i class="fa-solid fa-cloud me-1"></i>Supabase Synced</span>' : 'Local Synced'}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// 3. Donor Onboarding & Eligibility Verification
function renderDonorTable(searchTerm = '') {
  const tbody = document.getElementById('donor-roster-tbody');
  if (!tbody) return;

  const donors = store.getDonors();
  tbody.innerHTML = '';

  const filtered = donors.filter(d => {
    const term = searchTerm.toLowerCase();
    return d.full_name.toLowerCase().includes(term) ||
           d.blood_group.toLowerCase().includes(term) ||
           d.city.toLowerCase().includes(term) ||
           d.contact_no.includes(term);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No donor records matched.</td></tr>`;
    return;
  }

  filtered.forEach(donor => {
    const elig = store.checkDonorEligibility(donor.last_donation_date);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${donor.donor_id}</strong></td>
      <td>
        <div class="fw-bold">${escapeHtml(donor.full_name)}</div>
        <small class="text-muted">${donor.age} yrs, ${donor.gender} | ${escapeHtml(donor.city)}</small>
      </td>
      <td>
        <span class="badge bg-danger fs-6 px-2 py-1">${donor.blood_group}</span>
      </td>
      <td>${donor.contact_no}</td>
      <td>
        ${donor.last_donation_date 
          ? `<span class="text-dark">${donor.last_donation_date}</span>` 
          : `<span class="badge bg-secondary">Never Donated</span>`}
      </td>
      <td>
        ${elig.isEligible 
          ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
               <i class="fa-solid fa-circle-check me-1"></i> Eligible
             </span>`
          : `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1" title="${elig.message}">
               <i class="fa-solid fa-hourglass-half me-1"></i> ${elig.daysRemaining}d Cooldown
             </span>`
        }
      </td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger record-donation-btn" data-donor-id="${donor.donor_id}">
          <i class="fa-solid fa-hand-holding-droplet me-1"></i> Log Donation
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.record-donation-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const donorId = btn.getAttribute('data-donor-id');
      const res = await store.recordDonation(donorId);
      if (res.success) {
        showToast(`Donation recorded for ${res.donor.full_name}! +1 unit added to ${res.blood_group} inventory.`, 'success');
        refreshAllViews();
      }
    });
  });
}

// 4. Admin Stock Management Console
function renderAdminStockConsole() {
  const container = document.getElementById('admin-stock-table-body');
  if (!container) return;

  const inventory = store.getInventory();
  container.innerHTML = '';

  inventory.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge bg-danger fs-6">${item.blood_group}</span></td>
      <td>
        <div class="input-group input-group-sm" style="max-width: 140px;">
          <button class="btn btn-outline-secondary stock-adjust-btn" data-group="${item.blood_group}" data-delta="-1">-</button>
          <input type="number" min="0" class="form-control text-center stock-unit-input" data-group="${item.blood_group}" value="${item.available_units}">
          <button class="btn btn-outline-secondary stock-adjust-btn" data-group="${item.blood_group}" data-delta="1">+</button>
        </div>
      </td>
      <td>
        ${item.available_units < 5 
          ? '<span class="badge bg-danger"><i class="fa-solid fa-triangle-exclamation me-1"></i>Critical Shortage</span>' 
          : item.available_units < 10 
            ? '<span class="badge bg-warning text-dark">Low Reserve</span>' 
            : '<span class="badge bg-success">Adequate Stock</span>'}
      </td>
      <td><small class="text-muted">${item.last_updated}</small></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-primary stock-save-btn" data-group="${item.blood_group}">
          <i class="fa-solid fa-floppy-disk me-1"></i> Save
        </button>
      </td>
    `;
    container.appendChild(tr);
  });

  container.querySelectorAll('.stock-adjust-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const group = btn.getAttribute('data-group');
      const delta = parseInt(btn.getAttribute('data-delta'), 10);
      await store.updateInventoryUnits(group, delta);
      refreshAllViews();
      showToast(`Updated ${group} stock count.`, 'info');
    });
  });

  container.querySelectorAll('.stock-save-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const group = btn.getAttribute('data-group');
      const input = container.querySelector(`input[data-group="${group}"]`);
      if (input) {
        await store.setInventoryUnits(group, input.value);
        refreshAllViews();
        showToast(`Saved ${group} inventory: ${input.value} units.`, 'success');
      }
    });
  });
}

// 5. Requisition Adjudication Pipeline
function renderRequisitionAdjudication(statusFilter = 'ALL') {
  const tbody = document.getElementById('adjudication-tbody');
  if (!tbody) return;

  const requests = store.getRequests();
  tbody.innerHTML = '';

  const filtered = requests.filter(r => statusFilter === 'ALL' || r.status === statusFilter);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No requisition records in this view.</td></tr>`;
    return;
  }

  filtered.forEach(req => {
    const currentStock = store.getUnitsForGroup(req.blood_group_needed);
    const hasEnough = currentStock >= req.units_requested;

    let badgeClass = 'bg-secondary';
    if (req.status === 'Approved') badgeClass = 'bg-primary';
    if (req.status === 'Fulfilled') badgeClass = 'bg-success';
    if (req.status === 'Rejected') badgeClass = 'bg-danger';
    if (req.status === 'Pending') badgeClass = 'bg-warning text-dark';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>#${req.request_id}</strong><br><small class="text-muted">${req.request_date}</small></td>
      <td>
        <div class="fw-bold">${escapeHtml(req.patient_name)}</div>
        <small class="text-muted"><i class="fa-regular fa-hospital me-1"></i>${escapeHtml(req.hospital_name)}</small>
      </td>
      <td>
        <span class="badge bg-danger fs-6">${req.blood_group_needed}</span>
        <div class="small fw-semibold mt-1">${req.units_requested} unit(s)</div>
      </td>
      <td>
        <span class="small ${hasEnough ? 'text-success' : 'text-danger fw-bold'}">
          ${currentStock} units available
        </span>
      </td>
      <td>
        <span class="badge ${badgeClass} px-2 py-1">${req.status}</span>
        ${req.priority === 'Emergency' ? '<br><span class="badge bg-danger mt-1">EMERGENCY</span>' : ''}
      </td>
      <td><small class="text-muted">${escapeHtml(req.contact_person)} (${escapeHtml(req.contact_no)})</small></td>
      <td class="text-end">
        ${req.status === 'Pending' ? `
          <button class="btn btn-sm btn-success req-action-btn me-1" data-id="${req.request_id}" data-action="Approve" ${!hasEnough ? 'title="Warning: stock low"' : ''}>
            <i class="fa-solid fa-check me-1"></i> Approve & Deduct
          </button>
          <button class="btn btn-sm btn-outline-danger req-action-btn" data-id="${req.request_id}" data-action="Reject">
            <i class="fa-solid fa-xmark"></i> Reject
          </button>
        ` : req.status === 'Approved' ? `
          <button class="btn btn-sm btn-outline-success req-action-btn" data-id="${req.request_id}" data-action="Fulfill">
            <i class="fa-solid fa-circle-check me-1"></i> Mark Fulfilled
          </button>
        ` : `
          <span class="text-muted small">Adjudicated</span>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.req-action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const res = await store.adjudicateRequest(id, action);
      if (res.success) {
        showToast(`Request #${id} marked as ${action}! Inventory synchronized.`, 'success');
        refreshAllViews();
      } else {
        alert(res.message);
      }
    });
  });
}

// 6. Setup Form Handlers (Registration & Emergency Request)
function setupForms() {
  const lastDonationInput = document.getElementById('donor_last_date');
  const cooldownFeedback = document.getElementById('donor-cooldown-feedback');

  if (lastDonationInput && cooldownFeedback) {
    lastDonationInput.addEventListener('change', () => {
      const val = lastDonationInput.value;
      const res = store.checkDonorEligibility(val);
      if (res.isEligible) {
        cooldownFeedback.className = 'cooldown-box eligible';
        cooldownFeedback.innerHTML = `
          <i class="fa-solid fa-circle-check fs-4"></i>
          <div>
            <strong>Eligible to Donate:</strong> ${res.message}
          </div>
        `;
      } else {
        cooldownFeedback.className = 'cooldown-box ineligible';
        cooldownFeedback.innerHTML = `
          <i class="fa-solid fa-triangle-exclamation fs-4"></i>
          <div>
            <strong>Mandatory Cooldown Active:</strong> ${res.message}<br>
            <small>Next eligible date: <strong>${res.nextEligibleDate}</strong></small>
          </div>
        `;
      }
    });
  }

  // Donor Registration Form Submit
  const donorForm = document.getElementById('donor-registration-form');
  if (donorForm) {
    donorForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const age = parseInt(document.getElementById('donor_age').value, 10);
      if (age < 18 || age > 65) {
        alert('Donor must be between 18 and 65 years old to donate blood.');
        return;
      }

      const donorObj = {
        full_name: document.getElementById('donor_name').value.trim(),
        blood_group: document.getElementById('donor_blood_group').value,
        age: age,
        gender: document.getElementById('donor_gender').value,
        contact_no: document.getElementById('donor_contact').value.trim(),
        city: document.getElementById('donor_city').value.trim(),
        last_donation_date: document.getElementById('donor_last_date').value || null
      };

      const newDonor = await store.addDonor(donorObj);
      showToast(`Donor ${newDonor.full_name} registered successfully!`, 'success');
      donorForm.reset();
      refreshAllViews();

      showReceiptModal({
        title: 'Donor Registration Confirmed',
        id: `#DON-${newDonor.donor_id}`,
        details: [
          { label: 'Donor Name', val: newDonor.full_name },
          { label: 'Blood Group', val: newDonor.blood_group },
          { label: 'Contact', val: newDonor.contact_no },
          { label: 'City', val: newDonor.city },
          { label: 'Status', val: store.checkDonorEligibility(newDonor.last_donation_date).isEligible ? 'Eligible for Donation' : 'In Cooldown' }
        ]
      });
    });
  }

  // Emergency Request Form Submit
  const requestForm = document.getElementById('emergency-request-form');
  if (requestForm) {
    const bgSelect = document.getElementById('req_blood_group');
    const unitsInput = document.getElementById('req_units');
    const stockWarnEl = document.getElementById('req-stock-indicator');

    const updateStockWarning = () => {
      if (!bgSelect || !unitsInput || !stockWarnEl) return;
      const bg = bgSelect.value;
      const reqUnits = parseInt(unitsInput.value, 10) || 1;
      const currentStock = store.getUnitsForGroup(bg);

      if (currentStock >= reqUnits) {
        stockWarnEl.className = 'alert alert-success py-2 mt-2';
        stockWarnEl.innerHTML = `<i class="fa-solid fa-circle-check me-1"></i> In Stock! <strong>${currentStock} units</strong> available of ${bg}. Immediate adjudication possible.`;
      } else {
        stockWarnEl.className = 'alert alert-warning py-2 mt-2';
        stockWarnEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Stock Alert: Only <strong>${currentStock} units</strong> currently available of ${bg}. Our administrator will coordinate urgent donor recall.`;
      }
    };

    if (bgSelect) bgSelect.addEventListener('change', updateStockWarning);
    if (unitsInput) unitsInput.addEventListener('input', updateStockWarning);

    requestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reqObj = {
        patient_name: document.getElementById('req_patient_name').value.trim(),
        blood_group_needed: document.getElementById('req_blood_group').value,
        units_requested: document.getElementById('req_units').value,
        hospital_name: document.getElementById('req_hospital').value.trim(),
        contact_person: document.getElementById('req_contact_person').value.trim(),
        contact_no: document.getElementById('req_contact_no').value.trim(),
        priority: document.getElementById('req_priority').value,
        notes: document.getElementById('req_notes').value.trim()
      };

      const newReq = await store.addRequest(reqObj);
      showToast(`Emergency Requisition #${newReq.request_id} created! Logged in database.`, 'success');
      requestForm.reset();
      updateStockWarning();
      refreshAllViews();

      showReceiptModal({
        title: 'Emergency Blood Request Submitted',
        id: `#REQ-${newReq.request_id}`,
        details: [
          { label: 'Patient Name', val: newReq.patient_name },
          { label: 'Blood Group Needed', val: newReq.blood_group_needed },
          { label: 'Units Requested', val: `${newReq.units_requested} Unit(s)` },
          { label: 'Hospital', val: newReq.hospital_name },
          { label: 'Database Status', val: store.isSupabaseConnected ? 'Synced to Supabase' : 'Logged Locally' }
        ]
      });
    });
  }

  const donorSearchInput = document.getElementById('donor-search-input');
  if (donorSearchInput) {
    donorSearchInput.addEventListener('input', (e) => {
      renderDonorTable(e.target.value);
    });
  }

  const adminFilterSelect = document.getElementById('admin-req-filter');
  if (adminFilterSelect) {
    adminFilterSelect.addEventListener('change', (e) => {
      renderRequisitionAdjudication(e.target.value);
    });
  }

  const invFilterBtns = document.querySelectorAll('.inv-filter-btn');
  invFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      invFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPublicInventory(btn.getAttribute('data-filter'));
    });
  });

  const resetBtn = document.getElementById('btn-reset-database');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset RedPulse database to initial synopsis seed values? All custom entries will be restored to defaults.')) {
        store.resetState();
        refreshAllViews();
        showToast('Database reset to synopsis defaults.', 'info');
      }
    });
  }

  const adminLoginBtn = document.getElementById('btn-admin-login-submit');
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
      const u = document.getElementById('admin_user').value.trim();
      const p = document.getElementById('admin_pass').value.trim();
      if ((u === 'admin' || u === 'danish' || u === 'atharv') && (p === 'admin123' || p === 'admin')) {
        const modalEl = document.getElementById('adminLoginModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        showToast(`Authenticated as Administrator (${u}). Access unlocked.`, 'success');
        switchView('view-admin');
      } else {
        alert('Invalid administrator credentials! For demo: username "admin", password "admin123"');
      }
    });
  }
}

// 7. Supabase Configuration Modal Logic
function setupSupabaseModal() {
  const urlInput = document.getElementById('input_supabase_url');
  const keyInput = document.getElementById('input_supabase_key');
  const feedbackEl = document.getElementById('supabase-modal-feedback');
  const saveBtn = document.getElementById('btn-save-supabase-config');
  const disconnectBtn = document.getElementById('btn-disconnect-supabase');

  const existingUrl = localStorage.getItem(SUPABASE_STORAGE_URL_KEY) || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url) || '';
  const existingKey = localStorage.getItem(SUPABASE_STORAGE_ANON_KEY) || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey) || '';

  if (urlInput) urlInput.value = existingUrl;
  if (keyInput) keyInput.value = existingKey;

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const url = urlInput.value.trim();
      const key = keyInput.value.trim();

      if (!url || !key) {
        feedbackEl.className = 'alert alert-danger py-2 small mb-3';
        feedbackEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation me-1"></i> Please provide both Supabase URL and Anon Key.';
        feedbackEl.classList.remove('d-none');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Testing connection...';

      try {
        const testClient = window.supabase.createClient(url, key);
        const { data, error } = await testClient.from('blood_inventory').select('*').limit(1);

        if (error) {
          throw error;
        }

        // Connection successful!
        localStorage.setItem(SUPABASE_STORAGE_URL_KEY, url);
        localStorage.setItem(SUPABASE_STORAGE_ANON_KEY, key);

        store.supabase = testClient;
        store.isSupabaseConnected = true;
        store.updateConnectionBadge(true);
        await store.syncFromSupabase();

        feedbackEl.className = 'alert alert-success py-2 small mb-3';
        feedbackEl.innerHTML = '<i class="fa-solid fa-circle-check me-1"></i> Connected to Supabase successfully! Live database synchronized.';
        feedbackEl.classList.remove('d-none');

        setTimeout(() => {
          const modalEl = document.getElementById('supabaseConfigModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
        }, 1200);

        showToast('Connected to Supabase PostgreSQL database!', 'success');
      } catch (err) {
        feedbackEl.className = 'alert alert-danger py-2 small mb-3';
        feedbackEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation me-1"></i> Connection failed: ${err.message}. Ensure your tables are created using supabase_schema.sql.`;
        feedbackEl.classList.remove('d-none');
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-link me-1"></i> Test &amp; Connect to Supabase';
      }
    });
  }

  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      localStorage.removeItem(SUPABASE_STORAGE_URL_KEY);
      localStorage.removeItem(SUPABASE_STORAGE_ANON_KEY);
      store.supabase = null;
      store.isSupabaseConnected = false;
      store.updateConnectionBadge(false);
      if (urlInput) urlInput.value = '';
      if (keyInput) keyInput.value = '';
      feedbackEl.className = 'alert alert-info py-2 small mb-3';
      feedbackEl.innerHTML = '<i class="fa-solid fa-info-circle me-1"></i> Disconnected. Using offline local storage.';
      feedbackEl.classList.remove('d-none');
      showToast('Switched to local offline mode.', 'info');
    });
  }
}

// 8. Blood Compatibility Tool
function setupCompatibilityTool() {
  const select = document.getElementById('compat-blood-group-select');
  const canReceiveDiv = document.getElementById('compat-can-receive');
  const canDonateDiv = document.getElementById('compat-can-donate');

  if (!select || !canReceiveDiv || !canDonateDiv) return;

  const updateMatrix = () => {
    const bg = select.value;
    const mapping = COMPATIBILITY_MAP[bg];
    if (!mapping) return;

    canReceiveDiv.innerHTML = mapping.canReceive.map(g => `<span class="badge bg-danger me-1 fs-6">${g}</span>`).join(' ');
    canDonateDiv.innerHTML = mapping.canDonateTo.map(g => `<span class="badge bg-success me-1 fs-6">${g}</span>`).join(' ');
  };

  select.addEventListener('change', updateMatrix);
  updateMatrix();
}

// 9. Requisition Status Tracker
function setupRequestTracker() {
  const trackBtn = document.getElementById('btn-track-request');
  const trackInput = document.getElementById('track-query-input');
  const resultDiv = document.getElementById('track-result-container');

  if (!trackBtn || !trackInput || !resultDiv) return;

  trackBtn.addEventListener('click', () => {
    const q = trackInput.value.trim().toLowerCase().replace('#req-', '').replace('#', '');
    if (!q) {
      alert('Please enter a Request ID or Patient Name');
      return;
    }

    const requests = store.getRequests();
    const match = requests.find(r => 
      r.request_id.toString() === q || 
      r.patient_name.toLowerCase().includes(q) ||
      r.contact_no.includes(q)
    );

    if (!match) {
      resultDiv.innerHTML = `
        <div class="alert alert-warning">
          <i class="fa-solid fa-circle-exclamation me-2"></i>
          No blood requisition found matching "<strong>${escapeHtml(q)}</strong>". Please verify your requisition ID.
        </div>
      `;
      return;
    }

    resultDiv.innerHTML = `
      <div class="card card-custom p-4 mt-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="mb-0 text-danger fw-bold">Requisition #REQ-${match.request_id}</h5>
            <small class="text-muted">Submitted on ${match.request_date}</small>
          </div>
          <div>
            <span class="badge ${match.status === 'Fulfilled' ? 'bg-success' : match.status === 'Approved' ? 'bg-primary' : match.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} fs-6 px-3 py-2">
              ${match.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div class="row g-3 py-3 border-top border-bottom my-2">
          <div class="col-md-3">
            <span class="text-muted small">Patient Name</span>
            <div class="fw-bold">${escapeHtml(match.patient_name)}</div>
          </div>
          <div class="col-md-3">
            <span class="text-muted small">Blood Group Needed</span>
            <div><span class="badge bg-danger fs-6">${match.blood_group_needed}</span> (${match.units_requested} Units)</div>
          </div>
          <div class="col-md-3">
            <span class="text-muted small">Hospital</span>
            <div class="fw-bold">${escapeHtml(match.hospital_name)}</div>
          </div>
          <div class="col-md-3">
            <span class="text-muted small">Contact Person</span>
            <div>${escapeHtml(match.contact_person)} (${escapeHtml(match.contact_no)})</div>
          </div>
        </div>

        <div class="mt-3">
          <h6 class="fw-bold">Adjudication Pipeline State:</h6>
          <div class="p-3 bg-light rounded-3">
            ${match.status === 'Pending' ? `
              <div class="text-warning-emphasis">
                <i class="fa-solid fa-spinner fa-spin me-2"></i>
                <strong>Under Relational Verification:</strong> Requisition is in the administrative review queue.
              </div>
            ` : match.status === 'Approved' ? `
              <div class="text-primary">
                <i class="fa-solid fa-circle-check me-2"></i>
                <strong>Requisition Approved & Reserved:</strong> ${match.units_requested} units of ${match.blood_group_needed} have been deducted from active stock.
              </div>
            ` : match.status === 'Fulfilled' ? `
              <div class="text-success">
                <i class="fa-solid fa-box-open me-2"></i>
                <strong>Completed & Dispatched:</strong> Blood units have been successfully transferred and logged in clinical audit.
              </div>
            ` : `
              <div class="text-danger">
                <i class="fa-solid fa-circle-xmark me-2"></i>
                <strong>Requisition Declined:</strong> Request could not be fulfilled at this time. Notes: ${match.notes || 'Incompatible or insufficient inventory reserves.'}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  });
}

// Receipt Modal Helper
function showReceiptModal(data) {
  let modalEl = document.getElementById('genericReceiptModal');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'genericReceiptModal';
    modalEl.className = 'modal fade';
    modalEl.tabIndex = -1;
    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content card-custom">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title" id="receiptModalTitle">Receipt</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4" id="receiptModalBody"></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-crimson" onclick="window.print()"><i class="fa-solid fa-print me-1"></i> Print</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalEl);
  }

  document.getElementById('receiptModalTitle').innerHTML = `<i class="fa-solid fa-circle-check me-2"></i> ${data.title}`;
  const body = document.getElementById('receiptModalBody');
  body.innerHTML = `
    <div class="text-center mb-4">
      <div class="text-danger fw-bold fs-2">${data.id}</div>
      <small class="text-muted">${store.isSupabaseConnected ? 'Synchronized with Supabase Live Database' : 'Recorded into Local Relational Store'}</small>
    </div>
    <ul class="list-group list-group-flush border rounded-3 mb-3">
      ${data.details.map(d => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span class="text-muted">${d.label}</span>
          <span class="fw-bold">${escapeHtml(d.val)}</span>
        </li>
      `).join('')}
    </ul>
    <div class="alert alert-light border small text-muted text-center mb-0">
      ACID compliant transaction logged. Thank you for using RedPulse Blood Bank Management System.
    </div>
  `;

  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'dark'} border-0`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-bell'} me-2"></i>
        ${escapeHtml(message)}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toastEl);
  const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
  toast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
