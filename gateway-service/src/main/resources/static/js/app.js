/**
 * CivicPulse - Unified Frontend Management Engine
 * Implements role-based workspaces, tab-routing, alerts polling, and data workflows.
 */

// --- Global Application State ---
const State = {
  mode: 'LIVE', // 'SANDBOX' or 'LIVE'
  gatewayUrl: 'http://localhost:8090',
  user: null, // { email, role, token, citizenId }
  pollingInterval: null,
  charts: {
    admin: null,
    officer: null
  },
  selectedApplicationId: null, // Active application on stepper
  selectedGrievanceId: null    // Active grievance on timeline
};

// --- Mock Database (Simulated Storage for SANDBOX) ---
const SANDBOX_DB_KEY = 'civicpulse_sandbox_db';
const defaultSandboxData = {
  users: [
    { email: 'citizen.doe@mail.com', passwordHash: 'password123', role: 'CITIZEN' },
    { email: 'admin@civicpulse.gov', passwordHash: 'password123', role: 'ADMIN' },
    { email: 'officer.smith@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Utilities & Water Supply' },
    { email: 'officer.patel@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Utilities & Water Supply' },
    { email: 'officer.jones@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Public Works & Roads' },
    { email: 'officer.williams@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Public Works & Roads' },
    { email: 'officer.garcia@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Sanitation & Waste Management' },
    { email: 'officer.chen@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Sanitation & Waste Management' },
    { email: 'officer.brown@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Revenue & Taxation' },
    { email: 'officer.davis@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Town Planning & Licensing' },
    { email: 'officer.taylor@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Street Lighting & Energy' },
    { email: 'officer.wilson@civicpulse.gov', passwordHash: 'password123', role: 'FIELD_OFFICER', department: 'Public Health & Environment' }
  ],
  citizenProfiles: [
    {
      id: 1,
      userEmail: 'citizen.doe@mail.com',
      fullName: 'Jane Doe',
      phoneNumber: '+1-555-0199',
      homeAddress: '456 Municipal Rd, Ward 12, City Center',
      nationalId: 'NAT-9876543'
    }
  ],
  grievances: [
    {
      id: 101,
      trackingNumber: 'CPN-20260713-001',
      title: 'Water Main Leak on Main St.',
      description: 'Substantial clean water leak near central boulevard. Department: Utilities & Water Supply (Ward 4)',
      street: '456 Main St',
      landmark: 'Near Metro Station',
      city: 'Metropolis',
      pincode: '500001',
      category: 'Utilities & Water Supply',
      priority: 'HIGH',
      status: 'OPEN',
      creatorEmail: 'citizen.doe@mail.com',
      assigneeEmail: 'officer.smith@civicpulse.gov',
      createdAt: new Date().toISOString(),
      dueAt: new Date(Date.now() + 48*3600*1000).toISOString(),
      resolvedAt: null
    },
    {
      id: 102,
      trackingNumber: 'CPN-20260710-002',
      title: 'Pothole & Road Damage Hazard',
      description: 'Deep pothole causing traffic safety issues on 4th Ave. Department: Public Works & Roads (Ward 9)',
      street: '12 4th Ave',
      landmark: 'Opposite City Bank',
      city: 'Metropolis',
      pincode: '500002',
      category: 'Public Works & Roads',
      priority: 'HIGH',
      status: 'EXPIRED/OVERDUE',
      creatorEmail: 'citizen.doe@mail.com',
      assigneeEmail: 'officer.jones@civicpulse.gov',
      createdAt: new Date(Date.now() - 72*3600*1000).toISOString(),
      dueAt: new Date(Date.now() - 24*3600*1000).toISOString(),
      resolvedAt: null
    },
    {
      id: 103,
      trackingNumber: 'CPN-20260711-003',
      title: 'Street Light Outage',
      description: 'Street light out on Maple St. Department: Street Lighting & Energy (Ward 12)',
      street: '78 Maple St',
      landmark: 'Corner Park',
      city: 'Metropolis',
      pincode: '500003',
      category: 'Street Lighting & Energy',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      creatorEmail: 'citizen.doe@mail.com',
      assigneeEmail: 'officer.taylor@civicpulse.gov',
      createdAt: new Date(Date.now() - 48*3600*1000).toISOString(),
      dueAt: new Date(Date.now() + 72*3600*1000).toISOString(),
      resolvedAt: new Date(Date.now() - 4*3600*1000).toISOString()
    }
  ],
  notifications: [],
  serviceApplications: [
    {
      id: 1,
      applicationNumber: 'APP-20260715-1001',
      citizenId: 1,
      serviceType: 'BIRTH_CERTIFICATE',
      applicantName: 'Jane Doe',
      fatherName: 'Robert Doe',
      dob: '1998-05-14',
      gender: 'Female',
      aadhaarNumber: '123456789012',
      voterid: 'VTR-98765432',
      region: 'Central District, State Metro',
      purpose: 'Official Passport Verification',
      status: 'SUBMITTED',
      verificationStatus: 'PENDING',
      approvalStatus: 'PENDING',
      certificateNumber: null,
      appliedDate: new Date(Date.now() - 24*3600*1000).toISOString(),
      approvedDate: null,
      downloadCount: 0,
      rejectionReason: null
    },
    {
      id: 2,
      applicationNumber: 'APP-20260715-1002',
      citizenId: 1,
      serviceType: 'INCOME_CERTIFICATE',
      applicantName: 'Jane Doe',
      fatherName: 'Robert Doe',
      dob: '1998-05-14',
      gender: 'Female',
      aadhaarNumber: '123456789012',
      voterid: 'VTR-98765432',
      region: 'Central District, State Metro',
      purpose: 'Higher Education Scholarship',
      status: 'CERTIFICATE_GENERATED',
      verificationStatus: 'VERIFIED',
      approvalStatus: 'APPROVED',
      certificateNumber: 'IC-2026-0001',
      appliedDate: new Date(Date.now() - 120*3600*1000).toISOString(),
      approvedDate: new Date(Date.now() - 12*3600*1000).toISOString(),
      downloadCount: 0,
      rejectionReason: null
    }
  ]
};

// Force reset of database to clear previous runs
const CLEAN_SLATE_KEY = 'civicpulse_clean_slate_db_v5';
if (!localStorage.getItem(CLEAN_SLATE_KEY)) {
  localStorage.setItem(CLEAN_SLATE_KEY, 'true');
  localStorage.setItem(SANDBOX_DB_KEY, JSON.stringify(defaultSandboxData));
  localStorage.removeItem('logged_in_user');
}

// Seed sandbox database if empty
if (!localStorage.getItem(SANDBOX_DB_KEY)) {
  localStorage.setItem(SANDBOX_DB_KEY, JSON.stringify(defaultSandboxData));
}

function getSandboxData() {
  return JSON.parse(localStorage.getItem(SANDBOX_DB_KEY));
}

function saveSandboxData(data) {
  localStorage.setItem(SANDBOX_DB_KEY, JSON.stringify(data));
}

// --- DOM Cache Elements ---
const elements = {
  // Mode & Gateway status
  modeToggleBtn: document.getElementById('mode-toggle-btn'),
  currentModeLabel: document.getElementById('current-mode-label'),
  modeGlow: document.getElementById('mode-glow'),
  gatewayStatus: document.getElementById('gateway-status'),
  mainHeader: document.getElementById('main-header'),
  mobileToggle: document.getElementById('mobile-toggle'),

  // Alerts Center
  bellBtn: document.getElementById('bell-btn'),
  bellBadge: document.getElementById('bell-badge'),
  notificationDropdown: document.getElementById('notification-dropdown'),
  notificationList: document.getElementById('notification-list'),
  clearNotifications: document.getElementById('clear-notifications'),

  // Auth Gate
  authSection: document.getElementById('auth-section'),
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),
  authMsg: document.getElementById('auth-msg'),
  authForm: document.getElementById('auth-form'),
  authEmail: document.getElementById('auth-email'),
  authPassword: document.getElementById('auth-password'),
  authRole: document.getElementById('auth-role'),
  registerRoleWrapper: document.getElementById('register-role-wrapper'),
  authSubmitBtn: document.getElementById('auth-submit-btn'),

  // Citizen stats & tables
  citizenStatTotal: document.getElementById('citizen-stat-total'),
  citizenStatPending: document.getElementById('citizen-stat-pending'),
  citizenStatSolved: document.getElementById('citizen-stat-solved'),
  citizenStatBreaches: document.getElementById('citizen-stat-breaches'),
  citizenActiveGrievancesTbody: document.getElementById('citizen-active-grievances-tbody'),
  citizenDashboardCertsTbody: document.getElementById('citizen-dashboard-certs-tbody'),
  citizenMyGrievancesTbody: document.getElementById('citizen-my-grievances-tbody'),
  
  // Citizen Forms
  lodgeGrievanceForm: document.getElementById('lodge-grievance-form'),
  applyCertificateForm: document.getElementById('apply-certificate-form'),
  duplicateWarningBlock: document.getElementById('duplicate-warning-block'),
  certSuccessBlock: document.getElementById('cert-success-block'),

  // Citizen Stepper
  citizenTrackTbody: document.getElementById('citizen-track-tbody'),
  stepperCardContainer: document.getElementById('stepper-card-container'),
  stepperAppId: document.getElementById('stepper-app-id'),
  verticalStepperWrapper: document.getElementById('vertical-stepper-wrapper'),
  stepperDownloadAction: document.getElementById('stepper-download-action'),

  // Officer Dashboard
  officerStatTotal: document.getElementById('officer-stat-total'),
  officerStatVerifications: document.getElementById('officer-stat-verifications'),
  officerStatSolved: document.getElementById('officer-stat-solved'),
  officerStatOverdue: document.getElementById('officer-stat-overdue'),
  officerChartCanvas: document.getElementById('officer-chart'),
  officerTasksTbody: document.getElementById('officer-tasks-tbody'),
  officerVerificationsTbody: document.getElementById('officer-verifications-tbody'),

  // Officer Queue Timeline
  timelineAppId: document.getElementById('timeline-app-id'),
  verticalTimelineWrapper: document.getElementById('vertical-timeline-wrapper'),
  timelineActionWrapper: document.getElementById('timeline-action-wrapper'),

  // Admin Overview
  adminStatUsers: document.getElementById('admin-stat-users'),
  adminStatTotal: document.getElementById('admin-stat-total'),
  adminStatSolved: document.getElementById('admin-stat-solved'),
  adminStatOverdue: document.getElementById('admin-stat-overdue'),
  adminChartCanvas: document.getElementById('admin-chart'),
  adminMasterTasksTbody: document.getElementById('admin-master-tasks-tbody'),
  adminDirectoryTbody: document.getElementById('admin-directory-tbody'),

  // Rejection Modal
  rejectionModal: document.getElementById('rejection-modal'),
  rejectionReasonText: document.getElementById('rejection-reason-text'),
  rejectionCancelBtn: document.getElementById('rejection-cancel-btn'),
  rejectionSubmitBtn: document.getElementById('rejection-submit-btn')
};

// --- Initialization Event Bindings ---
document.addEventListener('DOMContentLoaded', () => {
  setupNetworkModeToggle();
  setupAuthTabs();
  setupAuthForm();
  setupNavigationEvents();
  setupGrievanceSubmission();
  setupCertificateSubmission();
  setupNotificationCenter();
  setupRejectionModal();
  checkCachedLogin();
});

// --- Network & Mode controls ---
function setupNetworkModeToggle() {
  if (elements.modeToggleBtn) {
    elements.modeToggleBtn.addEventListener('click', () => {
      const target = State.mode === 'SANDBOX' ? 'LIVE' : 'SANDBOX';
      setMode(target);
    });
  }
  setMode(State.mode);
}

function setMode(mode) {
  State.mode = mode;
  elements.currentModeLabel.textContent = mode;
  if (mode === 'SANDBOX') {
    elements.modeGlow.className = "w-2 h-2 rounded-full bg-[#10B981] mr-2 animate-ping";
    elements.gatewayStatus.innerHTML = '<i class="fa-solid fa-circle-check mr-1 text-emerald-400"></i> Active';
  } else {
    elements.modeGlow.className = "w-2 h-2 rounded-full bg-blue-500 mr-2 animate-ping";
    checkLiveGatewayHealth();
  }
  if (State.user) {
    // Refresh current view
    const activeLink = document.querySelector('.nav-link[class*="text-[#10B981]"]');
    if (activeLink) {
      navigateToView(activeLink.getAttribute('data-view'));
    } else {
      navigateToDefaultView();
    }
  }
}

async function checkLiveGatewayHealth() {
  if (State.mode !== 'LIVE') return;
  try {
    const res = await fetch(`${State.gatewayUrl}/api/v1/users/count`);
    if (res.ok) {
      elements.gatewayStatus.innerHTML = '<i class="fa-solid fa-circle-check mr-1 text-[#10B981]"></i> Connected';
    } else {
      elements.gatewayStatus.innerHTML = '<i class="fa-solid fa-circle-check mr-1 text-[#10B981]"></i> Ready';
    }
  } catch (err) {
    elements.gatewayStatus.innerHTML = '<i class="fa-solid fa-circle-xmark mr-1 text-rose-500 animate-pulse"></i> Gateway Offline';
  }
}

// --- Auth Gate tab switching ---
let activeTab = 'LOGIN';
function setupAuthTabs() {
  elements.tabLogin.addEventListener('click', () => {
    activeTab = 'LOGIN';
    elements.tabLogin.className = "flex-1 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white transition-all";
    elements.tabRegister.className = "flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition-all";
    elements.registerRoleWrapper.classList.add('hidden');
    elements.authSubmitBtn.textContent = "Access Dashboard";
    hideAuthMsg();
  });

  elements.tabRegister.addEventListener('click', () => {
    activeTab = 'REGISTER';
    elements.tabRegister.className = "flex-1 py-2 text-sm font-semibold rounded-lg bg-slate-800 text-white transition-all";
    elements.tabLogin.className = "flex-1 py-2 text-sm font-semibold rounded-lg text-slate-400 hover:text-white transition-all";
    elements.registerRoleWrapper.classList.remove('hidden');
    elements.authSubmitBtn.textContent = "Register Account";
    hideAuthMsg();
  });
}

function showAuthMsg(msg, type = 'error') {
  elements.authMsg.textContent = msg;
  elements.authMsg.classList.remove('hidden', 'bg-rose-950/45', 'border-rose-900/60', 'text-rose-400', 'bg-emerald-950/45', 'border-emerald-900/60', 'text-emerald-400');
  if (type === 'error') {
    elements.authMsg.classList.add('bg-rose-950/45', 'border-rose-900/60', 'text-rose-400');
  } else {
    elements.authMsg.classList.add('bg-emerald-950/45', 'border-emerald-900/60', 'text-emerald-400');
  }
}

function hideAuthMsg() {
  elements.authMsg.classList.add('hidden');
}

// --- Auth Submission Flow ---
function setupAuthForm() {
  elements.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = elements.authEmail.value.trim().toLowerCase();
    const password = elements.authPassword.value;
    const role = elements.authRole.value;

    hideAuthMsg();

    if (activeTab === 'REGISTER') {
      await handleRegistration(email, password, role);
    } else {
      await handleLogin(email, password);
    }
  });
}

async function handleRegistration(email, password, role) {
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      showAuthMsg("This email is already registered.");
      return;
    }
    db.users.push({ email, passwordHash: password, role });
    if (role === 'CITIZEN') {
      const nextId = db.citizenProfiles.length + 1;
      db.citizenProfiles.push({
        id: nextId,
        userEmail: email,
        fullName: email.split('@')[0].toUpperCase(),
        phoneNumber: '+1-555-0199',
        homeAddress: '456 Municipal Rd, City Center',
        nationalId: 'NAT-' + Math.floor(Math.random() * 10000000)
      });
    }
    saveSandboxData(db);
    showAuthMsg("Registration successful! You can now log in.", "success");
    elements.tabLogin.click();
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        showAuthMsg(data.error || "Registration failed.");
        return;
      }
      showAuthMsg("Registration success! Please log in now.", "success");
      elements.tabLogin.click();
    } catch (err) {
      showAuthMsg("Gateway is offline.");
    }
  }
}

async function handleLogin(email, password) {
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== password) {
      showAuthMsg("Invalid email or password.");
      return;
    }
    const profile = db.citizenProfiles.find(p => p.userEmail.toLowerCase() === email.toLowerCase());
    const citizenId = profile ? profile.id : null;
    const loggedUser = { email: user.email, role: user.role, token: 'sandbox-jwt-payload', citizenId };
    loginSuccess(loggedUser);
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showAuthMsg(data.error || "Invalid email or password.");
        return;
      }
      if (data.role === 'CITIZEN') {
        const citizenId = await fetchOrCreateCitizenProfile(data.email, data.token);
        data.citizenId = citizenId;
      }
      loginSuccess(data);
    } catch (err) {
      showAuthMsg("Gateway is offline.");
    }
  }
}

async function fetchOrCreateCitizenProfile(email, token) {
  try {
    let res = await fetch(`${State.gatewayUrl}/api/v1/citizens/profile?email=${encodeURIComponent(email)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 404) {
      res = await fetch(`${State.gatewayUrl}/api/v1/citizens/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userEmail: email,
          fullName: email.split('@')[0].toUpperCase(),
          phoneNumber: '+1-555-0199',
          homeAddress: '456 Municipal Rd, City Center',
          nationalId: 'NAT-' + Math.floor(Math.random() * 10000000)
        })
      });
    }
    if (res.ok) {
      const profile = await res.json();
      return profile.id;
    }
  } catch (e) {
    console.error("Profile resolution error", e);
  }
  return 1; // Fallback ID
}

function loginSuccess(userData) {
  State.user = userData;
  localStorage.setItem('logged_in_user', JSON.stringify(userData));

  elements.authSection.classList.add('hidden');
  document.body.classList.add('logged-in');
  elements.mainHeader.classList.remove('hidden');

  // Load Decoupled Sidebars
  const citizenSidebar = document.getElementById('citizen-sidebar');
  const officerSidebar = document.getElementById('officer-sidebar');
  const adminSidebar = document.getElementById('admin-sidebar');

  citizenSidebar.classList.add('hidden');
  citizenSidebar.classList.remove('flex');
  officerSidebar.classList.add('hidden');
  officerSidebar.classList.remove('flex');
  adminSidebar.classList.add('hidden');
  adminSidebar.classList.remove('flex');

  if (userData.role === 'CITIZEN') {
    citizenSidebar.classList.remove('hidden');
    citizenSidebar.classList.add('flex');
    document.getElementById('citizen-views').classList.remove('hidden');
    document.getElementById('officer-views').classList.add('hidden');
    document.getElementById('admin-views').classList.add('hidden');
    renderSidebarFooter('Citizen');
  } else if (userData.role === 'FIELD_OFFICER') {
    officerSidebar.classList.remove('hidden');
    officerSidebar.classList.add('flex');
    document.getElementById('officer-views').classList.remove('hidden');
    document.getElementById('citizen-views').classList.add('hidden');
    document.getElementById('admin-views').classList.add('hidden');
    renderSidebarFooter('Officer');
  } else if (userData.role === 'ADMIN') {
    adminSidebar.classList.remove('hidden');
    adminSidebar.classList.add('flex');
    document.getElementById('admin-views').classList.remove('hidden');
    document.getElementById('citizen-views').classList.add('hidden');
    document.getElementById('officer-views').classList.add('hidden');
    renderSidebarFooter('Admin');
  }

  navigateToDefaultView();
  startNotificationPolling();
}

function handleLogout() {
  State.user = null;
  localStorage.removeItem('logged_in_user');
  clearInterval(State.pollingInterval);

  document.body.classList.remove('logged-in');
  
  const citizenSidebar = document.getElementById('citizen-sidebar');
  const officerSidebar = document.getElementById('officer-sidebar');
  const adminSidebar = document.getElementById('admin-sidebar');

  citizenSidebar.classList.add('hidden');
  citizenSidebar.classList.remove('flex');
  officerSidebar.classList.add('hidden');
  officerSidebar.classList.remove('flex');
  adminSidebar.classList.add('hidden');
  adminSidebar.classList.remove('flex');

  elements.mainHeader.classList.add('hidden');
  document.getElementById('citizen-views').classList.add('hidden');
  document.getElementById('officer-views').classList.add('hidden');
  document.getElementById('admin-views').classList.add('hidden');

  elements.authSection.classList.remove('hidden');
  elements.authEmail.value = '';
  elements.authPassword.value = '';
}

function renderSidebarFooter(role) {
  const footerId = `${role.toLowerCase()}-sidebar-footer`;
  const container = document.getElementById(footerId);
  if (!container) return;

  container.innerHTML = `
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2 truncate">
        <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-[#10B981] font-mono">
          ${State.user.email.slice(0, 2).toUpperCase()}
        </div>
        <div class="truncate">
          <p class="text-xs font-bold text-slate-200 truncate">${State.user.email}</p>
          <p class="text-[9px] text-slate-500 font-semibold uppercase">${role.replace('_', ' ')}</p>
        </div>
      </div>
      <button id="logout-${role.toLowerCase()}" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900/50 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors" title="Sign Out">
        <i class="fa-solid fa-right-from-bracket text-xs"></i>
      </button>
    </div>
  `;

  document.getElementById(`logout-${role.toLowerCase()}`).addEventListener('click', handleLogout);
}

function checkCachedLogin() {
  const cached = localStorage.getItem('logged_in_user');
  if (cached) {
    loginSuccess(JSON.parse(cached));
  }
}

// --- Navigation view router ---
function navigateToDefaultView() {
  if (State.user.role === 'CITIZEN') {
    navigateToView('citizen-dashboard');
  } else if (State.user.role === 'FIELD_OFFICER') {
    navigateToView('officer-dashboard');
  } else if (State.user.role === 'ADMIN') {
    navigateToView('admin-overview');
  }
}

window.navigateToView = function(viewName) {
  const views = [
    'citizen-dashboard', 'citizen-new-grievance', 'citizen-my-grievances', 
    'citizen-apply-certificate', 'citizen-track-applications',
    'officer-dashboard', 'officer-queue', 'officer-verifications',
    'admin-overview', 'admin-master-tasks', 'admin-departments', 'admin-directory'
  ];

  views.forEach(v => {
    const el = document.getElementById(`${v}-view`);
    if (el) el.classList.add('hidden');
  });

  const targetEl = document.getElementById(`${viewName}-view`);
  if (targetEl) targetEl.classList.remove('hidden');

  // Close mobile sidebar drawers
  const citizenSidebar = document.getElementById('citizen-sidebar');
  const officerSidebar = document.getElementById('officer-sidebar');
  const adminSidebar = document.getElementById('admin-sidebar');
  if (citizenSidebar) citizenSidebar.classList.remove('show-sidebar');
  if (officerSidebar) officerSidebar.classList.remove('show-sidebar');
  if (adminSidebar) adminSidebar.classList.remove('show-sidebar');

  // Header Title
  const titleEl = document.getElementById('header-page-title');
  if (titleEl) {
    const parts = viewName.split('-');
    parts.shift(); // remove role prefix
    titleEl.textContent = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  }

  // Sidebar Link Highlight
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-view') === viewName) {
      link.className = "nav-link flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all text-[#10B981] bg-[#080B11] border-l-4 border-[#10B981]";
    } else {
      link.className = "nav-link flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-slate-800/20 text-slate-400";
    }
  });

  loadViewData(viewName);
};

function setupNavigationEvents() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToView(link.getAttribute('data-view'));
    });
  });

  if (elements.mobileToggle) {
    elements.mobileToggle.addEventListener('click', () => {
      // Toggle sidebar based on role
      const role = State.user.role.toLowerCase().replace('_', '');
      const sidebar = document.getElementById(`${role}-sidebar`);
      if (sidebar) {
        sidebar.classList.toggle('show-sidebar');
      }
    });
  }
}

// --- Data dispatch router ---
function loadViewData(viewName) {
  if (!State.user) return;
  switch (viewName) {
    case 'citizen-dashboard':
      loadCitizenDashboard(State.user.email);
      break;
    case 'citizen-my-grievances':
      loadCitizenGrievances(State.user.email);
      break;
    case 'citizen-apply-certificate':
      renderDynamicCertFields(document.getElementById('cert-type') ? document.getElementById('cert-type').value : 'BIRTH_CERTIFICATE');
      break;
    case 'citizen-track-applications':
      loadCitizenApplications(State.user.citizenId);
      break;
    case 'officer-dashboard':
      loadOfficerDashboard(State.user.email);
      break;
    case 'officer-queue':
      loadOfficerQueue(State.user.email);
      break;
    case 'officer-verifications':
      loadOfficerVerifications();
      break;
    case 'admin-overview':
      loadAdminDashboard();
      break;
    case 'admin-master-tasks':
      loadAdminMasterTasks();
      break;
    case 'admin-departments':
      loadAdminDepartments();
      break;
    case 'admin-directory':
      loadAdminDirectory();
      break;
  }
}

// --- Helper Functions ---
function getDueDate(priority, createdAtStr) {
  const date = new Date(createdAtStr);
  let hours = 240; // LOW
  if (priority === 'HIGH') hours = 48;
  else if (priority === 'MEDIUM') hours = 120;
  return new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();
}

// --- Citizen Dashboard & Logic ---
async function loadCitizenDashboard(email) {
  let tickets = [];
  let certs = [];
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    tickets = db.grievances.filter(g => g.creatorEmail.toLowerCase() === email.toLowerCase());
    certs = db.serviceApplications.filter(a => a.citizenId === State.user.citizenId);
    
    // SLA breach check
    let changed = false;
    tickets.forEach(g => {
      if (g.status === 'OPEN' && new Date() > new Date(g.dueAt)) {
        g.status = 'EXPIRED/OVERDUE';
        changed = true;
        db.notifications.unshift({
          id: Date.now() + Math.random(),
          eventType: 'GRIEVANCE_OVERDUE',
          trackingNumber: g.trackingNumber,
          message: `Ticket ${g.trackingNumber} has breached SLA thresholds!`,
          recipientEmail: email,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
    });
    if (changed) saveSandboxData(db);
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances?creatorEmail=${encodeURIComponent(email)}`);
      tickets = await res.json();
      const certRes = await fetch(`${State.gatewayUrl}/api/services/citizen/${State.user.citizenId}`);
      certs = await certRes.json();
    } catch (e) { console.error(e); }
  }

  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'OPEN').length;
  const solved = tickets.filter(t => t.status === 'RESOLVED').length;
  const breaches = tickets.filter(t => t.status === 'EXPIRED/OVERDUE' || t.status === 'EXPIRED_OVERDUE').length;

  elements.citizenStatTotal.textContent = total;
  elements.citizenStatPending.textContent = pending;
  elements.citizenStatSolved.textContent = solved;
  elements.citizenStatBreaches.textContent = breaches;

  // Active grievances table
  elements.citizenActiveGrievancesTbody.innerHTML = '';
  const activeTickets = tickets.filter(t => t.status !== 'RESOLVED');
  if (activeTickets.length === 0) {
    elements.citizenActiveGrievancesTbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-xs text-slate-500">No active complaints.</td></tr>`;
  } else {
    activeTickets.slice(0, 5).forEach(t => {
      const priorityClass = t.priority === 'HIGH' ? 'priority-high' : (t.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low');
      const tr = document.createElement('tr');
      tr.className = "border-b border-slate-800/40 text-xs";
      tr.innerHTML = `
        <td class="p-4 font-mono text-cyan-400 font-bold">${t.trackingNumber}</td>
        <td class="p-4 text-slate-200 font-semibold">${escapeHTML(t.title)}</td>
        <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${priorityClass}">${t.priority}</span></td>
        <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold status-open">${t.status}</span></td>
      `;
      elements.citizenActiveGrievancesTbody.appendChild(tr);
    });
  }

  // Certificate applications table
  elements.citizenDashboardCertsTbody.innerHTML = '';
  if (certs.length === 0) {
    elements.citizenDashboardCertsTbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-xs text-slate-500">No applications filed.</td></tr>`;
  } else {
    certs.slice(0, 5).forEach(c => {
      let statusClass = 'bg-slate-800 text-slate-400';
      if (c.status === 'SUBMITTED') statusClass = 'bg-cyan-950 text-cyan-400 border border-cyan-800/30';
      else if (c.status === 'UNDER_VERIFICATION') statusClass = 'bg-amber-950 text-amber-400 border border-amber-800/30';
      else if (c.status === 'CERTIFICATE_GENERATED') statusClass = 'bg-emerald-950 text-emerald-400 border border-emerald-800/30';
      else if (c.status === 'DOWNLOADED') statusClass = 'bg-emerald-900 text-emerald-250';
      else if (c.status === 'REJECTED') statusClass = 'bg-rose-950 text-rose-400 border border-rose-900/40';

      const tr = document.createElement('tr');
      tr.className = "border-b border-slate-800/40 text-xs";
      tr.innerHTML = `
        <td class="p-4 font-mono text-cyan-400 font-bold">${c.applicationNumber}</td>
        <td class="p-4 text-slate-200 font-semibold">${c.serviceType.replace('_', ' ')}</td>
        <td class="p-4 text-slate-400">${escapeHTML(c.applicantName)}</td>
        <td class="p-4"><span class="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusClass}">${c.status.replace('_', ' ')}</span></td>
      `;
      elements.citizenDashboardCertsTbody.appendChild(tr);
    });
  }
}

async function loadCitizenGrievances(email) {
  let tickets = [];
  if (State.mode === 'SANDBOX') {
    tickets = getSandboxData().grievances.filter(g => g.creatorEmail.toLowerCase() === email.toLowerCase());
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances?creatorEmail=${encodeURIComponent(email)}`);
      tickets = await res.json();
    } catch (e) { console.error(e); }
  }

  elements.citizenMyGrievancesTbody.innerHTML = '';
  if (tickets.length === 0) {
    elements.citizenMyGrievancesTbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-sm text-slate-500">No grievances logged.</td></tr>`;
    return;
  }

  tickets.slice().reverse().forEach(t => {
    const statusClass = t.status === 'OPEN' ? 'status-open' : (t.status === 'RESOLVED' ? 'status-resolved' : 'status-overdue');
    const priorityClass = t.priority === 'HIGH' ? 'priority-high' : (t.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low');
    const resolvedText = t.resolvedAt ? `<br><span class="text-[9px] text-slate-500">Solved: ${new Date(t.resolvedAt).toLocaleDateString()}</span>` : '';

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/40 text-xs";
    tr.innerHTML = `
      <td class="p-4 font-mono text-cyan-400 font-bold">${t.trackingNumber}</td>
      <td class="p-4">
        <div class="font-semibold text-slate-200">${escapeHTML(t.title)}</div>
        <div class="text-[10px] text-slate-550 max-w-xs truncate">${escapeHTML(t.description)}</div>
      </td>
      <td class="p-4 text-slate-400">${t.category}</td>
      <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${priorityClass}">${t.priority}</span></td>
      <td class="p-4 text-slate-400">${new Date(t.createdAt).toLocaleDateString()}</td>
      <td class="p-4 text-slate-500">${new Date(t.dueAt).toLocaleDateString()}</td>
      <td class="p-4">
        <span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ${statusClass}">${t.status}</span>
        ${resolvedText}
      </td>
      <td class="p-4 text-slate-200 font-semibold">${t.assigneeEmail || '<span class="text-slate-600 italic">Pending Assignment</span>'}</td>
    `;
    elements.citizenMyGrievancesTbody.appendChild(tr);
  });
}

function setupGrievanceSubmission() {
  elements.lodgeGrievanceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('grievance-title').value.trim();
    const category = document.getElementById('grievance-category').value;
    const priority = document.getElementById('grievance-priority').value;
    const ward = document.getElementById('grievance-ward').value;
    const phone = document.getElementById('grievance-phone').value.trim();
    const street = document.getElementById('grievance-street').value.trim();
    const landmark = document.getElementById('grievance-landmark').value.trim();
    const city = document.getElementById('grievance-city').value.trim();
    const pincode = document.getElementById('grievance-pincode').value.trim();
    const rawDescription = document.getElementById('grievance-desc').value.trim();

    const locationText = `Address: ${street}${landmark ? ' (Landmark: ' + landmark + ')' : ''}, Ward: ${ward}, City: ${city}, PIN: ${pincode}`;
    const description = `${rawDescription}\n\n[Citizen Contact Phone: ${phone}]\n[Jurisdiction Ward: ${ward}]\n[Location Details: ${locationText}]`;

    const payload = { title, category, priority, description, creatorEmail: State.user.email };

    if (State.mode === 'SANDBOX') {
      const db = getSandboxData();
      const nextId = db.grievances.length > 0 ? Math.max(...db.grievances.map(g => g.id)) + 1 : 101;
      const trackingNumber = 'CPN-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + (Math.floor(Math.random()*900) + 100);
      const createdAt = new Date().toISOString();
      const dueAt = getDueDate(priority, createdAt);

      // Auto assign to department officer if available
      const deptOfficer = db.users.find(u => u.role === 'FIELD_OFFICER' && u.department === category);
      const assigneeEmail = deptOfficer ? deptOfficer.email : null;

      db.grievances.push({
        id: nextId,
        trackingNumber,
        title,
        description,
        street,
        landmark,
        city,
        pincode,
        category,
        priority,
        status: 'OPEN',
        creatorEmail: State.user.email,
        assigneeEmail,
        createdAt,
        dueAt,
        resolvedAt: null
      });

      db.notifications.unshift({
        id: Date.now() + Math.random(),
        eventType: 'GRIEVANCE_FILED',
        trackingNumber,
        message: `New ${priority} Priority grievance filed for ${category}: ${trackingNumber}`,
        recipientEmail: assigneeEmail || 'admin@civicpulse.gov',
        timestamp: new Date().toISOString(),
        read: false
      });

      saveSandboxData(db);
      elements.lodgeGrievanceForm.reset();
      navigateToView('citizen-my-grievances');
    } else {
      try {
        const res = await fetch(`${State.gatewayUrl}/api/v1/grievances`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          elements.lodgeGrievanceForm.reset();
          navigateToView('citizen-my-grievances');
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
}

// --- Citizen Certificate Stepper & Tracking ---
async function loadCitizenApplications(citizenId) {
  if (!citizenId) return;
  let apps = [];
  if (State.mode === 'SANDBOX') {
    apps = getSandboxData().serviceApplications.filter(a => a.citizenId === Number(citizenId));
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/services/citizen/${citizenId}`);
      apps = await res.json();
    } catch (e) { console.error(e); }
  }

  elements.citizenTrackTbody.innerHTML = '';
  if (apps.length === 0) {
    elements.citizenTrackTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">No certificate requests filed.</td></tr>`;
    return;
  }

  apps.slice().reverse().forEach(a => {
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/40 text-xs text-slate-300 cursor-pointer hover:bg-slate-850";
    tr.innerHTML = `
      <td class="p-4 font-mono text-cyan-400 font-bold">${a.applicationNumber}</td>
      <td class="p-4 font-bold text-slate-200">${a.serviceType.replace(/_/g, ' ')}</td>
      <td class="p-4">${escapeHTML(a.applicantName)}</td>
      <td class="p-4 text-slate-500">${new Date(a.appliedDate).toLocaleDateString()}</td>
      <td class="p-4 text-right">
        <button onclick="selectApplicationToTrack(${a.id})" class="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-bold">
          Track Flow
        </button>
      </td>
    `;
    elements.citizenTrackTbody.appendChild(tr);
  });

  if (State.selectedApplicationId) {
    const selected = apps.find(a => a.id === State.selectedApplicationId);
    if (selected) {
      renderApplicationStepper(selected);
    }
  } else if (apps.length > 0) {
    selectApplicationToTrack(apps[apps.length - 1].id);
  }
}

window.selectApplicationToTrack = function(id) {
  State.selectedApplicationId = id;
  if (State.mode === 'SANDBOX') {
    const app = getSandboxData().serviceApplications.find(a => a.id === id);
    if (app) renderApplicationStepper(app);
  } else {
    fetch(`${State.gatewayUrl}/api/services/citizen/${State.user.citizenId}`)
      .then(res => res.json())
      .then(apps => {
        const app = apps.find(a => a.id === id);
        if (app) renderApplicationStepper(app);
      }).catch(e => console.error(e));
  }
};

function renderApplicationStepper(app) {
  elements.stepperAppId.textContent = `${app.applicationNumber} - ${app.serviceType.replace(/_/g, ' ')}`;
  
  const steps = [
    { key: 'SUBMITTED', label: '1. Submitted for Intake', desc: 'Application received at department pool.' },
    { key: 'UNDER_VERIFICATION', label: '2. Under Verification', desc: 'Documents undergoing official scrutiny.' },
    { key: 'VERIFIED', label: '3. Verified credentials', desc: 'Officer verified credentials & identity check.' },
    { key: 'APPROVED', label: '4. Approved by Department', desc: 'Approved for watermark printing.' },
    { key: 'CERTIFICATE_GENERATED', label: '5. Certificate Generated', desc: 'Watermark digital file generated.' },
    { key: 'DOWNLOADED', label: '6. Downloaded & Issued', desc: 'Official certificate printed/issued.' }
  ];

  let activeIndex = 0;
  if (app.status === 'SUBMITTED') activeIndex = 0;
  else if (app.status === 'UNDER_VERIFICATION') activeIndex = 1;
  else if (app.status === 'VERIFIED') activeIndex = 2;
  else if (app.status === 'APPROVED') activeIndex = 3;
  else if (app.status === 'CERTIFICATE_GENERATED') activeIndex = 4;
  else if (app.status === 'DOWNLOADED') activeIndex = 5;
  else if (app.status === 'REJECTED') activeIndex = -1;

  elements.verticalStepperWrapper.innerHTML = '';
  
  if (app.status === 'REJECTED') {
    elements.verticalStepperWrapper.innerHTML = `
      <div class="relative pl-6 border-l-2 border-rose-800">
        <span class="absolute -left-2 top-0.5 w-4 h-4 bg-rose-600 rounded-full border-4 border-slate-950 flex items-center justify-center"></span>
        <h4 class="text-xs font-bold text-rose-500">APPLICATION REJECTED</h4>
        <p class="text-[10px] text-rose-400 mt-1 leading-normal font-medium bg-rose-950/20 p-3 rounded-lg border border-rose-900/40">
          Reason: ${escapeHTML(app.rejectionReason)}
        </p>
      </div>
    `;
    elements.stepperDownloadAction.innerHTML = `
      <div class="text-center text-[10px] text-slate-500 py-2 italic font-semibold">
        <i class="fa-solid fa-ban text-rose-500 mr-1"></i> Cannot download rejected document.
      </div>
    `;
    return;
  }

  steps.forEach((step, idx) => {
    const isCompleted = idx <= activeIndex;
    const isCurrent = idx === activeIndex;
    
    let circleColor = 'bg-slate-800 border-slate-700';
    let labelColor = 'text-slate-500';
    
    if (isCurrent) {
      circleColor = 'bg-[#10B981] border-[#10B981] shadow-lg shadow-[#10B981]/25 ring-4 ring-[#10B981]/15';
      labelColor = 'text-slate-100 font-bold';
    } else if (isCompleted) {
      circleColor = 'bg-[#10B981]/20 border-[#10B981]';
      labelColor = 'text-slate-350';
    }

    const stepDiv = document.createElement('div');
    stepDiv.className = "relative pl-6";
    stepDiv.innerHTML = `
      <span class="absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 ${circleColor} flex items-center justify-center">
        ${isCompleted && !isCurrent ? '<i class="fa-solid fa-check text-[8px] text-[#10B981]"></i>' : ''}
      </span>
      <h4 class="text-xs font-semibold ${labelColor}">${step.label}</h4>
      <p class="text-[10px] text-slate-500 mt-0.5 leading-normal">${step.desc}</p>
      ${idx === 5 && app.certificateNumber ? `<p class="text-[9px] font-mono text-cyan-400 font-semibold mt-1">Ref: ${app.certificateNumber} (Issued: ${app.downloadCount} times)</p>` : ''}
    `;
    elements.verticalStepperWrapper.appendChild(stepDiv);
  });

  elements.stepperDownloadAction.innerHTML = '';
  if (app.status === 'CERTIFICATE_GENERATED' || app.status === 'DOWNLOADED') {
    elements.stepperDownloadAction.innerHTML = `
      <button onclick="downloadCertificate(${app.id})" class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-900 font-extrabold rounded-xl shadow-lg active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2">
        <i class="fa-solid fa-print"></i> Download & Print Official Certificate
      </button>
    `;
  } else {
    elements.stepperDownloadAction.innerHTML = `
      <div class="text-center text-[10px] text-slate-500 py-2 italic font-semibold">
        <i class="fa-solid fa-hourglass-half text-amber-500 mr-1"></i> Verification in progress.
      </div>
    `;
  }
}

window.renderDynamicCertFields = function(certType) {
  const container = document.getElementById('dynamic-cert-fields-container');
  if (!container) return;

  if (certType === 'DEATH_CERTIFICATE') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Deceased Full Name</label>
          <input type="text" id="cert-deceased-name" placeholder="e.g. Late John Smith" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Death & Age</label>
          <div class="flex gap-2">
            <input type="date" id="cert-dod" class="w-2/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <input type="number" id="cert-age" placeholder="Age" min="0" max="130" class="w-1/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender & Cause of Death</label>
          <div class="flex gap-2">
            <select id="cert-gender" class="w-1/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white appearance-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input type="text" id="cert-cause-death" placeholder="e.g. Natural Causes / Cardiac Arrest" class="w-2/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Place of Death (Hospital / Residence)</label>
          <input type="text" id="cert-death-place" placeholder="e.g. City General Hospital, Ward 4" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informant / Applicant Name & Relation</label>
          <div class="flex gap-2">
            <input type="text" id="cert-applicant-name" placeholder="Informant Name" class="w-2/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <input type="text" id="cert-informant-relation" placeholder="Relation (Son/Spouse)" class="w-1/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Informant Aadhaar ID (12 digits)</label>
          <input type="text" id="cert-aadhaar" placeholder="1234 5678 9012" maxlength="12" pattern="\\d{12}" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
        </div>
      </div>
    `;
  } else if (certType === 'BIRTH_CERTIFICATE') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Child Full Name</label>
          <input type="text" id="cert-child-name" placeholder="e.g. Baby Jane Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date of Birth & Gender</label>
          <div class="flex gap-2">
            <input type="date" id="cert-dob" class="w-2/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <select id="cert-gender" class="w-1/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white appearance-none">
              <option value="Male">Male</option>
              <option value="Female" selected>Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mother's Full Name</label>
          <input type="text" id="cert-mother-name" placeholder="e.g. Mary Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Father's Full Name</label>
          <input type="text" id="cert-father-name" placeholder="e.g. Robert Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Place of Birth (Hospital / Address)</label>
          <input type="text" id="cert-birth-place" placeholder="e.g. St. Jude Maternity Hospital, Ward 12" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Parent Aadhaar ID (12 digits)</label>
          <input type="text" id="cert-aadhaar" placeholder="1234 5678 9012" maxlength="12" pattern="\\d{12}" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
        </div>
      </div>
    `;
  } else if (certType === 'INCOME_CERTIFICATE') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Applicant Full Name</label>
          <input type="text" id="cert-applicant-name" placeholder="e.g. Jane Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Father's / Husband's Name</label>
          <input type="text" id="cert-father-name" placeholder="e.g. Robert Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Occupation & Income Source</label>
          <input type="text" id="cert-occupation" placeholder="e.g. Private Service / Business" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Annual Family Income (₹) & Family Members</label>
          <div class="flex gap-2">
            <input type="number" id="cert-annual-income" placeholder="Annual ₹" min="0" class="w-2/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <input type="number" id="cert-family-members" placeholder="Members" min="1" max="20" class="w-1/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aadhaar Number & Ration Card</label>
          <div class="flex gap-2">
            <input type="text" id="cert-aadhaar" placeholder="Aadhaar 12 digits" maxlength="12" pattern="\\d{12}" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
            <input type="text" id="cert-voterid" placeholder="Ration Card No." class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Statutory Purpose</label>
          <input type="text" id="cert-purpose" placeholder="e.g. Higher Education Scholarship" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
    `;
  } else if (certType === 'RESIDENCE_CERTIFICATE') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Applicant Full Name</label>
          <input type="text" id="cert-applicant-name" placeholder="e.g. Jane Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Father's / Husband's Name & Years Resident</label>
          <div class="flex gap-2">
            <input type="text" id="cert-father-name" placeholder="Father Name" class="w-2/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <input type="number" id="cert-years-residence" placeholder="Years" min="1" max="100" class="w-1/3 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Complete Residential Address</label>
          <input type="text" id="cert-residence-address" placeholder="Door No., Street, Landmark, PIN Code" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Municipal Ward / Zone</label>
          <select id="cert-ward" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white appearance-none">
            <option value="Ward 1 (North Metro)">Ward 1 - North Zone</option>
            <option value="Ward 2 (South Boulevard)">Ward 2 - South Zone</option>
            <option value="Ward 3 (East Sector)">Ward 3 - East Zone</option>
            <option value="Ward 4 (West Precinct)">Ward 4 - West Zone</option>
            <option value="Ward 5 (Central Civic)" selected>Ward 5 - Central Zone</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Aadhaar ID & Voter Card No.</label>
          <div class="flex gap-2">
            <input type="text" id="cert-aadhaar" placeholder="Aadhaar 12 digits" maxlength="12" pattern="\\d{12}" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
            <input type="text" id="cert-voterid" placeholder="Voter ID No." class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Purpose of Domicile</label>
          <input type="text" id="cert-purpose" placeholder="e.g. Government Employment Application" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
    `;
  } else if (certType === 'CASTE_CERTIFICATE') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Applicant Full Name</label>
          <input type="text" id="cert-applicant-name" placeholder="e.g. Jane Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Father's Name</label>
          <input type="text" id="cert-father-name" placeholder="e.g. Robert Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Caste Category & Sub-Caste Name</label>
          <div class="flex gap-2">
            <select id="cert-caste-cat" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white appearance-none">
              <option value="OBC / Backward Class">OBC / BC</option>
              <option value="Scheduled Caste (SC)">SC</option>
              <option value="Scheduled Tribe (ST)">ST</option>
              <option value="Economically Weaker Section (EWS)">EWS</option>
            </select>
            <input type="text" id="cert-subcaste" placeholder="Sub-Caste Name" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Religion & Aadhaar ID</label>
          <div class="flex gap-2">
            <input type="text" id="cert-religion" placeholder="Religion" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <input type="text" id="cert-aadhaar" placeholder="Aadhaar 12 digits" maxlength="12" pattern="\\d{12}" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
          </div>
        </div>
      </div>
    `;
  } else if (certType === 'TRADE_LICENSE') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Commercial Business / Trade Name</label>
          <input type="text" id="cert-trade-name" placeholder="e.g. Nexus Apex Retail Logistics" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nature of Trade / Industry Category</label>
          <input type="text" id="cert-trade-nature" placeholder="e.g. Commercial Supermarket & Food Outlet" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Owner / Proprietor Full Name</label>
          <input type="text" id="cert-applicant-name" placeholder="e.g. Jane Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Premises Area (Sq. Ft.) & GSTIN</label>
          <div class="flex gap-2">
            <input type="number" id="cert-trade-area" placeholder="Sq. Ft." min="50" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
            <input type="text" id="cert-gstin" placeholder="GSTIN / Reg No." class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Trade Premises Address</label>
          <input type="text" id="cert-trade-address" placeholder="Commercial Complex, Street, Ward" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Proprietor Aadhaar ID (12 digits)</label>
          <input type="text" id="cert-aadhaar" placeholder="1234 5678 9012" maxlength="12" pattern="\\d{12}" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
        </div>
      </div>
    `;
  } else if (certType === 'BUILDING_PERMIT') {
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Property Owner Name</label>
          <input type="text" id="cert-applicant-name" placeholder="e.g. Jane Doe" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Survey / Plot Number</label>
          <input type="text" id="cert-plot-no" placeholder="e.g. Plot #402, Sy No. 182/A" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Construction Type & Built-up Area</label>
          <div class="flex gap-2">
            <select id="cert-building-type" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white appearance-none">
              <option value="Residential (G+2)">Residential (G+2)</option>
              <option value="Commercial Complex">Commercial</option>
              <option value="Mixed Use Development">Mixed Use</option>
              <option value="Industrial Shed">Industrial</option>
            </select>
            <input type="number" id="cert-built-area" placeholder="Built Area Sq.Ft" min="100" class="w-1/2 px-3 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Licensed Architect / Engineer</label>
          <input type="text" id="cert-architect-name" placeholder="e.g. Ar. David Vance (CoA Reg 9812)" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white" required>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Municipal Ward / Zone</label>
          <select id="cert-ward" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white appearance-none">
            <option value="Ward 1 (North Metro)">Ward 1 - North Zone</option>
            <option value="Ward 2 (South Boulevard)">Ward 2 - South Zone</option>
            <option value="Ward 3 (East Sector)">Ward 3 - East Zone</option>
            <option value="Ward 4 (West Precinct)">Ward 4 - West Zone</option>
            <option value="Ward 5 (Central Civic)">Ward 5 - Central Zone</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Owner Aadhaar ID (12 digits)</label>
          <input type="text" id="cert-aadhaar" placeholder="1234 5678 9012" maxlength="12" pattern="\\d{12}" class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-[#10B981] text-sm text-white font-mono" required>
        </div>
      </div>
    `;
  } else {
    renderDynamicCertFields('BIRTH_CERTIFICATE');
  }
};

function setupCertificateSubmission() {
  elements.applyCertificateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    elements.duplicateWarningBlock.classList.add('hidden');
    elements.certSuccessBlock.classList.add('hidden');

    const serviceType = document.getElementById('cert-type').value;
    let applicantName = '';
    let aadhaarNumber = '';
    let details = {};

    if (serviceType === 'DEATH_CERTIFICATE') {
      const deceasedName = document.getElementById('cert-deceased-name').value.trim();
      const dod = document.getElementById('cert-dod').value;
      const age = document.getElementById('cert-age').value;
      const gender = document.getElementById('cert-gender').value;
      const causeOfDeath = document.getElementById('cert-cause-death').value.trim();
      const placeOfDeath = document.getElementById('cert-death-place').value.trim();
      const informantName = document.getElementById('cert-applicant-name').value.trim();
      const informantRelation = document.getElementById('cert-informant-relation').value.trim();
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();
      applicantName = deceasedName;

      details = { deceasedName, dod, age, gender, causeOfDeath, placeOfDeath, informantName, informantRelation, informantAadhaar: aadhaarNumber };
    } else if (serviceType === 'BIRTH_CERTIFICATE') {
      const childName = document.getElementById('cert-child-name').value.trim();
      const dob = document.getElementById('cert-dob').value;
      const gender = document.getElementById('cert-gender').value;
      const motherName = document.getElementById('cert-mother-name').value.trim();
      const fatherName = document.getElementById('cert-father-name').value.trim();
      const birthPlace = document.getElementById('cert-birth-place').value.trim();
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();
      applicantName = childName;

      details = { childName, dob, gender, motherName, fatherName, birthPlace, parentAadhaar: aadhaarNumber };
    } else if (serviceType === 'INCOME_CERTIFICATE') {
      applicantName = document.getElementById('cert-applicant-name').value.trim();
      const fatherName = document.getElementById('cert-father-name').value.trim();
      const occupation = document.getElementById('cert-occupation').value.trim();
      const annualIncome = document.getElementById('cert-annual-income').value;
      const familyMembers = document.getElementById('cert-family-members').value;
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();
      const voterid = document.getElementById('cert-voterid').value.trim();
      const purpose = document.getElementById('cert-purpose').value.trim();

      details = { applicantName, fatherName, occupation, annualIncome, familyMembers, aadhaarNumber, voterid, purpose };
    } else if (serviceType === 'RESIDENCE_CERTIFICATE') {
      applicantName = document.getElementById('cert-applicant-name').value.trim();
      const fatherName = document.getElementById('cert-father-name').value.trim();
      const yearsResidence = document.getElementById('cert-years-residence').value;
      const residenceAddress = document.getElementById('cert-residence-address').value.trim();
      const ward = document.getElementById('cert-ward').value;
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();
      const voterid = document.getElementById('cert-voterid').value.trim();
      const purpose = document.getElementById('cert-purpose').value.trim();

      details = { applicantName, fatherName, yearsResidence, residenceAddress, ward, aadhaarNumber, voterid, purpose };
    } else if (serviceType === 'CASTE_CERTIFICATE') {
      applicantName = document.getElementById('cert-applicant-name').value.trim();
      const fatherName = document.getElementById('cert-father-name').value.trim();
      const casteCat = document.getElementById('cert-caste-cat').value;
      const subcaste = document.getElementById('cert-subcaste').value.trim();
      const religion = document.getElementById('cert-religion').value.trim();
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();

      details = { applicantName, fatherName, casteCat, subcaste, religion, aadhaarNumber };
    } else if (serviceType === 'TRADE_LICENSE') {
      const tradeName = document.getElementById('cert-trade-name').value.trim();
      const tradeNature = document.getElementById('cert-trade-nature').value.trim();
      applicantName = document.getElementById('cert-applicant-name').value.trim();
      const tradeArea = document.getElementById('cert-trade-area').value;
      const gstin = document.getElementById('cert-gstin').value.trim();
      const tradeAddress = document.getElementById('cert-trade-address').value.trim();
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();

      details = { tradeName, tradeNature, ownerName: applicantName, tradeArea, gstin, tradeAddress, ownerAadhaar: aadhaarNumber };
    } else if (serviceType === 'BUILDING_PERMIT') {
      applicantName = document.getElementById('cert-applicant-name').value.trim();
      const plotNo = document.getElementById('cert-plot-no').value.trim();
      const buildingType = document.getElementById('cert-building-type').value;
      const builtArea = document.getElementById('cert-built-area').value;
      const architectName = document.getElementById('cert-architect-name').value.trim();
      const ward = document.getElementById('cert-ward').value;
      aadhaarNumber = document.getElementById('cert-aadhaar').value.trim();

      details = { ownerName: applicantName, plotNo, buildingType, builtArea, architectName, ward, ownerAadhaar: aadhaarNumber };
    }

    const payload = {
      citizenId: State.user.citizenId,
      serviceType,
      applicantName,
      aadhaarNumber,
      details
    };

    if (State.mode === 'SANDBOX') {
      const db = getSandboxData();
      const duplicate = db.serviceApplications.find(a => a.citizenId === State.user.citizenId && a.serviceType === serviceType && a.status !== 'REJECTED');
      if (duplicate) {
        elements.duplicateWarningBlock.classList.remove('hidden');
        return;
      }

      const nextId = db.serviceApplications.length > 0 ? Math.max(...db.serviceApplications.map(a => a.id)) + 1 : 1;
      const appNum = 'APP-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + (Math.floor(Math.random()*9000) + 1000);

      db.serviceApplications.push({
        id: nextId,
        applicationNumber: appNum,
        citizenId: State.user.citizenId,
        serviceType,
        applicantName,
        aadhaarNumber,
        details,
        status: 'SUBMITTED',
        verificationStatus: 'PENDING',
        approvalStatus: 'PENDING',
        certificateNumber: null,
        appliedDate: new Date().toISOString(),
        approvedDate: null,
        downloadCount: 0,
        rejectionReason: null
      });

      db.notifications.unshift({
        id: Date.now() + Math.random(),
        eventType: 'CERTIFICATE_APPLIED',
        trackingNumber: appNum,
        message: `New certificate application ${appNum} filed for ${serviceType.replace(/_/g, ' ')}`,
        recipientEmail: 'admin@civicpulse.gov',
        timestamp: new Date().toISOString(),
        read: false
      });

      saveSandboxData(db);
      elements.certSuccessBlock.textContent = "Application submitted successfully! Redirecting to tracker...";
      elements.certSuccessBlock.classList.remove('hidden');
      elements.applyCertificateForm.reset();
      
      setTimeout(() => {
        State.selectedApplicationId = nextId;
        navigateToView('citizen-track-applications');
      }, 1500);
    } else {
      try {
        const res = await fetch(`${State.gatewayUrl}/api/services/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (res.status === 409 || (data.error && data.error.includes("already"))) {
          elements.duplicateWarningBlock.classList.remove('hidden');
        } else if (res.ok) {
          elements.certSuccessBlock.textContent = "Application submitted successfully! Redirecting to tracker...";
          elements.certSuccessBlock.classList.remove('hidden');
          elements.applyCertificateForm.reset();
          
          setTimeout(() => {
            State.selectedApplicationId = data.id;
            navigateToView('citizen-track-applications');
          }, 1500);
        } else {
          alert(data.error || "Submission failed.");
        }
      } catch (err) {
        alert("Gateway or network error.");
      }
    }
  });
}

window.downloadCertificate = async function(appId) {
  let app = null;
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    app = db.serviceApplications.find(a => a.id === appId);
    if (app) {
      app.downloadCount++;
      app.status = 'DOWNLOADED';
      saveSandboxData(db);
      loadCitizenApplications(State.user.citizenId);
    }
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/services/download/${appId}`);
      if (res.ok) {
        app = await res.json();
        loadCitizenApplications(State.user.citizenId);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to download certificate.");
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  if (app) {
    triggerPrintableCertificate(app);
  }
};

function triggerPrintableCertificate(app) {
  const printWindow = window.open('', '_blank', 'width=950,height=1050');
  if (!printWindow) {
    alert("Please allow popups to view and print your certificate.");
    return;
  }

  const issueDate = app.approvedDate ? new Date(app.approvedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const serviceTitle = app.serviceType.replace(/_/g, ' ');
  const details = typeof app.details === 'string' ? JSON.parse(app.details) : (app.details || {});

  let tableRowsHTML = '';
  if (app.serviceType === 'DEATH_CERTIFICATE') {
    tableRowsHTML = `
      <tr><td class="label">Deceased Full Name</td><td><strong>${escapeHTML(details.deceasedName || app.applicantName)}</strong></td></tr>
      <tr><td class="label">Date of Death & Age</td><td>${details.dod || '2026-07-01'} (Age: ${details.age || '68'} years)</td></tr>
      <tr><td class="label">Gender & Cause of Death</td><td>${details.gender || 'Male'} (${escapeHTML(details.causeOfDeath || 'Natural Causes')})</td></tr>
      <tr><td class="label">Place of Death</td><td>${escapeHTML(details.placeOfDeath || 'City General Hospital, Ward 4')}</td></tr>
      <tr><td class="label">Informant / Applicant Name</td><td>${escapeHTML(details.informantName || 'Jane Doe')} (${escapeHTML(details.informantRelation || 'Child')})</td></tr>
      <tr><td class="label">Informant Aadhaar ID</td><td><span style="font-family:monospace; font-weight:bold;">${details.informantAadhaar || app.aadhaarNumber}</span></td></tr>
    `;
  } else if (app.serviceType === 'BIRTH_CERTIFICATE') {
    tableRowsHTML = `
      <tr><td class="label">Child Full Name</td><td><strong>${escapeHTML(details.childName || app.applicantName)}</strong></td></tr>
      <tr><td class="label">Date of Birth & Gender</td><td>${details.dob || app.dob || '1998-05-14'} (${details.gender || app.gender || 'Female'})</td></tr>
      <tr><td class="label">Mother's Name</td><td>${escapeHTML(details.motherName || 'Mary Doe')}</td></tr>
      <tr><td class="label">Father's Name</td><td>${escapeHTML(details.fatherName || app.fatherName || 'Robert Doe')}</td></tr>
      <tr><td class="label">Place of Birth / Hospital</td><td>${escapeHTML(details.birthPlace || 'Metropolis General Hospital')}</td></tr>
      <tr><td class="label">Parent Aadhaar ID</td><td><span style="font-family:monospace; font-weight:bold;">${details.parentAadhaar || app.aadhaarNumber}</span></td></tr>
    `;
  } else if (app.serviceType === 'INCOME_CERTIFICATE') {
    tableRowsHTML = `
      <tr><td class="label">Applicant Full Name</td><td><strong>${escapeHTML(details.applicantName || app.applicantName)}</strong></td></tr>
      <tr><td class="label">Father's / Husband's Name</td><td>${escapeHTML(details.fatherName || app.fatherName || 'Robert Doe')}</td></tr>
      <tr><td class="label">Occupation & Primary Source</td><td>${escapeHTML(details.occupation || 'Private Employment')}</td></tr>
      <tr><td class="label">Certified Annual Income</td><td><strong>₹ ${Number(details.annualIncome || 250000).toLocaleString('en-IN')} /-</strong> (Family Members: ${details.familyMembers || 4})</td></tr>
      <tr><td class="label">Aadhaar & Ration Card No.</td><td><span style="font-family:monospace; font-weight:bold;">${details.aadhaarNumber || app.aadhaarNumber}</span> (${details.voterid || app.voterid || 'N/A'})</td></tr>
      <tr><td class="label">Statutory Purpose</td><td>${escapeHTML(details.purpose || app.purpose || 'Scholarship / Education Clearance')}</td></tr>
    `;
  } else if (app.serviceType === 'TRADE_LICENSE') {
    tableRowsHTML = `
      <tr><td class="label">Commercial Business Name</td><td><strong>${escapeHTML(details.tradeName || 'Nexus Commercial Outlets')}</strong></td></tr>
      <tr><td class="label">Nature of Trade / Category</td><td>${escapeHTML(details.tradeNature || 'Retail & Logistics')}</td></tr>
      <tr><td class="label">Proprietor / Owner Name</td><td>${escapeHTML(details.ownerName || app.applicantName)}</td></tr>
      <tr><td class="label">Premises Address & Area</td><td>${escapeHTML(details.tradeAddress || '12 City Center Mall')} (${details.tradeArea || '1200'} Sq. Ft.)</td></tr>
      <tr><td class="label">GSTIN / Business Reg No.</td><td><span style="font-family:monospace; font-weight:bold;">${details.gstin || '36AAACB1234C1Z5'}</span></td></tr>
      <tr><td class="label">Proprietor Aadhaar ID</td><td><span style="font-family:monospace; font-weight:bold;">${details.ownerAadhaar || app.aadhaarNumber}</span></td></tr>
    `;
  } else if (app.serviceType === 'BUILDING_PERMIT') {
    tableRowsHTML = `
      <tr><td class="label">Property Owner Name</td><td><strong>${escapeHTML(details.ownerName || app.applicantName)}</strong></td></tr>
      <tr><td class="label">Survey & Plot Number</td><td>${escapeHTML(details.plotNo || 'Plot #402, Sy No. 182/A')}</td></tr>
      <tr><td class="label">Construction Classification</td><td>${escapeHTML(details.buildingType || 'Residential (G+2)')}</td></tr>
      <tr><td class="label">Approved Built-up Area</td><td><strong>${details.builtArea || '2400'} Sq. Ft.</strong></td></tr>
      <tr><td class="label">Licensed Architect / Engineer</td><td>${escapeHTML(details.architectName || 'Ar. David Vance (CoA Reg 9812)')}</td></tr>
      <tr><td class="label">Municipal Jurisdiction</td><td>${escapeHTML(details.ward || 'Ward 5 - Central Zone')}</td></tr>
      <tr><td class="label">Owner Aadhaar ID</td><td><span style="font-family:monospace; font-weight:bold;">${details.ownerAadhaar || app.aadhaarNumber}</span></td></tr>
    `;
  } else {
    tableRowsHTML = `
      <tr><td class="label">Full Name of Applicant</td><td><strong>${escapeHTML(app.applicantName)}</strong></td></tr>
      <tr><td class="label">Father's / Husband's Name</td><td>${escapeHTML(details.fatherName || app.fatherName || 'Robert Doe')}</td></tr>
      <tr><td class="label">Aadhaar National ID</td><td><span style="font-family:monospace; font-weight:bold;">${app.aadhaarNumber}</span></td></tr>
      <tr><td class="label">Voter ID / Ration Card</td><td><span style="font-family:monospace; font-weight:bold;">${details.voterid || app.voterid || 'VTR-98765432'}</span></td></tr>
      <tr><td class="label">Region & Jurisdiction</td><td>${escapeHTML(details.residenceAddress || details.region || app.region || 'Central District, Ward 12, State Metro')}</td></tr>
      <tr><td class="label">Statutory Purpose</td><td>${escapeHTML(details.purpose || app.purpose || 'Official Verification & Registration Clearance')}</td></tr>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${serviceTitle} - ${app.certificateNumber || app.applicationNumber}</title>
      <style>
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: 'Georgia', 'Times New Roman', serif; background: #faf8f5; color: #1a1a1a; margin: 0; padding: 25px; }
        .cert-container { border: 12px double #b8860b; padding: 35px; position: relative; background: #fffdf9; box-shadow: inset 0 0 50px rgba(184,134,11,0.12); }
        .inner-border { border: 2px solid #b8860b; padding: 30px; position: relative; }
        .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 54px; font-weight: bold; color: rgba(184,134,11,0.06); text-transform: uppercase; white-space: nowrap; pointer-events: none; }
        .header { text-align: center; border-bottom: 2px double #8b6508; padding-bottom: 20px; margin-bottom: 25px; }
        .emblem-icon { font-size: 48px; color: #8b6508; margin-bottom: 8px; }
        .gov-title { font-size: 18px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #4a2c11; }
        .dept-title { font-size: 13px; font-weight: bold; color: #704214; margin-top: 5px; letter-spacing: 1px; }
        .cert-name { font-size: 28px; font-weight: bold; text-transform: uppercase; margin: 25px 0 10px; color: #8b0000; letter-spacing: 2px; text-align: center; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }
        .cert-num { font-size: 13px; font-family: monospace; font-weight: bold; color: #333; text-align: center; margin-bottom: 30px; background: #fdf5e6; padding: 6px 15px; border-radius: 4px; display: inline-block; width: fit-content; margin-left: auto; margin-right: auto; border: 1px solid #e6c280; }
        .content-body { font-size: 15px; line-height: 1.8; text-align: justify; margin: 25px 0; color: #2c2c2c; }
        .details-grid { width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px; }
        .details-grid td { padding: 10px 14px; border: 1px solid #d2b48c; }
        .details-grid td.label { font-weight: bold; background: #faebd7; width: 35%; color: #4a2c11; }
        .footer-sec { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 45px; pt-20px; }
        .qr-sec { text-align: center; }
        .qr-placeholder { width: 95px; height: 95px; border: 1px solid #999; background: #fff; padding: 6px; display: inline-block; border-radius: 6px; }
        .seal-sec { text-align: center; }
        .seal-circle { width: 100px; height: 100px; border: 3px double #8b0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #8b0000; font-size: 11px; font-weight: bold; text-transform: uppercase; margin: 0 auto; line-height: 1.3; transform: rotate(-10deg); box-shadow: 0 0 10px rgba(139,0,0,0.1); }
        .sig-sec { text-align: center; width: 230px; }
        .sig-line { border-top: 1px solid #333; margin-top: 45px; pt-5px; font-size: 12px; font-weight: bold; color: #222; }
        .btn-print { background: #006633; color: #fff; border: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 8px; cursor: pointer; margin-bottom: 20px; float: right; box-shadow: 0 4px 12px rgba(0,102,51,0.3); }
        .btn-print:hover { background: #004d26; }
        @media print { .btn-print { display: none; } body { padding: 0; background: #fff; } }
      </style>
    </head>
    <body>
      <button class="btn-print" onclick="window.print()">🖨️ Print / Save as Official PDF</button>
      <div style="clear:both;"></div>

      <div class="cert-container">
        <div class="inner-border">
          <div class="watermark">CivicPulse Official Government Registry</div>

          <div class="header">
            <div class="emblem-icon">🏛️</div>
            <div class="gov-title">Government of Metropolis Municipal Corporation</div>
            <div class="dept-title">DEPARTMENT OF PUBLIC RECORDS & MUNICIPAL ARCHIVES</div>
          </div>

          <div style="text-align:center;">
            <div class="cert-name">${serviceTitle}</div>
            <div class="cert-num">REGISTRATION NO: ${app.certificateNumber || 'OFFICIAL-GEN-PENDING'} | APP REF: ${app.applicationNumber}</div>
          </div>

          <div class="content-body">
            This is to officially certify under statutory municipal records that the record identified below has been verified and registered in accordance with statutory provisions of the Municipal Corporation Act.
          </div>

          <table class="details-grid">
            ${tableRowsHTML}
            <tr>
              <td class="label">Verification Status</td>
              <td><strong style="color: #006633;">OFFICIALLY VERIFIED & REGISTERED</strong></td>
            </tr>
            <tr>
              <td class="label">Date of Official Issuance</td>
              <td>${issueDate}</td>
            </tr>
          </table>

          <div class="footer-sec">
            <div class="qr-sec">
              <div class="qr-placeholder">
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <rect width="100" height="100" fill="#fff"/>
                  <rect x="10" y="10" width="25" height="25" fill="#000"/>
                  <rect x="15" y="15" width="15" height="15" fill="#fff"/>
                  <rect x="65" y="10" width="25" height="25" fill="#000"/>
                  <rect x="70" y="15" width="15" height="15" fill="#fff"/>
                  <rect x="10" y="65" width="25" height="25" fill="#000"/>
                  <rect x="15" y="70" width="15" height="15" fill="#fff"/>
                  <rect x="40" y="40" width="20" height="20" fill="#000"/>
                  <rect x="65" y="65" width="15" height="15" fill="#000"/>
                  <rect x="45" y="15" width="10" height="20" fill="#000"/>
                  <rect x="15" y="45" width="20" height="10" fill="#000"/>
                </svg>
              </div>
              <div style="font-size: 9px; font-family: monospace; margin-top: 4px; color: #555;">SCAN TO VERIFY</div>
            </div>

            <div class="seal-sec">
              <div class="seal-circle">
                MUNICIPAL<br>CORPORATION<br>OFFICIAL SEAL<br>2026
              </div>
            </div>

            <div class="sig-sec">
              <div style="font-family: 'Brush Script MT', cursive; font-size: 24px; color: #000080;">J. Commissioner</div>
              <div class="sig-line">
                MUNICIPAL COMMISSIONER<br>
                <span style="font-size: 9px; font-weight: normal; color: #555;">Digital Sign Key: 0x8F92A...BC1</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

// --- Officer Dashboard & Work Queue ---
async function loadOfficerDashboard(email) {
  let tickets = [];
  let certCount = 0;
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    tickets = db.grievances.filter(g => g.assigneeEmail && g.assigneeEmail.toLowerCase() === email.toLowerCase());
    certCount = db.serviceApplications.filter(a => a.status === 'SUBMITTED' || a.verificationStatus === 'PENDING').length;
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances?assigneeEmail=${encodeURIComponent(email)}`);
      tickets = await res.json();
      const pendingRes = await fetch(`${State.gatewayUrl}/api/services/pending`);
      const pendingCerts = await pendingRes.json();
      certCount = pendingCerts.length;
    } catch (e) { console.error(e); }
  }

  const total = tickets.length;
  const pending = tickets.filter(t => t.status === 'OPEN').length;
  const solved = tickets.filter(t => t.status === 'RESOLVED').length;
  const overdue = tickets.filter(t => t.status === 'EXPIRED/OVERDUE' || t.status === 'EXPIRED_OVERDUE').length;

  elements.officerStatTotal.textContent = total;
  elements.officerStatVerifications.textContent = certCount;
  elements.officerStatSolved.textContent = solved;
  elements.officerStatOverdue.textContent = overdue;

  updateDashboardChart('officer', pending, solved, overdue);
}

async function loadOfficerQueue(email) {
  let tickets = [];
  if (State.mode === 'SANDBOX') {
    tickets = getSandboxData().grievances.filter(g => g.assigneeEmail && g.assigneeEmail.toLowerCase() === email.toLowerCase());
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances?assigneeEmail=${encodeURIComponent(email)}`);
      tickets = await res.json();
    } catch (e) { console.error(e); }
  }

  elements.officerTasksTbody.innerHTML = '';
  if (tickets.length === 0) {
    elements.officerTasksTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">No tickets allocated to you.</td></tr>`;
    return;
  }

  tickets.slice().reverse().forEach(t => {
    const statusClass = t.status === 'OPEN' ? 'status-open' : (t.status === 'RESOLVED' ? 'status-resolved' : 'status-overdue');
    const priorityClass = t.priority === 'HIGH' ? 'priority-high' : (t.priority === 'MEDIUM' ? 'priority-medium' : 'priority-low');
    
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/40 text-xs hover:bg-slate-850 cursor-pointer";
    tr.innerHTML = `
      <td class="p-4 font-mono text-cyan-400 font-bold">${t.trackingNumber}</td>
      <td class="p-4 text-slate-200">
        <div class="font-bold">${escapeHTML(t.title)}</div>
        <div class="text-[10px] text-slate-500 max-w-[200px] truncate">${escapeHTML(t.description)}</div>
      </td>
      <td class="p-4"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${priorityClass}">${t.priority}</span></td>
      <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ${statusClass}">${t.status}</span></td>
      <td class="p-4 text-right">
        <button onclick="selectGrievanceToTrack(${t.id})" class="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded text-[10px] font-bold">
          Track Flow
        </button>
      </td>
    `;
    elements.officerTasksTbody.appendChild(tr);
  });

  if (State.selectedGrievanceId) {
    const selected = tickets.find(t => t.id === State.selectedGrievanceId);
    if (selected) renderGrievanceTimeline(selected);
  } else if (tickets.length > 0) {
    selectGrievanceToTrack(tickets[tickets.length - 1].id);
  }
}

window.selectGrievanceToTrack = function(id) {
  State.selectedGrievanceId = id;
  if (State.mode === 'SANDBOX') {
    const g = getSandboxData().grievances.find(item => item.id === id);
    if (g) renderGrievanceTimeline(g);
  } else {
    fetch(`${State.gatewayUrl}/api/v1/grievances?assigneeEmail=${encodeURIComponent(State.user.email)}`)
      .then(res => res.json())
      .then(tickets => {
        const g = tickets.find(item => item.id === id);
        if (g) renderGrievanceTimeline(g);
      }).catch(e => console.error(e));
  }
};

function renderGrievanceTimeline(g) {
  elements.timelineAppId.textContent = `${g.trackingNumber} - ${g.category}`;
  
  elements.verticalTimelineWrapper.innerHTML = `
    <div class="relative pl-6">
      <span class="absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 bg-emerald-500/20 border-emerald-500 flex items-center justify-center">
        <i class="fa-solid fa-check text-[8px] text-[#10B981]"></i>
      </span>
      <h4 class="text-xs font-semibold text-slate-100">1. Logged / Filed</h4>
      <p class="text-[10px] text-slate-500 mt-0.5 leading-normal">Filed by citizen ${g.creatorEmail} on ${new Date(g.createdAt).toLocaleString()}</p>
    </div>
    
    <div class="relative pl-6">
      <span class="absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 bg-emerald-500/20 border-emerald-500 flex items-center justify-center">
        <i class="fa-solid fa-check text-[8px] text-[#10B981]"></i>
      </span>
      <h4 class="text-xs font-semibold text-slate-100">2. Assigned to Operator</h4>
      <p class="text-[10px] text-slate-500 mt-0.5 leading-normal">Assigned to ${g.assigneeEmail} (SLA Deadline: ${new Date(g.dueAt).toLocaleDateString()})</p>
    </div>

    <div class="relative pl-6">
      <span class="absolute -left-2 top-0.5 w-4 h-4 rounded-full border-2 ${g.status === 'RESOLVED' ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-700'} flex items-center justify-center">
        ${g.status === 'RESOLVED' ? '<i class="fa-solid fa-check text-[8px] text-slate-900"></i>' : ''}
      </span>
      <h4 class="text-xs font-semibold ${g.status === 'RESOLVED' ? 'text-slate-100 font-bold' : 'text-slate-500'}">3. Resolved / Completed</h4>
      <p class="text-[10px] text-slate-500 mt-0.5 leading-normal">
        ${g.status === 'RESOLVED' ? `Resolved officially on ${new Date(g.resolvedAt).toLocaleString()}` : 'Awaiting confirmation from field officer.'}
      </p>
    </div>
  `;

  // Action Button
  elements.timelineActionWrapper.innerHTML = '';
  if (g.status !== 'RESOLVED') {
    elements.timelineActionWrapper.innerHTML = `
      <button onclick="resolveGrievance(${g.id})" class="w-full py-2.5 bg-[#10B981] hover:bg-emerald-500 text-slate-950 font-extrabold rounded-xl shadow-lg active:scale-95 transition-all text-xs flex items-center justify-center gap-1.5">
        <i class="fa-solid fa-square-check"></i> Mark Completed
      </button>
    `;
  } else {
    elements.timelineActionWrapper.innerHTML = `
      <div class="text-center text-[10px] text-slate-500 py-2 italic font-semibold bg-slate-950/20 rounded-xl p-3 border border-slate-900/50">
        <i class="fa-solid fa-circle-check text-[#10B981] mr-1.5"></i> Task officially completed.
      </div>
    `;
  }
}

window.resolveGrievance = async function(id) {
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    const g = db.grievances.find(item => item.id === id);
    if (g) {
      g.status = 'RESOLVED';
      g.resolvedAt = new Date().toISOString();
      db.notifications.unshift({
        id: Date.now() + Math.random(),
        eventType: 'GRIEVANCE_RESOLVED',
        trackingNumber: g.trackingNumber,
        message: `Grievance ${g.trackingNumber} was marked as resolved.`,
        recipientEmail: g.creatorEmail,
        timestamp: new Date().toISOString(),
        read: false
      });
      saveSandboxData(db);
      loadOfficerQueue(State.user.email);
    }
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      if (res.ok) {
        loadOfficerQueue(State.user.email);
      }
    } catch (e) { console.error(e); }
  }
};

// --- Officer Certificate Verification Portal ---
async function loadOfficerVerifications() {
  let apps = [];
  if (State.mode === 'SANDBOX') {
    apps = getSandboxData().serviceApplications.filter(a => a.status === 'SUBMITTED' || a.status === 'UNDER_VERIFICATION');
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/services/pending`);
      apps = await res.json();
    } catch (e) { console.error(e); }
  }

  elements.officerVerificationsTbody.innerHTML = '';
  if (apps.length === 0) {
    elements.officerVerificationsTbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">No applications awaiting processing.</td></tr>`;
    return;
  }

  apps.forEach(a => {
    let actionHTML = '';

    if (a.status === 'SUBMITTED') {
      actionHTML = `
        <div class="flex gap-2 justify-end">
          <button onclick="verifyServiceApplication(${a.id}, 'VERIFIED')" class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold active:scale-95 transition-all">
            Verify Documents
          </button>
          <button onclick="openRejectionModal(${a.id}, 'verify')" class="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded text-[11px] font-semibold active:scale-95 transition-all border border-rose-900/50">
            Reject
          </button>
        </div>
      `;
    } else if (a.status === 'UNDER_VERIFICATION') {
      actionHTML = `
        <div class="flex gap-2 justify-end">
          <button onclick="approveServiceApplication(${a.id}, 'APPROVED')" class="px-2.5 py-1.5 bg-[#10B981] hover:bg-emerald-500 text-slate-950 rounded text-[11px] font-extrabold active:scale-95 transition-all">
            Approve
          </button>
          <button onclick="openRejectionModal(${a.id}, 'approve')" class="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded text-[11px] font-semibold active:scale-95 transition-all border border-rose-900/50">
            Reject
          </button>
        </div>
      `;
    }

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/40 text-xs text-slate-300";
    tr.innerHTML = `
      <td class="p-4 font-mono text-cyan-400 font-semibold">${a.applicationNumber}</td>
      <td class="p-4 font-bold text-slate-200">${a.serviceType.replace('_', ' ')}</td>
      <td class="p-4 font-medium">${escapeHTML(a.applicantName)}</td>
      <td class="p-4 font-mono text-slate-450">${a.aadhaarNumber}</td>
      <td class="p-4"><span class="px-2 py-0.5 rounded font-semibold ${a.verificationStatus === 'PENDING' ? 'bg-slate-800 text-slate-400' : 'bg-blue-950 text-blue-400'}">${a.verificationStatus}</span></td>
      <td class="p-4"><span class="px-2 py-0.5 rounded font-semibold ${a.approvalStatus === 'PENDING' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-955 text-emerald-400'}">${a.approvalStatus}</span></td>
      <td class="p-4 text-right">${actionHTML}</td>
    `;
    elements.officerVerificationsTbody.appendChild(tr);
  });
}

window.verifyServiceApplication = async function(appId, status) {
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    const app = db.serviceApplications.find(item => item.id === appId);
    if (app) {
      app.verificationStatus = status;
      app.status = status === 'VERIFIED' ? 'UNDER_VERIFICATION' : 'REJECTED';
      saveSandboxData(db);
      loadOfficerVerifications();
    }
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/services/verify/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadOfficerVerifications();
      }
    } catch (e) { console.error(e); }
  }
};

window.approveServiceApplication = async function(appId, status) {
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    const app = db.serviceApplications.find(item => item.id === appId);
    if (app) {
      app.approvalStatus = status;
      app.status = status === 'APPROVED' ? 'CERTIFICATE_GENERATED' : 'REJECTED';
      app.approvedDate = new Date().toISOString();
      const prefix = getCertificatePrefix(app.serviceType);
      const year = new Date().getFullYear();
      app.certificateNumber = `${prefix}-${year}-${String(app.id).padStart(4, '0')}`;

      // Notify citizen
      const citizenProfile = db.citizenProfiles.find(p => p.id === app.citizenId);
      if (citizenProfile) {
        db.notifications.unshift({
          id: Date.now() + Math.random(),
          eventType: 'GRIEVANCE_RESOLVED',
          trackingNumber: app.applicationNumber,
          message: `Your application ${app.applicationNumber} for ${app.serviceType.replace('_', ' ')} is APPROVED. Certificate ID: ${app.certificateNumber}`,
          recipientEmail: citizenProfile.userEmail,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      saveSandboxData(db);
      loadOfficerVerifications();
    }
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/services/approve/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadOfficerVerifications();
      }
    } catch (e) { console.error(e); }
  }
};

function getCertificatePrefix(serviceType) {
  switch (serviceType) {
    case 'BIRTH_CERTIFICATE': return 'BC';
    case 'DEATH_CERTIFICATE': return 'DC';
    case 'INCOME_CERTIFICATE': return 'IC';
    case 'RESIDENCE_CERTIFICATE': return 'RC';
    case 'TRADE_LICENSE': return 'TL';
    default: return 'CERT';
  }
}

// --- Rejection Modal Setup ---
let activeRejectionTarget = null; // { id, step }
function setupRejectionModal() {
  elements.rejectionCancelBtn.addEventListener('click', () => {
    elements.rejectionModal.classList.add('hidden');
    elements.rejectionModal.classList.remove('flex');
    elements.rejectionReasonText.value = '';
    activeRejectionTarget = null;
  });

  elements.rejectionSubmitBtn.addEventListener('click', async () => {
    const reason = elements.rejectionReasonText.value.trim();
    if (!reason) {
      alert("A rejection reason is mandatory.");
      return;
    }

    const { id, step } = activeRejectionTarget;

    if (State.mode === 'SANDBOX') {
      const db = getSandboxData();
      const app = db.serviceApplications.find(a => a.id === id);
      if (app) {
        app.verificationStatus = step === 'verify' ? 'REJECTED' : app.verificationStatus;
        app.approvalStatus = 'REJECTED';
        app.status = 'REJECTED';
        app.rejectionReason = reason;

        const profile = db.citizenProfiles.find(p => p.id === app.citizenId);
        if (profile) {
          db.notifications.unshift({
            id: Date.now() + Math.random(),
            eventType: 'GRIEVANCE_OVERDUE',
            trackingNumber: app.applicationNumber,
            message: `Your application ${app.applicationNumber} was REJECTED: ${reason}`,
            recipientEmail: profile.userEmail,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
        saveSandboxData(db);
      }
    } else {
      try {
        const path = step === 'verify' ? 'verify' : 'approve';
        const res = await fetch(`${State.gatewayUrl}/api/services/${path}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason })
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Failed to submit rejection.");
        }
      } catch (e) { console.error(e); }
    }

    elements.rejectionModal.classList.add('hidden');
    elements.rejectionModal.classList.remove('flex');
    elements.rejectionReasonText.value = '';
    activeRejectionTarget = null;
    loadOfficerVerifications();
  });
}

window.openRejectionModal = function(appId, step) {
  activeRejectionTarget = { id: appId, step };
  elements.rejectionModal.classList.remove('hidden');
  elements.rejectionModal.classList.add('flex');
  elements.rejectionReasonText.focus();
};

// --- Admin Overview Dashboard ---
async function loadAdminDashboard() {
  let tickets = [];
  let userCount = 0;
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    tickets = db.grievances;
    userCount = db.users.length;
  } else {
    try {
      let res = await fetch(`${State.gatewayUrl}/api/v1/grievances`);
      tickets = await res.json();
      res = await fetch(`${State.gatewayUrl}/api/v1/users/count`);
      const body = await res.json();
      userCount = body.count || 0;
    } catch (e) { console.error(e); }
  }

  // SLA transitions check
  let changed = false;
  tickets.forEach(g => {
    if (g.status === 'OPEN' && new Date() > new Date(g.dueAt)) {
      g.status = 'EXPIRED/OVERDUE';
      changed = true;
    }
  });
  if (changed && State.mode === 'SANDBOX') {
    const db = getSandboxData();
    db.grievances = tickets;
    saveSandboxData(db);
  }

  const total = tickets.length;
  const solved = tickets.filter(t => t.status === 'RESOLVED').length;
  const overdue = tickets.filter(t => t.status === 'EXPIRED/OVERDUE' || t.status === 'EXPIRED_OVERDUE').length;
  const open = tickets.filter(t => t.status === 'OPEN').length;

  elements.adminStatUsers.textContent = userCount;
  elements.adminStatTotal.textContent = total;
  elements.adminStatSolved.textContent = solved;
  elements.adminStatOverdue.textContent = overdue;

  updateDashboardChart('admin', open, solved, overdue);
}

// --- Admin Master Tasks Registry ---
async function loadAdminMasterTasks() {
  let tickets = [];
  let certs = [];
  let officers = [];
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    tickets = db.grievances;
    certs = db.serviceApplications;
    officers = db.users.filter(u => u.role === 'FIELD_OFFICER');
  } else {
    try {
      let res = await fetch(`${State.gatewayUrl}/api/v1/grievances`);
      tickets = await res.json();
      res = await fetch(`${State.gatewayUrl}/api/services`);
      certs = await res.json();
      res = await fetch(`${State.gatewayUrl}/api/v1/users?role=FIELD_OFFICER`);
      officers = await res.json();
    } catch (e) { console.error(e); }
  }

  // Get selected filter type
  const filterType = document.querySelector('input[name="admin-task-filter"]:checked').value;

  elements.adminMasterTasksTbody.innerHTML = '';
  const rows = [];

  if (filterType === 'ALL' || filterType === 'GRIEVANCE') {
    tickets.forEach(t => {
      rows.push({
        id: t.id,
        number: t.trackingNumber,
        details: t.title,
        type: t.category,
        kind: 'GRIEVANCE',
        status: t.status,
        creator: t.creatorEmail,
        assignee: t.assigneeEmail,
        priority: t.priority
      });
    });
  }

  if (filterType === 'ALL' || filterType === 'CERTIFICATE') {
    certs.forEach(c => {
      rows.push({
        id: c.id,
        number: c.applicationNumber,
        details: c.applicantName,
        type: c.serviceType.replace('_', ' '),
        kind: 'CERTIFICATE',
        status: c.status,
        creator: 'Aadhaar: ' + c.aadhaarNumber,
        assignee: 'N/A',
        priority: 'MEDIUM'
      });
    });
  }

  if (rows.length === 0) {
    elements.adminMasterTasksTbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-slate-500">No records found matching filters.</td></tr>`;
    return;
  }

  rows.slice().reverse().forEach(r => {
    let statusClass = 'status-open';
    if (r.status === 'RESOLVED' || r.status === 'APPROVED' || r.status === 'CERTIFICATE_GENERATED' || r.status === 'DOWNLOADED') statusClass = 'status-resolved';
    else if (r.status === 'EXPIRED/OVERDUE' || r.status === 'EXPIRED_OVERDUE' || r.status === 'REJECTED') statusClass = 'status-overdue';

    let assignHTML = '';
    if (r.kind === 'GRIEVANCE') {
      if (r.status === 'RESOLVED') {
        assignHTML = `<span class="text-slate-500 italic">Resolved: ${r.assignee}</span>`;
      } else {
        assignHTML = `
          <select onchange="assignOfficerToGrievance(${r.id}, this.value)" class="bg-slate-950/80 border border-slate-800 rounded-lg text-xs px-2 py-1 focus:outline-none focus:border-[#10B981] text-slate-350 max-w-[180px]">
            <option value="">-- Assign --</option>
            ${officers.map(o => `<option value="${o.email}" ${r.assignee && r.assignee.toLowerCase() === o.email.toLowerCase() ? 'selected' : ''}>${o.email}</option>`).join('')}
          </select>
        `;
      }
    } else {
      assignHTML = `<span class="text-slate-650 italic">Dynamic Processing</span>`;
    }

    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/40 text-xs";
    tr.innerHTML = `
      <td class="p-4 font-mono text-cyan-400 font-bold">${r.number}</td>
      <td class="p-4 text-slate-200 font-semibold truncate max-w-xs">${escapeHTML(r.details)}</td>
      <td class="p-4 text-slate-400 font-medium">
        <span class="text-[10px] text-slate-500 mr-1.5 uppercase font-bold">[${r.kind}]</span>
        ${r.type}
      </td>
      <td class="p-4"><span class="px-2 py-0.5 rounded-full text-[9px] font-extrabold ${statusClass}">${r.status}</span></td>
      <td class="p-4 text-slate-450">${r.creator}</td>
      <td class="p-4 text-right">${assignHTML}</td>
    `;
    elements.adminMasterTasksTbody.appendChild(tr);
  });
}

window.assignOfficerToGrievance = async function(id, officerEmail) {
  if (!officerEmail) return;
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    const g = db.grievances.find(item => item.id === id);
    if (g) {
      g.assigneeEmail = officerEmail;
      db.notifications.unshift({
        id: Date.now() + Math.random(),
        eventType: 'GRIEVANCE_ASSIGNED',
        trackingNumber: g.trackingNumber,
        message: `You have been allocated Grievance Ticket ${g.trackingNumber}`,
        recipientEmail: officerEmail,
        timestamp: new Date().toISOString(),
        read: false
      });
      saveSandboxData(db);
      loadAdminMasterTasks();
    }
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeEmail: officerEmail })
      });
      if (res.ok) {
        loadAdminMasterTasks();
      }
    } catch (e) { console.error(e); }
  }
};

async function loadAdminDirectory() {
  let officers = [];
  let grievances = [];
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    officers = db.users.filter(u => u.role === 'FIELD_OFFICER');
    grievances = db.grievances;
  } else {
    try {
      let res = await fetch(`${State.gatewayUrl}/api/v1/users?role=FIELD_OFFICER`);
      officers = await res.json();
      res = await fetch(`${State.gatewayUrl}/api/v1/grievances`);
      grievances = await res.json();
    } catch (e) { console.error(e); }
  }

  elements.adminDirectoryTbody.innerHTML = '';
  if (officers.length === 0) {
    elements.adminDirectoryTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-500">No field officers registered.</td></tr>`;
    return;
  }

  officers.forEach((o, index) => {
    const load = grievances.filter(g => g.assigneeEmail && g.assigneeEmail.toLowerCase() === o.email.toLowerCase() && g.status !== 'RESOLVED').length;
    const deptName = o.department || 'General Operations';
    const tr = document.createElement('tr');
    tr.className = "border-b border-slate-800/40 text-xs";
    tr.innerHTML = `
      <td class="p-4 font-semibold text-slate-400 font-mono">OFF-${1001 + index}</td>
      <td class="p-4 font-bold text-slate-200">
        <div>${o.email}</div>
        <div class="text-[10px] text-emerald-400 font-semibold mt-0.5"><i class="fa-solid fa-building-user mr-1"></i>${deptName}</div>
      </td>
      <td class="p-4 font-semibold text-[#10B981] font-outfit">FIELD OFFICER</td>
      <td class="p-4 text-center font-bold text-slate-200">${load} active tasks</td>
      <td class="p-4"><span class="px-2 py-0.5 bg-emerald-950 text-emerald-450 border border-emerald-900/35 rounded font-semibold text-[10px]">Active</span></td>
    `;
    elements.adminDirectoryTbody.appendChild(tr);
  });
}

// --- Chart.js Graphing ---
function updateDashboardChart(role, openCount, solvedCount, overdueCount) {
  const canvas = role === 'admin' ? elements.adminChartCanvas : elements.officerChartCanvas;
  if (!canvas) return;

  if (State.charts[role]) {
    State.charts[role].destroy();
  }

  if (role === 'admin') {
    document.getElementById('admin-chart-legend-open').textContent = openCount;
    document.getElementById('admin-chart-legend-solved').textContent = solvedCount;
    document.getElementById('admin-chart-legend-overdue').textContent = overdueCount;
  } else {
    document.getElementById('officer-chart-legend-open').textContent = openCount;
    document.getElementById('officer-chart-legend-solved').textContent = solvedCount;
    document.getElementById('officer-chart-legend-overdue').textContent = overdueCount;
  }

  if (openCount === 0 && solvedCount === 0 && overdueCount === 0) return;

  State.charts[role] = new Chart(canvas, {
    type: 'pie',
    data: {
      labels: ['Open', 'Solved', 'Overdue'],
      datasets: [{
        data: [openCount, solvedCount, overdueCount],
        backgroundColor: ['#10B981', '#3b82f6', '#ef4444'],
        borderWidth: 2,
        borderColor: '#0b0f19',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

// --- Floating Alerts Dropdown ---
function setupNotificationCenter() {
  elements.bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = elements.notificationDropdown;
    const isHidden = dropdown.classList.contains('hidden');
    
    if (isHidden) {
      elements.bellBtn.classList.remove('animate-bell-ring');
      dropdown.classList.remove('hidden');
      setTimeout(() => {
        dropdown.classList.replace('scale-95', 'scale-100');
        dropdown.classList.replace('opacity-0', 'opacity-100');
      }, 10);
      markNotificationsAsRead();
    } else {
      closeNotificationDropdown();
    }
  });

  document.addEventListener('click', () => {
    closeNotificationDropdown();
  });

  elements.notificationDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  elements.clearNotifications.addEventListener('click', () => {
    if (State.mode === 'SANDBOX') {
      const db = getSandboxData();
      db.notifications = [];
      saveSandboxData(db);
    }
    renderNotifications([]);
  });
}

function closeNotificationDropdown() {
  const dropdown = elements.notificationDropdown;
  if (!dropdown) return;
  dropdown.classList.replace('scale-100', 'scale-95');
  dropdown.classList.replace('opacity-100', 'opacity-0');
  setTimeout(() => {
    dropdown.classList.add('hidden');
  }, 150);
}

function startNotificationPolling() {
  if (State.pollingInterval) clearInterval(State.pollingInterval);
  pollNotifications();
  State.pollingInterval = setInterval(() => {
    pollNotifications();
  }, 5000);
}

async function pollNotifications() {
  if (!State.user) return;
  let list = [];
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    list = db.notifications.filter(n => {
      if (State.user.role === 'ADMIN') return true;
      if (State.user.role === 'FIELD_OFFICER') {
        return n.recipientEmail.toLowerCase() === State.user.email.toLowerCase() || n.eventType === 'GRIEVANCE_OVERDUE';
      }
      if (State.user.role === 'CITIZEN') {
        return n.recipientEmail.toLowerCase() === State.user.email.toLowerCase();
      }
      return false;
    });
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/grievances/notifications`);
      const all = await res.json();
      list = all.filter(n => {
        if (State.user.role === 'ADMIN') return true;
        return n.recipientEmail.toLowerCase() === State.user.email.toLowerCase();
      });
    } catch (e) { console.error(e); }
  }

  renderNotifications(list);
}

function renderNotifications(alerts) {
  elements.notificationList.innerHTML = '';
  
  const unreadCount = alerts.filter(a => !a.read).length;
  if (unreadCount > 0) {
    elements.bellBadge.textContent = unreadCount;
    elements.bellBadge.classList.replace('scale-0', 'scale-100');
    elements.bellBtn.classList.add('animate-bell-ring');
  } else {
    elements.bellBadge.classList.replace('scale-100', 'scale-0');
  }

  if (alerts.length === 0) {
    elements.notificationList.innerHTML = `
      <div class="p-4 text-center text-xs text-slate-500 py-8 font-semibold">
        <i class="fa-solid fa-inbox text-2xl mb-2 text-slate-700 block"></i>
        No system alerts logged.
      </div>
    `;
    return;
  }

  alerts.forEach(a => {
    const div = document.createElement('div');
    div.className = `p-4 border-b border-slate-800/40 text-xs transition-colors hover:bg-slate-800/10 ${!a.read ? 'bg-emerald-950/10 border-l-2 border-[#10B981]' : ''}`;
    
    let iconHTML = '<i class="fa-solid fa-circle-info text-blue-400 text-sm"></i>';
    if (a.eventType.includes('ASSIGNED')) {
      iconHTML = '<i class="fa-solid fa-user-gear text-indigo-400 text-sm"></i>';
    } else if (a.eventType.includes('RESOLVED') || a.eventType.includes('APPROVED')) {
      iconHTML = '<i class="fa-solid fa-circle-check text-[#10B981] text-sm"></i>';
    } else if (a.eventType.includes('OVERDUE') || a.eventType.includes('REJECTED')) {
      iconHTML = '<i class="fa-solid fa-circle-xmark text-rose-500 text-sm"></i>';
    }

    div.innerHTML = `
      <div class="flex gap-3">
        <div class="mt-0.5">${iconHTML}</div>
        <div class="flex-grow">
          <p class="text-slate-200 font-semibold leading-relaxed">${escapeHTML(a.message)}</p>
          <span class="text-[9px] text-slate-500 block mt-1"><i class="fa-regular fa-clock mr-1"></i> ${new Date(a.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    `;
    elements.notificationList.appendChild(div);
  });
}

function markNotificationsAsRead() {
  if (State.mode === 'SANDBOX') {
    const db = getSandboxData();
    db.notifications.forEach(n => {
      if (State.user.role === 'ADMIN' || n.recipientEmail.toLowerCase() === State.user.email.toLowerCase()) {
        n.read = true;
      }
    });
    saveSandboxData(db);
  }
  elements.bellBadge.classList.replace('scale-100', 'scale-0');
}

async function loadAdminDepartments() {
  const grid = document.getElementById('admin-departments-grid');
  if (!grid) return;

  let users = [];
  if (State.mode === 'SANDBOX') {
    users = getSandboxData().users;
  } else {
    try {
      const res = await fetch(`${State.gatewayUrl}/api/v1/users`);
      users = await res.json();
    } catch (e) {
      console.error(e);
    }
  }

  const deptList = [
    { name: "Utilities & Water Supply", icon: "fa-faucet-drip", color: "text-cyan-400", desc: "Manages clean water distribution, pipeline leak repairs, contamination control, and high-pressure supply valves." },
    { name: "Public Works & Roads", icon: "fa-road", color: "text-amber-400", desc: "Manages road surfacing, pothole repairs, highway dividers, traffic signages, and bridge infrastructure." },
    { name: "Sanitation & Waste Management", icon: "fa-trash-can", color: "text-emerald-400", desc: "Manages garbage collection, sewer line unblocking, waste segregation, recycling units, and street sweeping." },
    { name: "Revenue & Taxation", icon: "fa-file-invoice-dollar", color: "text-[#10B981]", desc: "Manages property tax assessments, income verification certificates, municipal dues, and land record registries." },
    { name: "Town Planning & Licensing", icon: "fa-building-user", color: "text-purple-400", desc: "Manages building permits, trade licenses, urban zoning approvals, commercial space clearance, and occupancy certificates." },
    { name: "Street Lighting & Energy", icon: "fa-lightbulb", color: "text-amber-300", desc: "Manages street light outages, underground cabling, solar lamp post maintenance, and municipal transformer units." },
    { name: "Public Health & Environment", icon: "fa-heart-pulse", color: "text-rose-400", desc: "Manages birth & death certificate verifications, disease prevention drives, park maintenance, and air quality telemetry." }
  ];

  grid.innerHTML = '';
  deptList.forEach(dept => {
    const officersInDept = users.filter(u => u.role === 'FIELD_OFFICER' && u.department === dept.name).length;
    const card = document.createElement('div');
    card.className = "bg-[#0E131F] border border-slate-800/60 p-5 rounded-2xl shadow-md";
    card.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <h4 class="font-bold text-slate-200 text-sm"><i class="fa-solid ${dept.icon} ${dept.color} mr-2"></i> ${dept.name}</h4>
        <span class="text-xs text-[#10B981] bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/30">Active (${officersInDept} ${officersInDept === 1 ? 'Officer' : 'Officers'})</span>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed">${dept.desc}</p>
    `;
    grid.appendChild(card);
  });
}

// --- Security Escaping ---
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
