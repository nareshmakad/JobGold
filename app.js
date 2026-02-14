/* ==================== LOGIC ==================== */
const KEY_JOBS = 'jg_jobs_v3_stylish';
const KEY_APPS = 'jg_apps_v3';
const KEY_USERS = 'jg_users_v3';
const KEY_SESSION = 'jg_session_v3';
const KEY_THEME = 'jg_theme_v1';
const KEY_CANDIDATE_PROFILES = 'jg_candidate_profiles_v1'; 
const KEY_HIRE_REQUESTS = 'jg_hire_requests_v1'; 
const KEY_SAVED_JOBS = 'jg_saved_jobs_v1'; 
const KEY_APP_STATUS = 'jg_app_status_v1'; // Application status: Submitted, Pending, Accepted, Rejected

let isListening = false; // State for voice search

const uid = ()=> Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const get = k => JSON.parse(localStorage.getItem(k) || '[]');
const set = (k,v) => localStorage.setItem(k, JSON.stringify(v));
const trim = s => (s||'').trim();
const $ = id => document.getElementById(id);

/* --- HARDCODED ADMIN SETUP (Naresh Suthar's Details) --- */
const LOGIN_ADMIN_EMAIL = "admin@jobgold.com"; 
const DISPLAY_CREATOR_EMAIL = "ns680578@gmail.com"; 

/* --- DUMMY PROFILES (Simulated verified data) --- */
const initialDummyProfiles = [
    { id: 'p7', name: 'Amit Sharma', currentRole: 'Chef', prevCompany: 'Dhaba Central', prevRole: 'Waiter', experience: '3 years experience, strong team player. Highly recommended.', photoUrl: 'https://i.pravatar.cc/150?img=6', status: 'Verified' },
    { id: 'p2', name: 'Priya Verma', currentRole: 'Senior Sales Executive', prevCompany: 'Fashion Hub', prevRole: 'Trainee', experience: '5 years in retail, excellent customer interaction skills. Looking for growth opportunities....', photoUrl: 'https://i.pravatar.cc/150?img=31', status: 'Verified' },
    { id: 'p3', name: 'Ramesh Kumar', currentRole: 'Logistics Manager', prevCompany: 'City Transport Co.', prevRole: 'Driver', experience: 'Skilled driver, managed local deliveries efficiently.', photoUrl: 'https://i.pravatar.cc/150?img=12', status: 'Verified' },
    { id: 'p4', name: 'Neha Gupta', currentRole: 'Senior Hair Stylist', prevCompany: 'Glamour Salon', prevRole: 'Helper', experience: '3 years experience in unisex cutting and styling. Customer service focused....', photoUrl: 'https://i.pravatar.cc/150?img=5', status: 'Verified' }, 
    { id: 'p6', name: 'Khushi Mishra', currentRole: 'CEO Of Nareshjob', prevCompany: 'GoldJod', prevRole: 'CEO', experience: 'B.Tech CSE Student | Aspiring Software Engineer | Web Development | Python | DSA....', photoUrl: 'https://i.pravatar.cc/150?img=42', status: 'Verified' }, 
    { 
        id: 'p1', 
        userId: 'p1_creator_id', 
        name: 'Naresh Suthar', 
        currentRole: 'Creator | Full Stack Developer', 
        prevCompany: 'JobGold Portal', 
        prevRole: 'Creator', 
        experience: 'As the **Creator and Designer** of the JobGold Portal, I specialize in crafting ultra-premium, high-performance web applications with an elite UI/UX focus. Proficient in HTML, CSS (Advanced), JavaScript, and client-side storage logic. Seeking challenging Full Stack/Frontend Development roles and innovative design projects.', 
        photoUrl: 'https://i.pravatar.cc/150?u=creator', 
        status: 'Verified'
    },
];

/* --- THEME LOGIC --- */
function initTheme(){
    const stored = localStorage.getItem(KEY_THEME) || 'dark';
    document.documentElement.setAttribute('data-theme', stored);
    updateThemeIcon(stored);
}

function toggleTheme(){
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEY_THEME, next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme){
    const i = $('themeIcon');
    if(theme === 'light'){
        i.classList.remove('fa-sun');
        i.classList.add('fa-moon');
    } else {
        i.classList.remove('fa-moon');
        i.classList.add('fa-sun');
    }
}

// Attach Event
$('themeToggle').onclick = toggleTheme;
initTheme(); // Run on start

/* --- TOAST LOGIC --- */
function showToast(msg, type='info'){
    const c = $('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    // Simple icon check for toast
    const iconClass = type==='success'?'fa-check-circle':type==='error'?'fa-exclamation-circle':'fa-info-circle';
    t.innerHTML = `<i class="fa-solid ${iconClass}"></i> ${msg}`;
    c.appendChild(t);
    setTimeout(()=> t.remove(), 3000);
}

// === NEW STYLISH CATEGORY CONFIG (Slightly improved icons) ===
const catConfig = {
    'Retail & Shop': { icon: 'fa-bag-shopping', emoji: '🛍️' },
    'Hotel & Food': { icon: 'fa-utensils', emoji: '🍽️' },
    'Driver & Transport': { icon: 'fa-truck-field', emoji: '🚖' }, 
    'Technician': { icon: 'fa-screwdriver-wrench', emoji: '🛠️' },
    'Delivery': { icon: 'fa-motorcycle', emoji: '📦' }, 
    'Salon & Beauty': { icon: 'fa-scissors', emoji: '💇' },
    'Office & Admin': { icon: 'fa-laptop-file', emoji: '💼' },
    'Security & Other': { icon: 'fa-shield-halved', emoji: '🛡️' }
};
const cats = Object.keys(catConfig);

/* --- DATA & INITIALIZATION --- */
(function initApp(){
  if (!localStorage.getItem(KEY_JOBS)){
    set(KEY_JOBS, [
      {id:uid(),title:'Clothing Store Salesman',company:'Fashion Hub',category:'Retail & Shop',salary:'12000',location:'Main Market',description:'Need active salesman for cloth shop. Morning 9 to 8 PM.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'Waiter / Server',company:'Royal Rasoi Hotel',category:'Hotel & Food',salary:'15000',location:'Station Road',description:'Experienced waiter needed. Food and accommodation provided.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'Bike Delivery Partner',company:'FastDrop',category:'Delivery',salary:'18000',location:'City Wide',description:'Deliver parcels. Must have own bike and license. Weekly payout.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'Hair Stylist',company:'Glamour Unisex Salon',category:'Salon & Beauty',salary:'22000',location:'Civil Lines',description:'Unisex hair cutter and stylist. Minimum 1 year experience.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'Personal Driver',company:'Private Home',category:'Driver & Transport',salary:'20000',location:'Model Town',description:'Driver for family car. Automatic car experience preferred.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'Office Assistant',company:'Tech Solutions',category:'Office & Admin',salary:'14000',location:'IT Park',description:'Basic computer work, filing and tea/coffee management.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'AC Technician Helper',company:'Cool Services',category:'Technician',salary:'10000',location:'Industrial Area',description:'Helper needed for AC repair. Freshers can apply.',created:new Date().toISOString(), creatorId: 'p1_creator_id'},
      {id:uid(),title:'Security Guard',company:'SafeSecure Agency',category:'Security & Other',salary:'16000',location:'Mall Road',description:'Night shift security guard for shopping mall.',created:new Date().toISOString(), creatorId: 'p1_creator_id'}
    ]);
  }
  let users = get(KEY_USERS);
  
  // Custom Admin/Creator Check
  const creatorProfile = initialDummyProfiles.find(p => p.id === 'p1');
  const customAdminExists = users.some(u => u.email === LOGIN_ADMIN_EMAIL);

  if (creatorProfile) {
    if (!customAdminExists) {
        // Add Creator/Admin profile using LOGIN_ADMIN_EMAIL
        users.push({ 
            id: creatorProfile.userId,
            name: creatorProfile.name, 
            email: LOGIN_ADMIN_EMAIL, 
            pass: 'admin123', 
            role: 'admin' // Set role to admin
        });
    } else {
        const adminIndex = users.findIndex(u => u.email === LOGIN_ADMIN_EMAIL);
        if (users[adminIndex].role !== 'admin' || users[adminIndex].id !== creatorProfile.userId) {
            users[adminIndex].role = 'admin';
            users[adminIndex].id = creatorProfile.userId;
        }
    }
    set(KEY_USERS, users);
  }

  // Fallback initial admin if no users exist
  if(users.length === 0){
      set(KEY_USERS, [{id:uid(), name:'Admin', email:LOGIN_ADMIN_EMAIL, pass:'admin123', role:'admin'}]);
  }
  
  // === PROFILE INITIALIZATION FIX ===
  let currentProfiles = get(KEY_CANDIDATE_PROFILES);
  let changesMade = false;
  
  initialDummyProfiles.forEach(newProfile => {
      const existingIndex = currentProfiles.findIndex(p => p.id === newProfile.id);
      
      if (existingIndex === -1) {
          currentProfiles.push(newProfile);
          changesMade = true;
      } else if (newProfile.id === 'p1') {
          const updatedPhotoUrl = (currentProfiles[existingIndex].photoUrl && currentProfiles[existingIndex].photoUrl.startsWith('data:')) 
                                  ? currentProfiles[existingIndex].photoUrl 
                                  : newProfile.photoUrl;

          const updatedProfile = {...currentProfiles[existingIndex], ...newProfile, photoUrl: updatedPhotoUrl};
          if (JSON.stringify(currentProfiles[existingIndex]) !== JSON.stringify(updatedProfile)) {
              currentProfiles[existingIndex] = updatedProfile;
              changesMade = true;
          }
      }
  });

  if (changesMade || currentProfiles.length === 0) {
      if(currentProfiles.length === 0) {
          set(KEY_CANDIDATE_PROFILES, initialDummyProfiles);
      } else {
          set(KEY_CANDIDATE_PROFILES, currentProfiles);
      }
  }
  
  // Initialize App Status if empty
  if (!localStorage.getItem(KEY_APP_STATUS)){
    set(KEY_APP_STATUS, []); 
  }

})();

const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav button, .topnav .navlinks button');

navBtns.forEach(btn => btn.addEventListener('click', () => {
    if(btn.dataset.view) showView(btn.dataset.view);
}));

function showView(name){
    // Determine the base view ID to display. For role-specific apps, use 'view-apps'.
    const viewId = (name === 'employer-apps' || name === 'jobseeker-apps') ? 'view-apps' : `view-${name}`;

    views.forEach(v => v.style.display = (v.id === viewId) ? 'block' : 'none');
    document.querySelectorAll('.nav button, .topnav .navlinks button').forEach(b => {
        if(b.dataset.view === name) b.classList.add('active');
        else b.classList.remove('active');
    });
    
    // Hide notification popup when switching views
    $('notification-popup').style.display = 'none';

    if(name==='dashboard') renderDashboard();
    if(name==='jobs') renderAllJobs();
    if(name==='employer-apps') renderEmployerApplications(); 
    if(name==='jobseeker-apps') renderJobseekerApplications(); 
    if(name==='profiles') renderCandidateProfiles(); 
    if(name==='about-me') renderAboutMe(); 
    if(name==='submit-history') checkUserForHistorySubmission(); 
    if(name==='saved-jobs') renderSavedJobs(); 
    if(name==='notifications') renderNotificationsView(); 
    if(name==='map') renderMapView(); // FIX: Ensure map view is rendered
    if(name==='add') {
        const s = get(KEY_SESSION);
        if(!s || (s.role!=='employer' && s.role!=='admin')) { 
            showToast('Employers only! Please login as Employer.', 'error');
            showView('dashboard');
        } else {
            prepareAddForm();
        }
    }
}

// --- NEW: Map View Renderer (FIXED) ---
function renderMapView() {
    // This ensures the map iframe is loaded when the view is active.
    const mapIframe = document.querySelector('#map-iframe');
    const mapUrl = 'https://www.google.com/maps';
    if (mapIframe) {
         if (mapIframe.src !== mapUrl) {
            mapIframe.src = mapUrl;
        }
    } else {
        console.error("Map iframe not found.");
    }
}
// --- END NEW: Map View Renderer ---

// --- Creator Edit Form Functions (NEW) ---

window.openCreatorEdit = () => {
    const session = get(KEY_SESSION);
    const isCreatorLoggedIn = session && session.id === 'p1_creator_id' && session.email === LOGIN_ADMIN_EMAIL;

    if (!isCreatorLoggedIn) {
        return showToast('Only the Creator can edit this profile.', 'error');
    }

    const profile = get(KEY_CANDIDATE_PROFILES).find(p => p.id === 'p1');
    if (!profile) return showToast('Creator Profile data not found.', 'error');

    $('aboutMeCard').style.display = 'none';
    $('adminSettingsCard').style.display = 'none';
    $('creatorEditFormContainer').style.display = 'block';

    $('creator_name').value = profile.name || '';
    $('creator_current_role').value = profile.currentRole || '';
    $('creator_description').value = profile.experience || '';
    
    window.scrollTo({top:0, behavior:'smooth'});
};

$('cancelCreatorEdit').onclick = () => {
    $('creatorEditFormContainer').style.display = 'none';
    renderAboutMe(); 
};

$('creatorProfileForm').addEventListener('submit', async e => {
    e.preventDefault();
    const s = get(KEY_SESSION);
    if (!(s && s.email === LOGIN_ADMIN_EMAIL)) return showToast('Permission Denied.', 'error');

    const profileId = $('creator_profile_id').value;
    const name = trim($('creator_name').value);
    const currentRole = trim($('creator_current_role').value);
    const description = trim($('creator_description').value);
    const photoFile = $('creator_photo').files[0];

    let profiles = get(KEY_CANDIDATE_PROFILES);
    let existingProfile = profiles.find(p => p.id === profileId);

    if(!name || !currentRole || !description) {
        return showToast('Please fill all required fields.', 'error');
    }

    let photoBase64 = existingProfile ? existingProfile.photoUrl : 'default-url';
    if (photoFile) {
        if (photoFile.size > 1024 * 1024 * 5) {
            return showToast('Photo size must be less than 5MB.', 'error');
        }
        try {
            photoBase64 = await getBase64(photoFile);
        } catch (error) {
            showToast('Error processing photo.', 'error');
        }
    }

    const updatedData = {
        name: name,
        currentRole: currentRole,
        experience: description,
        photoUrl: photoBase64,
        status: 'Verified',
        prevCompany: existingProfile.prevCompany,
        prevRole: existingProfile.prevRole,
        prevLocation: existingProfile.prevLocation,
        managerEmail: existingProfile.managerEmail,
        id: profileId,
        userId: existingProfile.userId
    };

    const profileIndex = profiles.findIndex(p => p.id === profileId);
    if (profileIndex > -1) {
        profiles[profileIndex] = updatedData;
        set(KEY_CANDIDATE_PROFILES, profiles);
        showToast('Creator Profile Updated Successfully!', 'success');
    }
    
    $('creator_photo').value = ''; 
    $('creatorEditFormContainer').style.display = 'none';
    renderAboutMe(); 
});


function renderAboutMe() {
    const profile = get(KEY_CANDIDATE_PROFILES).find(p => p.id === 'p1');
    const session = get(KEY_SESSION);
    
    const isCreatorLoggedIn = session && session.id === 'p1_creator_id' && session.email === LOGIN_ADMIN_EMAIL;
    
    $('creatorEditFormContainer').style.display = 'none';
    // ADMIN ACTIONS ARE HERE NOW
    $('adminSettingsCard').style.display = isCreatorLoggedIn ? 'block' : 'none';

    if (!profile) {
        $('aboutMeCard').innerHTML = '<div style="text-align:center; padding:20px; color:var(--red);">Creator Profile data not found.</div>';
        return;
    }

    let editButtonHtml = '';
    if (isCreatorLoggedIn) {
        editButtonHtml = `
            <button class="btn profile-edit-btn" style="margin-top: 15px; max-width: 250px;" onclick="openCreatorEdit()">
                <i class="fa-solid fa-camera"></i> Change Profile Photo
            </button>
            <button class="btn profile-edit-btn" style="margin-top: 10px; max-width: 250px;" onclick="openCreatorEdit()">
                <i class="fa-solid fa-pen-to-square"></i> Edit My Profile
            </button>
        `;
    }

    $('aboutMeCard').innerHTML = `
        <div class="about-me-header">
            <h2 class="about-me-title"><i class="fa-solid fa-crown" style="color:var(--gold-light)"></i> Premium Profile: ${escapeHtml(profile.name)} (The Designer) ✨</h2>
            </div>
        
        <div class="about-me-info">
            <div class="about-me-photo-container">
                <img src="${profile.photoUrl}" alt="${profile.name}" class="about-me-photo" onerror="this.onerror=null; this.src='https://i.pravatar.cc/150?u=fallback';" />
            </div>
            <div class="about-me-details">
                <div class="detail-item"><i class="fa-solid fa-envelope"></i> Email: ${escapeHtml(DISPLAY_CREATOR_EMAIL)}</div>
                <div class="detail-item"><i class="fa-solid fa-briefcase"></i> Role: ${escapeHtml(profile.currentRole)}</div>
                <div class="detail-item"><i class="fa-solid fa-location-dot"></i> Location: Jodhpur, Rajasthan, India</div>
                <div class="detail-item"><i class="fa-solid fa-globe"></i> Portfolio: Coming Soon</div>
                
                ${editButtonHtml} </div>
        </div>

        <div class="about-me-experience">
            <h4>About Me</h4>
            <p>${profile.experience.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</p>
        </div>
        
        <div class="about-me-experience">
            <h4>My Goal (मेरा लक्ष्य)</h4>
            <p style="font-size:12px; color:var(--gold-light)">
                गुणवत्ता और नए मुकामों पर ध्यान केंद्रित करते हुए, हर किसी को एक उच्च-स्तरीय, परेशानी मुक्त अनुभव प्रदान करना ही मेरा लक्ष्य और उद्देश्य है।
            </p>
        </div>
    `;
    $('aboutMeCard').style.display = 'block';
}


function checkUserForHistorySubmission() {
    const s = get(KEY_SESSION);
    if (!s || (s.role !== 'jobseeker' && s.role !== 'admin')) {
        showToast('Please login as a Job Seeker or Admin to share job history.', 'error');
        showView('dashboard');
    } else {
        $('history_profile_id').value = '';
        $('historyFormTitle').innerHTML = '<i class="fa-solid fa-clipboard-check" style="color:var(--gold)"></i> Submit Previous Job History';
        $('historyFormSubtitle').textContent = 'Apni pichhli job ki details bharein. Yeh data aapki profile ki vishwasniyata badhane mein madad karega.';
        $('submitHistoryBtn').innerHTML = 'Submit Job History <i class="fa-solid fa-paper-plane"></i>';
        
        const existingProfile = get(KEY_CANDIDATE_PROFILES).find(p => p.userId === s.id);
        if (existingProfile) {
            $('history_profile_id').value = existingProfile.id;
            $('history_name').value = existingProfile.name || s.name || '';
            $('history_current_role').value = existingProfile.currentRole || '';
            $('history_prev_company').value = existingProfile.prevCompany || '';
            $('history_prev_role').value = existingProfile.prevRole || '';
            $('history_prev_location').value = existingProfile.prevLocation || '';
            $('history_manager_email').value = existingProfile.managerEmail || '';
            $('history_description').value = existingProfile.experience || '';
            
            $('historyFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color:var(--gold)"></i> Edit Your Job History';
            $('submitHistoryBtn').innerHTML = 'Update Profile <i class="fa-solid fa-cloud-arrow-up"></i>';
        } else {
             $('jobHistoryForm').reset();
             $('history_name').value = s.name || ''; 
        }
    }
}

window.editProfile = (id) => {
    const profile = get(KEY_CANDIDATE_PROFILES).find(p => p.id === id);
    const session = get(KEY_SESSION);
    const isCreator = profile.id === 'p1' && session.email === LOGIN_ADMIN_EMAIL;

    if (!profile) return showToast('Profile not found for editing.', 'error');
    
    if (isCreator) {
        showView('about-me');
        return openCreatorEdit();
    }
    
    // UPDATED: Admin can edit any profile
    if (profile.userId !== session.id && session.role !== 'admin') {
        return showToast('You can only edit your own profile.', 'error');
    }

    showView('submit-history');

    $('history_profile_id').value = profile.id;
    $('historyFormTitle').innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:var(--gold)"></i> Edit Profile: ${profile.name}`;
    $('historyFormSubtitle').textContent = 'Admin/Owner: Update the candidate\'s profile information.';
    $('submitHistoryBtn').innerHTML = 'Update Profile <i class="fa-solid fa-cloud-arrow-up"></i>';
    
    $('history_name').value = profile.name || '';
    $('history_current_role').value = profile.currentRole || '';
    $('history_prev_company').value = profile.prevCompany || '';
    $('history_prev_role').value = profile.prevRole || '';
    $('history_prev_location').value = profile.prevLocation || '';
    $('history_manager_email').value = profile.managerEmail || '';
    $('history_description').value = profile.experience || '';
    
    window.scrollTo({top:0, behavior:'smooth'});
};

function toggleOtherCategory() {
    const categorySelect = $('f_category');
    const otherCategoryInput = $('f_other_category_input');
    const otherCategoryContainer = $('f_other_category_container');

    if (categorySelect.value === 'Other') {
        otherCategoryContainer.style.display = 'block';
        otherCategoryInput.setAttribute('required', 'required');
    } else {
        otherCategoryContainer.style.display = 'none';
        otherCategoryInput.removeAttribute('required');
        otherCategoryInput.value = ''; 
    }
}


function popCats(){ 
    ['f_category','searchCategory'].forEach(id=>{
        const el=$(id); if(!el)return; 
        
        el.innerHTML = id==='f_category' 
            ? '<option value="" disabled selected>--- Select Category ---</option>'
            : '<option value="">✨ All Categories</option>';
            
        cats.forEach(c=> {
            const conf = catConfig[c];
            el.innerHTML+=`<option value="${c}">${conf.emoji} ${c}</option>`;
        });
        
        if(id === 'f_category') {
            el.innerHTML += `<option value="Other">💬 Other (Specify below)</option>`;
        }
    });
}
popCats();

function checkSession(){
    const s = get(KEY_SESSION);
    const allNavButtons = document.querySelectorAll('.nav button, .topnav .navlinks button');
    
    if(s && s.email && !Array.isArray(s)){
        $('guestNav').style.display='none';
        $('userNav').style.display='flex';
        $('userGreeting').textContent = s.name;
        
        let roleDisplay = s.role;
        if (s.id === 'p1_creator_id' || s.email === LOGIN_ADMIN_EMAIL) {
            roleDisplay = "Creator";
        }
        $('userRoleDisplay').textContent = roleDisplay;
        $('statusIndicator').textContent = roleDisplay.toUpperCase();
        
        // --- NEW: Dynamic Sidebar Visibility ---
        const userRole = s.role;
        allNavButtons.forEach(btn => {
            const requiredRoles = btn.dataset.role;
            if (requiredRoles) {
                const roles = requiredRoles.split(',');
                if (roles.includes(userRole)) {
                    btn.style.display = 'flex'; // Show for matched roles
                } else {
                    btn.style.display = 'none'; // Hide for unmatched roles
                }
            } else {
                 btn.style.display = 'flex'; // Default to show if no data-role attribute
            }
        });
        // --- END NEW: Dynamic Sidebar Visibility ---

        // Show Post Job CTA only for Employer/Admin
        if(s.role === 'employer' || s.role === 'admin') {
             $('ctaApply').style.display = 'flex';
        } else {
             $('ctaApply').style.display = 'none';
        }


        // NEW: Update notification badge on login
        updateNotificationBadge(); 
    } else {
        $('guestNav').style.display='flex';
        $('userNav').style.display='none';
        $('statusIndicator').textContent = "GUEST";
        $('notificationCount').style.display = 'none'; // Hide badge for guests
        
        // Hide all role-specific buttons for guests (FIXED: Guest shouldn't see Saved Jobs/Notifications)
        allNavButtons.forEach(btn => {
            if (btn.dataset.role) {
                 // Check if it's a role-specific button and hide it if guest
                 const requiredRoles = btn.dataset.role;
                 if (requiredRoles.includes('jobseeker') || requiredRoles.includes('employer')) {
                    btn.style.display = 'none';
                 }
            }
        });
        
        // Hide 'Post Job' button for guests
        $('ctaApply').style.display = 'none';
        
        // Show 'Candidate Profiles' and 'Map' for guests
        const profileBtn = document.querySelector('.nav button[data-view="profiles"]');
        const mapBtn = document.querySelector('.nav button[data-view="map"]');
        if (profileBtn) profileBtn.style.display = 'flex';
        if (mapBtn) mapBtn.style.display = 'flex';
    }
}

// --- NEW: Toggle Saved Job (Like) ---
window.toggleSavedJob = (jobId) => {
    const s = get(KEY_SESSION);
    if (!s || s.role !== 'jobseeker') {
        return showToast('Please login as a Job Seeker to save jobs.', 'error');
    }

    let savedJobs = get(KEY_SAVED_JOBS);
    const jobIndex = savedJobs.findIndex(item => item.jobId === jobId && item.userId === s.id);

    if (jobIndex > -1) {
        // Job is already saved, remove it
        savedJobs.splice(jobIndex, 1);
        showToast('Job removed from Saved List.', 'info');
    } else {
        // Job is not saved, add it
        savedJobs.push({ jobId: jobId, userId: s.id, dateSaved: new Date().toISOString() });
        showToast('Job saved to your list!', 'success');
    }
    set(KEY_SAVED_JOBS, savedJobs);
    
    // Rerender the current view to update the heart icon
    const currentView = document.querySelector('.nav button.active')?.dataset.view;
    if (currentView === 'jobs' || currentView === 'dashboard') {
        renderAllJobs();
        renderDashboard(); 
    } else if (currentView === 'saved-jobs') {
        renderSavedJobs();
    }
}

// --- NEW: Render Saved Jobs View ---
function renderSavedJobs() {
    const s = get(KEY_SESSION);
    const el = $('savedJobsList');
    el.innerHTML = '';
    
    if (!s || s.role !== 'jobseeker') {
        el.innerHTML = '<div style="padding:20px; text-align:center;">Only Job Seekers can view their saved jobs. Please login.</div>';
        return;
    }

    const savedJobsData = get(KEY_SAVED_JOBS).filter(item => item.userId === s.id);
    
    if(savedJobsData.length === 0){ 
        el.innerHTML='<div style="text-align:center; padding:20px; color:var(--muted)">You have not saved any jobs yet.</div>'; 
        return; 
    }
    
    const allJobs = get(KEY_JOBS);
    const savedJobs = allJobs.filter(job => savedJobsData.some(saved => saved.jobId === job.id));

    renderJobsList(savedJobs, el);
}


function renderJobsList(jobs, targetEl){
    targetEl.innerHTML = '';
    let session = get(KEY_SESSION);
    if(Array.isArray(session)) session = null;

    const isAdmin = session && session.role === 'admin';
    const isEmployer = session && session.role === 'employer';
    const isJobseeker = session && session.role === 'jobseeker';
    const userRole = session ? session.role : 'guest';
    const userId = session ? session.id : null;
    const userEmail = session ? session.email : null;
    
    const savedJobs = isJobseeker ? get(KEY_SAVED_JOBS).filter(item => item.userId === userId).map(item => item.jobId) : [];
    const appliedJobIds = isJobseeker ? get(KEY_APPS).filter(a => a.email === userEmail).map(a => a.jobId) : []; 

    if(!jobs.length){ targetEl.innerHTML=`<div style="text-align:center; padding:20px; color:var(--muted)">No jobs found matching your criteria.</div>`; return; }

    jobs.slice().reverse().forEach(j => {
        const el = document.createElement('div');
        el.className = 'job';
        
        let actionButtons = '';
        const isJobOwner = j.creatorId === userId; 
        const isApplied = appliedJobIds.includes(j.id); 

        if(isAdmin || (isEmployer && isJobOwner)){ 
            actionButtons = `
                <div class="action-row">
                    <button class="action-btn edit" onclick="editJob('${j.id}')" title="Edit Job"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn del" onclick="deleteJob('${j.id}')" title="Delete Job"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
        } 
        else if (userRole === 'jobseeker' || !session || userRole === 'guest') { 
            const isLiked = savedJobs.includes(j.id);
            const likeAction = isJobseeker ? `onclick="toggleSavedJob('${j.id}')"` : `onclick="showToast('Please login as Job Seeker to save jobs.', 'error')"`;

            if (isJobseeker && isApplied) {
                 actionButtons = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <i class="fa-solid fa-heart like-job-icon ${isLiked ? 'liked' : 'unliked'}" ${likeAction} title="${isLiked ? 'Remove from Saved' : 'Save Job'}"></i>
                        <button class="btn" style="margin-top:auto; background:var(--green); color:#000!important; border:none;" disabled>Applied <i class="fa-solid fa-check"></i></button>
                    </div>
                `;
            } else {
                actionButtons = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        ${isJobseeker ? `<i class="fa-solid fa-heart like-job-icon ${isLiked ? 'liked' : 'unliked'}" ${likeAction} title="${isLiked ? 'Remove from Saved' : 'Save Job'}"></i>` : ''}
                        <button class="btn" style="margin-top:auto; border-color:var(--gold); color:var(--gold);" onclick="openApply('${j.id}')">Apply Now</button>
                    </div>
                `;
            }
        } 
        else if (isEmployer) {
             actionButtons = `<div style="font-size: 11px; color: var(--muted); margin-top: auto;">Employer view</div>`;
        }

        const conf = catConfig[j.category] || { icon: 'fa-tag', emoji: '' };

        el.innerHTML = `
            <div style="flex:1">
                <h3>${escapeHtml(j.title)}</h3>
                <div class="meta">
                    <span title="Company"><i class="fa-solid fa-building"></i> ${escapeHtml(j.company)}</span>
                    <span title="Location"><i class="fa-solid fa-location-dot" style="color:#00d4ff"></i> ${escapeHtml(j.location)}</span>
                    <span title="Category"><i class="fa-solid ${conf.icon}" style="color:#e91e63"></i> ${escapeHtml(j.category)}</span>
                </div>
                <p style="font-size:13px; margin-top:12px; line-height:1.5; color:var(--muted);">
                    ${escapeHtml(j.description).slice(0, 150)}...
                </p>
            </div>
            <div class="right">
                <div class="pill">₹${escapeHtml(j.salary)}</div>
                ${actionButtons}
            </div>
        `;
        targetEl.appendChild(el);
    });
}

// --- SECURE VERIFY PROFILE FUNCTION ---
window.verifyProfile = (id) => {
    const session = get(KEY_SESSION);
    if (!session) return showToast('Please login to verify.', 'error');

    const profiles = get(KEY_CANDIDATE_PROFILES);
    const profileIndex = profiles.findIndex(p => p.id === id);
    
    if (profileIndex === -1) return showToast('Profile not found.', 'error');

    const profile = profiles[profileIndex];

    // LOGIC: Check if user is Admin OR if their email matches the Manager Email
    const isAuthorizedManager = session.role === 'employer' && 
                                profile.managerEmail && 
                                session.email.toLowerCase().trim() === profile.managerEmail.toLowerCase().trim();

    if (session.role === 'admin' || isAuthorizedManager) {
        profiles[profileIndex].status = 'Verified';
        set(KEY_CANDIDATE_PROFILES, profiles);
        
        if(isAuthorizedManager) {
            showToast(`Thank you! You have successfully verified ${profile.name}.`, 'success');
        } else {
            showToast(`Profile ${profile.name} Verified by Admin!`, 'success');
        }
        renderCandidateProfiles(); 
    } else {
        showToast('Access Denied: Only the previous manager (' + profile.managerEmail + ') can verify this.', 'error');
    }
}
// --- END VERIFY PROFILE FUNCTION ---

// --- DELETE PROFILE FUNCTION ---
window.deleteProfile = (id) => {
    const session = get(KEY_SESSION);
    if (!session) return showToast('Please log in to delete profiles.', 'error');

    const profiles = get(KEY_CANDIDATE_PROFILES);
    const profile = profiles.find(p => p.id === id);

    // UPDATED: Admin can delete any profile
    if (session.role === 'admin') {
         if(confirm(`Admin action: Are you sure you want to delete profile for ${profile.currentRole}?`)) {
            const updatedProfiles = profiles.filter(p => p.id !== id);
            set(KEY_CANDIDATE_PROFILES, updatedProfiles);
            showToast('Profile deleted successfully by Admin.', 'success');
            renderCandidateProfiles();
        }
    } 
    else if (profile && profile.userId === session.id) {
        if(confirm(`Are you sure you want to delete your profile for ${profile.currentRole}?`)) {
            const updatedProfiles = profiles.filter(p => p.id !== id);
            set(KEY_CANDIDATE_PROFILES, updatedProfiles);
            showToast('Your profile was deleted successfully.', 'success');
            renderCandidateProfiles();
        }
    } 
    else if (profile.id === 'p1') {
        showToast('Creator profile cannot be deleted.', 'error');
    }
    else {
        showToast('You can only delete your own submitted profiles.', 'error');
    }
}


function renderCandidateProfiles() {
    const session = get(KEY_SESSION);
    const userId = session ? session.id : null;
    const userEmail = session ? session.email.toLowerCase().trim() : '';
    
    // Check user roles
    const isAdmin = session && session.role === 'admin';
    const isEmployer = session && session.role === 'employer';
    
    const allProfiles = get(KEY_CANDIDATE_PROFILES);
    
    // Filter: Show Verified OR My Own OR Pending (for Admin/Employer to see)
    const filteredProfiles = allProfiles.filter(p => 
        p.status === 'Verified' || (userId && p.userId === userId)
        || ( (isAdmin || isEmployer) && p.status === 'Pending Verification')
    );
    
    const hireRequests = get(KEY_HIRE_REQUESTS);
    const el = $('profilesList');
    el.innerHTML = '';
    
    if(!filteredProfiles.length) { el.innerHTML='<div style="padding:20px; text-align:center;">No profiles available currently.</div>'; return; }

    filteredProfiles.slice().reverse().forEach(p => {
        const d = document.createElement('div');
        
        const isPremium = p.id === 'p1' && p.name === 'Naresh Suthar';
        const isPending = p.status === 'Pending Verification';
        const isOwnProfile = userId && p.userId === userId;
        
        // CHECK: Is the logged-in user the specific manager for this profile?
        const isTargetManager = isEmployer && p.managerEmail && (userEmail === p.managerEmail.toLowerCase().trim());

        d.className = 'profile-card';
        if(isPremium) d.classList.add('premium');
        if(isPending) d.classList.add('pending');
        
        // Highlight card for the specific manager
        if(isPending && isTargetManager) {
            d.style.borderColor = '#00cc66'; // Green border for the manager to notice
            d.style.boxShadow = '0 0 15px rgba(0, 204, 102, 0.2)';
        }

        const requestSentByAdmin = hireRequests.some(req => req.candidateId === p.id);
        const requestSentByThisEmployer = isEmployer && hireRequests.some(req => req.candidateId === p.id && req.employerEmail === session.email);
        
        let actionAreaHtml = '';

        if (p.id !== 'p1') { 
            
            // 1. ADMIN ACTIONS (Can Verify All, Edit All, Delete All)
            if (isAdmin) {
                actionAreaHtml += `
                    <div class="action-row" style="justify-content: flex-end; gap: 8px;">
                        <button class="action-btn edit" onclick="editProfile('${p.id}')" title="Edit Profile"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn del" onclick="deleteProfile('${p.id}')" title="Delete Profile"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                `;
                if (isPending) {
                     actionAreaHtml += `
                        <div style="margin-top: 10px;">
                            <button class="btn cta verify-btn" onclick="verifyProfile('${p.id}')">Verify (Admin)</button>
                            <div class="hire-status">Pending Verification</div>
                        </div>`;
                } else if (requestSentByAdmin) {
                    actionAreaHtml += `<div class="hire-status" style="margin-top:10px; color:var(--green);">Offer Sent</div>`;
                } else {
                    actionAreaHtml += `<div style="margin-top:10px;"><button class="btn cta hire-btn" onclick="openHireModal('${p.id}', '${p.name}')">Send Offer</button></div>`;
                }
            } 
            
            // 2. EMPLOYER ACTIONS (Specific Manager Logic)
            else if (isEmployer) {
                if (isPending) {
                    if (isTargetManager) {
                        // Agar ye wahi manager hai jiska email dala tha
                        actionAreaHtml = `
                            <div style="background:rgba(0,204,102,0.1); padding:10px; border-radius:8px; text-align:right;">
                                <div style="font-size:12px; color:var(--green); margin-bottom:5px;">Former Employee Verification Req.</div>
                                <button class="btn cta verify-btn" onclick="verifyProfile('${p.id}')">
                                    <i class="fa-solid fa-check"></i> Verify Now
                                </button>
                            </div>
                        `;
                    } else {
                        // Agar ye koi aur employer hai
                        actionAreaHtml = `
                            <div class="hire-status" style="color:var(--muted); font-weight:600;">
                                <i class="fa-solid fa-lock"></i> Verification Pending <br>
                                <span style="font-size:10px; font-weight:400;">(Waiting for Manager Approval)</span>
                            </div>
                        `;
                    }
                } else if (p.status === 'Verified') {
                    if (requestSentByThisEmployer) {
                         actionAreaHtml = `<div class="hire-status">Offer Sent</div>`;
                    } else {
                        actionAreaHtml = `<div style="margin-top:10px;"><button class="btn cta hire-btn" onclick="openHireModal('${p.id}', '${p.name}')">Send Offer</button></div>`;
                    }
                }
            }
            
            // 3. JOBSEEKER ACTIONS
            else if (isOwnProfile && session.role === 'jobseeker') {
                actionAreaHtml = `
                    <button class="btn profile-edit-btn" onclick="editProfile('${p.id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="btn profile-del-btn" onclick="deleteProfile('${p.id}')"><i class="fa-solid fa-trash-can"></i> Delete</button>
                    <div class="hire-status" style="margin-top:10px;">
                        ${isPending ? '<i class="fa-solid fa-clock"></i> Sent to Manager for Verification' : '<i class="fa-solid fa-check-circle"></i> Profile Verified'}
                    </div>
                `;
            }
            
            // 4. GUEST VIEW
            else {
                actionAreaHtml = isPending 
                    ? `<div class="hire-status">Verification Pending</div>` 
                    : `<div class="hire-status">Verified Candidate</div>`;
            }
        } 
        
        // Creator Profile Display
        else if (isPremium) {
            actionAreaHtml = `<div class="hire-status"><span style="color:var(--gold-light); font-weight:700;">⭐ Creator Profile</span></div>`;
        }

        d.innerHTML = `
            <div class="profile-card-left">
                <div class="profile-photo">
                    <img src="${p.photoUrl}" alt="${p.name}" onerror="this.onerror=null; this.src='https://i.pravatar.cc/150?u=fallback';" />
                </div>
                <div class="profile-info">
                    <h4>${escapeHtml(p.name)}</h4>
                    <div class="role">${escapeHtml(p.currentRole)}</div>
                    <div class="prev-company">Last worked at: <strong>${escapeHtml(p.prevCompany)}</strong> (${escapeHtml(p.prevRole)})</div>
                    <p class="experience-text">${escapeHtml(p.experience)}</p>
                </div>
            </div>
            <div class="profile-card-right">
                ${actionAreaHtml}
            </div>
        `;
        el.appendChild(d);
    });
}

let targetCandidateId = null;

window.openHireModal = (id, name) => {
    const s = get(KEY_SESSION);
    if (!s || (s.role !== 'employer' && s.role !== 'admin')) {
        return showToast('Only Employers/Admin can send hire requests.', 'error');
    }
    targetCandidateId = id;
    $('hireCandidateName').textContent = name;
    $('hireModal').style.display = 'flex';
    $('hire_job_title').value = '';
    $('hire_salary').value = '';
    $('hire_message').value = '';
};

$('closeHireModal').onclick = () => { $('hireModal').style.display = 'none'; };

$('submitHireRequest').onclick = () => {
    const s = get(KEY_SESSION);
    const jobTitle = trim($('hire_job_title').value);
    const salary = trim($('hire_salary').value);
    const message = trim($('hire_message').value);
    
    if (!jobTitle || !salary) return showToast('Please enter Job Title and Salary.', 'error');

    const candidate = get(KEY_CANDIDATE_PROFILES).find(p => p.id === targetCandidateId);
    if (!candidate) return showToast('Candidate not found.', 'error');

    const newRequest = {
        id: uid(),
        candidateId: targetCandidateId,
        candidateName: candidate.name,
        employerEmail: s.email,
        employerName: s.name,
        jobTitle: jobTitle,
        salary: salary,
        message: message,
        date: new Date().toISOString()
    };

    const requests = get(KEY_HIRE_REQUESTS);
    requests.push(newRequest);
    set(KEY_HIRE_REQUESTS, requests);

    showToast(`Hire request sent to ${candidate.name} successfully!`, 'success');
    $('hireModal').style.display = 'none';
    renderCandidateProfiles(); 
    updateNotificationBadge(); 
};

// --- NEW: Notification Rendering (For Job Seekers) ---
function updateNotificationBadge() {
    const s = get(KEY_SESSION);
    const badge = $('notificationCount');
    
    if (!s || s.role !== 'jobseeker') {
        badge.style.display = 'none';
        return;
    }
    
    const hireRequests = get(KEY_HIRE_REQUESTS);
    const profile = get(KEY_CANDIDATE_PROFILES).find(p => p.userId === s.id);
    
    if (!profile) {
        badge.style.display = 'none';
        return;
    }
    
    const unreadCount = hireRequests.filter(req => req.candidateId === profile.id && !req.read).length;
    
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function renderNotificationsView() {
    const s = get(KEY_SESSION);
    const el = $('notificationsViewList');
    el.innerHTML = '';

    if (!s || s.role !== 'jobseeker') {
        el.innerHTML = '<div class="card" style="padding:20px; text-align:center;">Only Job Seekers can view Hire Notifications.</div>';
        return;
    }
    
    const profile = get(KEY_CANDIDATE_PROFILES).find(p => p.userId === s.id);
    
    if (!profile) {
        el.innerHTML = '<div class="card" style="padding:20px; text-align:center; color:var(--muted);">Please submit your job history profile first to receive hire requests.</div>';
        return;
    }

    let hireRequests = get(KEY_HIRE_REQUESTS);
    const myRequests = hireRequests.filter(req => req.candidateId === profile.id).slice().reverse();
    
    if (myRequests.length === 0) {
         el.innerHTML = '<div class="card" style="padding:20px; text-align:center; color:var(--muted);">No notifications or hire requests received yet.</div>';
         return;
    }
    
    // Mark all as read when the page is viewed
    let hasUnread = false;
    hireRequests.forEach(req => {
        if (req.candidateId === profile.id && !req.read) {
            req.read = true;
            hasUnread = true;
        }
    });
    if (hasUnread) {
        set(KEY_HIRE_REQUESTS, hireRequests);
        updateNotificationBadge();
    }
    
    myRequests.forEach(req => {
        const d = document.createElement('div');
        d.className = 'notification-card'; // Using the better looking notification-card style
        d.style.borderLeftColor = req.read ? 'var(--gold)' : 'var(--red)';
        d.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <h4 style="margin:0; font-size:18px; color:var(--text-main);"><i class="fa-solid fa-handshake" style="color:var(--green)"></i> Hire Offer: ${escapeHtml(req.jobTitle)}</h4>
                <div style="font-size:12px; color:var(--muted);">${new Date(req.date).toLocaleDateString()}</div>
            </div>
            <p style="font-size:13px; color:var(--muted); margin-top:10px;">
                From: <strong>${escapeHtml(req.employerName)}</strong> (Email: ${escapeHtml(req.employerEmail)})
            </p>
            <p style="font-size:14px; color:var(--gold); font-weight:600; margin-top:5px;">
                Proposed Salary: ₹${escapeHtml(req.salary)} / Month
            </p>
            <blockquote style="margin-top:15px; padding:10px; border-left:3px solid var(--border); font-size:13px; color:var(--text-main);">
                ${escapeHtml(req.message) || 'No message provided.'}
            </blockquote>
            <div style="margin-top:15px; text-align:right;">
                <button class="btn hire-btn" style="background:var(--green); color:#000;"><i class="fa-solid fa-check"></i> Accept Offer</button>
                <button class="btn profile-del-btn" style="margin-left:10px;"><i class="fa-solid fa-xmark"></i> Decline</button>
            </div>
        `;
        el.appendChild(d);
    });
}

// Toggle logic for the dropdown bell icon
$('notificationBtn').onclick = () => {
    const s = get(KEY_SESSION);
    const popup = $('notification-popup');
    
    if (!s || s.role !== 'jobseeker') {
        // If not logged in as jobseeker, show toast and return
        showToast('Please login as Job Seeker to view notifications.', 'error');
        popup.style.display = 'none';
        return;
    }
    
    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
    } else {
        // Show the popup and render list
        renderNotificationsPopup();
        popup.style.display = 'flex';
    }
};

function renderNotificationsPopup() {
    const s = get(KEY_SESSION);
    const el = $('notificationList');
    el.innerHTML = '';
    
    const profile = get(KEY_CANDIDATE_PROFILES).find(p => p.userId === s.id);
    if (!profile) {
        el.innerHTML = '<div class="no-notifications">Profile not submitted. No notifications.</div>';
        return;
    }

    let hireRequests = get(KEY_HIRE_REQUESTS);
    const myRequests = hireRequests.filter(req => req.candidateId === profile.id).slice().reverse();
    
    if (myRequests.length === 0) {
         el.innerHTML = '<div class="no-notifications">No new hire requests.</div>';
         return;
    }
    
    myRequests.slice(0, 5).forEach(req => {
        const isNew = !req.read;
        const d = document.createElement('div');
        d.className = 'notification-item';
        if (isNew) d.style.background = 'rgba(212,175,55,0.1)';
        
        d.innerHTML = `
            ${isNew ? '<i class="fa-solid fa-circle" style="font-size: 8px; color: var(--red); margin-right: 5px;"></i>' : ''}
            New Offer: <strong>${escapeHtml(req.jobTitle)}</strong> (₹${escapeHtml(req.salary)}) from ${escapeHtml(req.employerName)}.
        `;
        el.appendChild(d);
    });
    
    if (myRequests.length > 5) {
        el.innerHTML += `<div class="notification-item" style="text-align:center;">
            <a href="#" onclick="showView('notifications'); return false;" style="color:var(--gold);">View All ${myRequests.length} Notifications</a>
        </div>`;
    }
}
// --- END NEW: Notification Rendering ---

// --- EMPLOYER ACTIONS ---
window.hireApplication = (appId) => {
    const s = get(KEY_SESSION);
    if (!s || (s.role !== 'employer' && s.role !== 'admin')) return showToast('Permission Denied.', 'error');

    if(confirm('Are you sure you want to HIRE this candidate?')) {
        const statusList = get(KEY_APP_STATUS);
        const app = get(KEY_APPS).find(a => a.id === appId);
        const newStatus = { id: uid(), appId: appId, status: 'Accepted', date: new Date().toISOString() };
        statusList.push(newStatus);
        set(KEY_APP_STATUS, statusList);
        showToast(`Hire request ACCEPTED for ${app.name}!`, 'success');
        
        // Notify Job Seeker (Simulated Notification/Toast on their next login/refresh)
        // For demonstration, we simply update the status and re-render
        
        renderEmployerApplications();
        renderDashboard();
    }
}

window.rejectApplication = (appId) => {
    const s = get(KEY_SESSION);
    if (!s || (s.role !== 'employer' && s.role !== 'admin')) return showToast('Permission Denied.', 'error');

     if(confirm('Are you sure you want to REJECT this candidate?')) {
        const statusList = get(KEY_APP_STATUS);
        const app = get(KEY_APPS).find(a => a.id === appId);
        const newStatus = { id: uid(), appId: appId, status: 'Rejected', date: new Date().toISOString() };
        statusList.push(newStatus);
        set(KEY_APP_STATUS, statusList);
        showToast(`Application REJECTED for ${app.name}.`, 'error');
        
        renderEmployerApplications();
        renderDashboard();
    }
}

// NEW: Contact Candidate (Call/Chat Simulation)
window.contactCandidate = (type, value) => {
    if (type === 'call') {
        showToast(`📞 Initiating call to: ${value} (Simulated)`, 'info');
        // Actual call link (for mobile users): window.location.href = `tel:${value}`;
    } else if (type === 'chat') {
        showToast(`💬 Opening chat window with: ${value} (Simulated)`, 'info');
        // Actual WhatsApp link (if formatted correctly): window.location.href = `https://wa.me/${value}`;
    }
};


// --- NEW: Employer/Admin Application View (FIXED ACTIONS) ---
function renderEmployerApplications() {
    const apps = get(KEY_APPS);
    const el = $('appList'); 
    el.innerHTML = '';
    $('appViewTitle').innerHTML = '<i class="fa-solid fa-handshake-angle" style="color:#9c27b0"></i> Applications Received';

    const session = get(KEY_SESSION);
    const isAdmin = session && session.role === 'admin';
    const appStatusList = get(KEY_APP_STATUS);
    
    if (!session || (session.role !== 'employer' && session.role !== 'admin')) {
        el.innerHTML = `<div style="padding:20px; text-align:center; color:var(--muted);">Please login as an Employer or Admin to view received applications.</div>`;
        return;
    }
    
    const allJobs = get(KEY_JOBS);
    
    // Filter applications for jobs posted by the logged-in Employer/Admin
    const relevantJobs = allJobs.filter(j => isAdmin || j.creatorId === session.id);
    const relevantJobIds = relevantJobs.map(j => j.id);

    // Filter to show ONLY PENDING applications in the main list
    const pendingApps = apps.filter(a => {
        const isRelevant = relevantJobIds.includes(a.jobId);
        if (!isRelevant) return false;
        
        const latestStatus = appStatusList.filter(s => s.appId === a.id)
                                          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        // Show if status is null, 'Submitted', or 'Pending' (default for a new application before Hire/Reject)
        return !latestStatus || latestStatus.status === 'Submitted' || latestStatus.status === 'Pending';
    }).slice().reverse();

    if (pendingApps.length === 0) {
        el.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted)">No pending applications requiring review.</div>`;
        return;
    }

    pendingApps.forEach(a => {
        const d = document.createElement('div');
        d.className = 'job';
        
        // Note: Status is always Pending/Submitted here due to the filter
        
        const actionButtons = `
            <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn hire-btn" onclick="hireApplication('${a.id}')" style="background:var(--green); color:#000!important;">Hire</button>
                <button class="btn profile-del-btn" onclick="rejectApplication('${a.id}')" style="margin-left:0;">Reject</button>
            </div>
        `;

        d.innerHTML = `
            <div style="flex:1">
                <h3 style="color:var(--text-main);"><i class="fa-solid fa-user-check" style="color:var(--gold)"></i> Candidate: ${escapeHtml(a.name)}</h3>
                <p style="font-size:14px; color:var(--muted); margin-top:5px;">Applied for: <strong>${escapeHtml(a.jobTitle)}</strong></p>
                <div class="meta" style="margin-top:8px; align-items: center;">
                    <span title="Email"><i class="fa-solid fa-envelope" style="color:#00d4ff"></i> ${escapeHtml(a.email)}</span>
                    <span title="Phone"><i class="fa-solid fa-phone" style="color:#00cc66"></i> ${escapeHtml(a.phone)}</span>
                </div>
                <p style="font-size:13px; margin-top:12px; line-height:1.5; color:var(--muted);">
                    Skills/Note: ${escapeHtml(a.skills) || 'N/A'}
                </p>
                <p style="font-size:11px; margin-top:8px; color:var(--muted);">
                    Received On: ${new Date(a.applied).toLocaleDateString()} | 
                    Status: <span style="color:var(--gold); font-weight:700;">Pending Review</span>
                </p>
            </div>
            <div class="right" style="justify-content:center;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                    <button class="action-btn" title="Call Candidate" onclick="contactCandidate('call', '${escapeHtml(a.phone)}')">
                        <i class="fa-solid fa-phone" style="color:var(--green)"></i>
                    </button>
                    <button class="action-btn" title="Chat Candidate" onclick="contactCandidate('chat', '${escapeHtml(a.phone)}')">
                        <i class="fa-solid fa-comment" style="color:#00d4ff"></i>
                    </button>
                </div>
                <button class="btn" style="border-color:#00d4ff; color:#00d4ff; width: 100%;" onclick="downloadApp('${a.id}')" title="Download Full Application PDF">
                    <i class="fa-solid fa-file-pdf"></i> Download PDF
                </button>
                <div class="action-row" style="margin-top: 10px; justify-content: space-between; width: 100%;">
                    ${isAdmin ? `<button class="action-btn del" onclick="removeApp('${a.id}')" title="Admin Delete Application"><i class="fa-solid fa-trash-can"></i></button>` : ''}
                    ${actionButtons}
                </div>
            </div>
        `;
        el.appendChild(d);
    });
}

// --- NEW: Jobseeker/Admin Application View (FIXED STATUS FLOW) ---
function renderJobseekerApplications() {
    const apps = get(KEY_APPS);
    const el = $('appList'); 
    el.innerHTML = '';
    $('appViewTitle').innerHTML = '<i class="fa-solid fa-file-invoice" style="color:#2196f3"></i> My Job Applications';

    const session = get(KEY_SESSION);
    const isJobseeker = session && session.role === 'jobseeker';
    const isAdmin = session && session.role === 'admin';
    const appStatusList = get(KEY_APP_STATUS);

    if (!session || (!isJobseeker && !isAdmin)) {
        el.innerHTML = `<div style="padding:20px; text-align:center; color:var(--muted);">Please login as a Job Seeker or Admin to view your applications.</div>`;
        return;
    }
    
    // Filter applications by user email or show all if admin
    const myApplications = apps.filter(a => isAdmin || a.email.toLowerCase() === session.email.toLowerCase()).slice().reverse();

    if(myApplications.length === 0){ 
        el.innerHTML='<div style="text-align:center; padding:20px; color:var(--muted)">You haven\'t applied for any jobs yet. Start exploring our Elite Listings!</div>'; 
        return; 
    }
    
    myApplications.forEach(a => {
        const latestStatus = appStatusList.filter(s => s.appId === a.id)
                                          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        
        let status = latestStatus ? latestStatus.status : 'Submitted';
        
        let status1Class = (status === 'Submitted' || status === 'Pending' || status === 'Accepted' || status === 'Rejected') ? 'completed' : '';
        let status2Class = (status === 'Pending' || status === 'Accepted') ? 'active' : ''; // Pending (Review)
        let status3Class = (status === 'Accepted') ? 'completed' : (status === 'Rejected') ? 'rejected' : '';
        
        let decisionText = status === 'Accepted' ? 'Hired/Accepted' : status === 'Rejected' ? 'Rejected' : 'Hiring Decision';
        
        const d = document.createElement('div');
        d.className = 'job';
        d.innerHTML = `
            <div style="flex:1">
                <h3 style="color:var(--text-main);"><i class="fa-solid fa-file-invoice"></i> Applied for: ${escapeHtml(a.jobTitle)}</h3>
                <p style="font-size:13px; margin-top:12px; line-height:1.5; color:var(--muted);">
                    Skills/Note: ${escapeHtml(a.skills) || 'N/A'}
                </p>
                <div class="status-flow">
                    <span class="status-step ${status1Class}"><i class="fa-solid fa-file-export"></i> Submitted</span>
                    <span class="flow-arrow">></span>
                    <span class="status-step ${status2Class}"><i class="fa-solid fa-clock"></i> Pending Review</span>
                    <span class="flow-arrow">></span>
                    <span class="status-step ${status3Class}"><i class="fa-solid fa-handshake-angle"></i> ${decisionText}</span>
                </div>
                <p style="font-size:11px; margin-top:8px; color:var(--muted);">
                    Applied On: ${new Date(a.applied).toLocaleDateString()}
                </p>
            </div>
            <div class="right" style="justify-content:center;">
                <button class="btn" style="border-color:#00d4ff; color:#00d4ff;" onclick="downloadApp('${a.id}')" title="Download Application Form">
                    <i class="fa-solid fa-file-pdf"></i> Download PDF
                </button>
            </div>
        `;
        el.appendChild(d);
    });
}
// --- END NEW: Application View Functions ---


function renderDashboard(){
    const jobs = get(KEY_JOBS);
    $('statJobs').textContent = jobs.length;
    
    const session = get(KEY_SESSION);
    const apps = get(KEY_APPS);
    let appCount = 0;
    let labelText = "Total Applications (Guest)";

    if (session) {
        const isAdmin = session.role === 'admin';
        const isEmployer = session.role === 'employer';
        const isJobseeker = session.role === 'jobseeker';
        const appStatusList = get(KEY_APP_STATUS);

        if (isAdmin) {
             appCount = apps.length;
             labelText = "Total Applications (Admin)";
        } else if (isEmployer) {
            const myJobIds = get(KEY_JOBS).filter(j => j.creatorId === session.id).map(j => j.id);
            
            const pendingApps = apps.filter(a => {
                const isRelevant = myJobIds.includes(a.jobId);
                if (!isRelevant) return false;
                
                const latestStatus = appStatusList.filter(s => s.appId === a.id)
                                                  .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                
                // If no status or status is "Submitted", it's pending review
                return !latestStatus || latestStatus.status === 'Submitted' || latestStatus.status === 'Pending';
            });
            appCount = pendingApps.length;
            labelText = "Pending Applications";
        } else if (isJobseeker) {
            appCount = apps.filter(a => a.email.toLowerCase() === session.email.toLowerCase()).length;
            labelText = "My Total Applications";
        }
    }
    
    $('statApps').textContent = appCount;
    $('statAppsLabel').textContent = labelText;

    renderJobsList(jobs.slice().reverse().slice(0,6), $('recentJobs'));
    checkSession();
}

function renderAllJobs() {
    const jobs = get(KEY_JOBS);
    const search = trim($('searchInput').value).toLowerCase();
    const category = trim($('searchCategory').value);
    const salaryRange = trim($('searchSalaryRange').value);
    
    const [minSalary, maxSalary] = salaryRange ? salaryRange.split('-').map(s => parseInt(s)) : [0, Infinity];

    const filteredJobs = jobs.filter(j => {
        const jobSalary = parseInt(j.salary);

        const matchesSearch = search === '' || 
                              j.title.toLowerCase().includes(search) || 
                              j.description.toLowerCase().includes(search) ||
                              j.location.toLowerCase().includes(search) ||
                              j.company.toLowerCase().includes(search);
                              
        const matchesCategory = category === '' || j.category === category;
        
        const matchesSalary = !salaryRange || (jobSalary >= minSalary && jobSalary <= maxSalary);
        
        return matchesSearch && matchesCategory && matchesSalary;
    });
    
    renderJobsList(filteredJobs, $('allJobs'));
}
$('searchInput').addEventListener('keyup', renderAllJobs);
$('searchCategory').addEventListener('change', renderAllJobs);
$('searchSalaryRange').addEventListener('change', renderAllJobs); 


function prepareAddForm(){ 
    editId=null; 
    $('jobForm').reset(); 
    popCats(); 
    toggleOtherCategory();
}

$('jobForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = trim($('f_title').value);
    const salary = trim($('f_salary').value);
    const selectedCategory = $('f_category').value;
    const otherCategory = trim($('f_other_category_input').value);

    if(!title || !salary || !selectedCategory) {
        return showToast('Title, Salary, and Category are required.', 'error');
    }
    
    let finalCategory = selectedCategory;
    if (selectedCategory === 'Other') {
        if (!otherCategory) {
            return showToast('Please specify the custom category.', 'error');
        }
        finalCategory = trim(otherCategory);
    }

    const session = get(KEY_SESSION);
    const creatorId = session ? session.id : null;
    
    const jobs = get(KEY_JOBS);
    const jobData = {
        title, 
        company: trim($('f_company').value)||'Private', 
        category: finalCategory, 
        salary, 
        location: trim($('f_location').value), 
        description: trim($('f_description').value),
        created: new Date().toISOString(),
        creatorId: creatorId 
    };
    
    if(editId){
        const idx = jobs.findIndex(x=>x.id===editId);
        if(idx>-1) jobs[idx] = {...jobs[idx], ...jobData};
    } else { 
        jobData.id = uid(); 
        jobs.push(jobData); 
    }
    set(KEY_JOBS, jobs);
    showToast(editId ? 'Job Updated' : 'Job Posted Successfully', 'success');
    $('jobForm').reset();
    showView('jobs');
});

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

$('jobHistoryForm').addEventListener('submit', async e => {
    e.preventDefault();
    const s = get(KEY_SESSION);
    if (!s) return showToast('Please Login to submit history.', 'error');
    
    const profileId = $('history_profile_id').value;
    const isEdit = !!profileId;
    
    const name = trim($('history_name').value);
    const currentRole = trim($('history_current_role').value);
    const prevCompany = trim($('history_prev_company').value);
    const prevRole = trim($('history_prev_role').value);
    const prevLocation = trim($('history_prev_location').value);
    const managerEmail = trim($('history_manager_email').value);
    const description = trim($('history_description').value);
    const photoFile = $('history_photo').files[0];

    const isCreatorEdit = false;

    if(!isCreatorEdit && (!name || !currentRole || !prevCompany || !prevRole || !managerEmail || !description)) {
        return showToast('Please fill all required fields.', 'error');
    }
    
    let photoBase64 = null;
    let profiles = get(KEY_CANDIDATE_PROFILES);
    let existingProfile = profiles.find(p => p.id === profileId);

    if (photoFile) {
        if (photoFile.size > 1024 * 1024 * 5) { 
            return showToast('Photo size must be less than 5MB.', 'error');
        }
        try {
            photoBase64 = await getBase64(photoFile);
        } catch (error) {
            console.error('Error converting file to base64:', error);
            showToast('Error processing photo. Using existing/default image.', 'error');
        }
    } else if (isEdit && existingProfile) {
        photoBase64 = existingProfile.photoUrl;
    } else {
        photoBase64 = 'https://i.pravatar.cc/150?u='+s.id;
    }

    const jobHistoryData = {
        name: name,
        currentRole: currentRole,
        prevCompany: prevCompany,
        prevRole: prevRole,
        prevLocation: prevLocation,
        managerEmail: managerEmail,
        experience: description,
        photoUrl: photoBase64,
        status: isCreatorEdit ? 'Verified' : 'Pending Verification' 
    };

    if (isEdit) {
        const profileIndex = profiles.findIndex(p => p.id === profileId);
        if (profileIndex > -1) {
            profiles[profileIndex] = {...profiles[profileIndex], ...jobHistoryData};
            set(KEY_CANDIDATE_PROFILES, profiles);
            showToast('Profile Updated Successfully!', 'success');
        }
    } else {
        const newProfile = {
            id: uid(),
            userId: s.id,
            ...jobHistoryData,
            dateSubmitted: new Date().toISOString(),
        };
        profiles.push(newProfile);
        set(KEY_CANDIDATE_PROFILES, profiles);
        showToast('Job History Submitted. It will be verified and published shortly!', 'info');
    }
    
    $('jobHistoryForm').reset();
    showView('profiles'); 
});

$('clearHistoryForm').onclick = () => { $('jobHistoryForm').reset(); };

window.editJob = (id) => {
    const s = get(KEY_SESSION);
    const job = get(KEY_JOBS).find(x=>x.id===id);
    
    if (!s || (s.role !== 'admin' && s.role !== 'employer')) {
        return showToast('Only Admin or Employers can edit jobs.', 'error');
    }
    if (s.role === 'employer' && job.creatorId !== s.id) {
        return showToast('You can only edit your own job posts.', 'error');
    }

    if(job){
        showView('add'); editId = id;
        $('f_title').value = job.title; $('f_company').value = job.company;
        $('f_category').value = job.category; $('f_salary').value = job.salary;
        $('f_location').value = job.location; $('f_description').value = job.description;
        window.scrollTo({top:0, behavior:'smooth'});
    }
};

window.deleteJob = (id) => { 
    const s = get(KEY_SESSION);
    const jobs = get(KEY_JOBS);
    const job = jobs.find(x=>x.id===id);

    if (!s || (s.role !== 'admin' && s.role !== 'employer')) {
        return showToast('Only Admin or Employers can delete jobs.', 'error');
    }
    if (s.role === 'employer' && job.creatorId !== s.id) {
         return showToast('You can only delete your own job posts.', 'error');
    }

    if(confirm('Delete this job post permanently?')){ 
        set(KEY_JOBS, jobs.filter(x=>x.id!==id)); 
        renderAllJobs(); 
        renderDashboard(); 
        showToast('Job Deleted', 'success'); 
    } 
};

const authModal = $('authModal');
const authWrapper = document.querySelector('.auth-wrapper');
$('openLogin').onclick = () => { authModal.style.display='flex'; authWrapper.classList.remove('toggled'); }
$('openRegister').onclick = () => { authModal.style.display='flex'; authWrapper.classList.add('toggled'); }
$('closeAuth').onclick = () => { authModal.style.display='none'; }
document.querySelector('.login-trigger').onclick = (e) => { e.preventDefault(); authWrapper.classList.remove('toggled'); }
document.querySelector('.register-trigger').onclick = (e) => { e.preventDefault(); authWrapper.classList.add('toggled'); }

/* --- PASSWORD TOGGLE LOGIC --- */
function setupPassToggle(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    icon.onclick = () => {
        const isPass = input.type === 'password';
        input.type = isPass ? 'text' : 'password';
        
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
        
        // Reset color to ensure good contrast, as per the improved CSS
        icon.style.color = isPass ? 'var(--gold-light)' : '#fff';
    };
}
setupPassToggle('loginPass', 'toggleLoginPass');
setupPassToggle('regPass', 'toggleRegPass');


// --- FORGOT PASSWORD LOGIC ---
const forgotPassModal = $('forgotPassModal');
$('forgotPassModal').style.display = 'none';

document.querySelector('.forgot-trigger').onclick = (e) => { 
    e.preventDefault(); 
    $('authModal').style.display = 'none'; 
    forgotPassModal.style.display = 'flex'; 
    $('forgotEmail').value = ''; 
}

$('closeForgot').onclick = () => { 
    forgotPassModal.style.display = 'none'; 
    $('authModal').style.display = 'flex'; 
    document.querySelector('.auth-wrapper').classList.remove('toggled');
};

$('submitForgotRequest').onclick = () => {
    const email = trim($('forgotEmail').value);
    if (!email) {
        return showToast('Please enter your email.', 'error');
    }

    const user = get(KEY_USERS).find(x => x.email === email);
    
    if (user) {
        showToast(`Password reset link sent to ${email}. Check your inbox!`, 'success');
    } else {
        showToast(`Email ${email} not found. Please register.`, 'error');
    }

    forgotPassModal.style.display = 'none';
    $('authModal').style.display = 'flex';
    document.querySelector('.auth-wrapper').classList.remove('toggled');
};

$('doLogin').onclick = () => {
    const email = trim($('loginEmail').value);
    const pass = trim($('loginPass').value);
    
    if(!email || !pass) {
        return showToast('Email and Password are required for login.', 'error');
    }

    const u = get(KEY_USERS).find(x => x.email===email && x.pass===pass);
    if(u){
        set(KEY_SESSION, {id:u.id, name:u.name, email:u.email, role:u.role});
        authModal.style.display='none';
        checkSession();
        renderAllJobs();
        showToast(`Welcome back, ${u.name}`, 'success');
        updateNotificationBadge();
    } else { 
        showToast('Invalid Credentials. Please check your email and password.', 'error'); 
    }
};

$('doRegister').onclick = () => {
    const name = trim($('regName').value); 
    const email = trim($('regEmail').value); 
    const pass = trim($('regPass').value); 
    const role = trim($('regRole').value);
    
    if(!name || !email || !pass || !role) {
        return showToast('Please fill all fields (Username, Email, Password, and Role).', 'error');
    }

    const users = get(KEY_USERS);
    if(users.find(x=>x.email===email)) return showToast('Email already taken. Please login or use a different email.', 'error');
    
    users.push({id:uid(), name, email, pass, role});
    set(KEY_USERS, users);
    showToast('Account Created Successfully! Please Log In.', 'success');
    authWrapper.classList.remove('toggled');
};

$('doLogout').onclick = () => { 
    localStorage.removeItem(KEY_SESSION); 
    checkSession(); 
    renderAllJobs(); 
    showView('dashboard'); 
    showToast('Logged Out Successfully', 'success'); 
};

let applyId = null;
window.openApply = (id) => { 
    let s = get(KEY_SESSION);
    if(Array.isArray(s)) s = null;
    
    if(!s) {
        // Show error toast instead of redirecting to login modal
        showToast('Please login as Job Seeker to apply for jobs.', 'error'); 
        return; 
    }
    
    if(s.role !== 'jobseeker' && s.role !== 'admin') return showToast('Only Job Seekers/Admin can apply for jobs.', 'error');
    
    const apps = get(KEY_APPS);
    const isApplied = apps.some(a => a.jobId === id && a.email === s.email);

    if (isApplied) {
        showToast('You have already applied for this job!', 'info');
        // Close modal if it was accidentally opened
        $('applyModal').style.display='none';
        return;
    }

    applyId = id; 
    $('applyModal').style.display='flex'; 
    const job = get(KEY_JOBS).find(x=>x.id===applyId);
    $('applyJobTitle').textContent = `Apply for: ${job ? job.title : 'Job'}`;
    
    // Autofill details from session
    $('app_name').value = s.name || '';
    $('app_email').value = s.email || '';
    $('app_phone').value = ''; 
    $('app_skills').value = '';
};
$('closeApply').onclick = () => $('applyModal').style.display='none';
$('submitApply').onclick = () => {
    const apps = get(KEY_APPS); 
    const job = get(KEY_JOBS).find(x=>x.id===applyId);
    
    const s = get(KEY_SESSION);
    if (!s) return showToast('Login session expired. Please log in again.', 'error');

    // **NEW: Check again for double application before submitting**
    const isApplied = apps.some(a => a.jobId === applyId && a.email === s.email);
    if (isApplied) {
        showToast('Application already submitted for this job!', 'error');
        $('applyModal').style.display='none';
        return;
    }
    // **END NEW CHECK**

    const newApp = { 
        id:uid(), 
        jobId:applyId, 
        jobTitle:job?job.title:'Unknown', 
        name: $('app_name').value, 
        email: s.email, 
        phone: $('app_phone').value, 
        skills: $('app_skills').value, 
        applied: new Date().toISOString() 
    };

    apps.push(newApp);
    set(KEY_APPS, apps); 
    
    // Set initial status to Submitted/Pending 
    const statusList = get(KEY_APP_STATUS);
    statusList.push({ id: uid(), appId: newApp.id, status: 'Submitted', date: new Date().toISOString() });
    set(KEY_APP_STATUS, statusList);
    
    // Notify Employer (Simulated)
    const employerEmail = job.creatorId === 'p1_creator_id' ? LOGIN_ADMIN_EMAIL : (get(KEY_USERS).find(u => u.id === job.creatorId)?.email || 'Employer');
    showToast(`🔔 New application received for ${job.title} from ${newApp.name} (Employer: ${employerEmail})`, 'info');

    showToast('Application Sent!', 'success'); 
    $('applyModal').style.display='none';
    
    // Refresh relevant views instantly
    renderAllJobs(); 
    if (document.querySelector('.nav button.active')?.dataset.view === 'jobseeker-apps') {
         renderJobseekerApplications(); 
    }
    renderDashboard(); 
};

window.removeApp = (id) => {
    const s = get(KEY_SESSION);
    const app = get(KEY_APPS).find(a => a.id === id);
    if (!app) return showToast('Application not found.', 'error');

    // Only Admin can delete applications globally
    if (!s || s.role !== 'admin') { 
        return showToast('Permission Denied: Only Admin can delete applications.', 'error');
    }
    
    if(confirm(`Admin Action: Are you sure you want to delete application by ${app.name} (${app.jobTitle})?`)){
        const apps = get(KEY_APPS).filter(x => x.id !== id);
        const statusList = get(KEY_APP_STATUS).filter(x => x.appId !== id);

        set(KEY_APPS, apps);
        set(KEY_APP_STATUS, statusList);
        
        // Re-render based on current view
        const currentView = document.querySelector('.nav button.active')?.dataset.view;
        if (currentView === 'employer-apps') renderEmployerApplications(); 
        else if (currentView === 'jobseeker-apps') renderJobseekerApplications();
        else renderDashboard(); 
        
        showToast('Application Deleted by Admin', 'success');
    }
};

// --- NEW: Enhanced Download Function (Simulated PDF - FIXED) ---
window.downloadApp = (id) => {
    const app = get(KEY_APPS).find(x=>x.id===id);
    if (!app) return showToast('Application data not found.', 'error');
    
    const job = get(KEY_JOBS).find(x=>x.id===app.jobId);
    
    // Simulated PDF content creation
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 30px; border: 5px solid #d4af37; max-width: 650px; margin: 0 auto; box-shadow: 0 0 25px rgba(212,175,55,0.4); background: #ffffff; color: #1a1a1a;">
            <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 15px; margin-bottom: 20px;">
                <div style="margin-top: 5px; font-size: 36px; color: #d4af37; font-family: 'Playfair Display', serif; font-weight: 800;"><i class="fa-solid fa-crown"></i> JobGold</div>
                <h1 style="color: #1a1a1a; margin: 5px 0 0; font-family: 'Playfair Display', serif; font-size: 24px;">ELITE JOB APPLICATION</h1>
            </div>
            
            <h3 style="color: #d4af37; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; font-size: 18px;">Job Details</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Job Title:</td><td style="padding: 5px 0;">${escapeHtml(app.jobTitle)}</td></tr>
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Company:</td><td style="padding: 5px 0;">${escapeHtml(job ? job.company : 'Unknown')}</td></tr>
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Location:</td><td style="padding: 5px 0;">${escapeHtml(job ? job.location : 'N/A')}</td></tr>
            </table>

            <h3 style="color: #d4af37; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Candidate Contact</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Candidate Name:</td><td style="padding: 5px 0;">${escapeHtml(app.name)}</td></tr>
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Email:</td><td style="padding: 5px 0;">${escapeHtml(app.email)}</td></tr>
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Phone:</td><td style="padding: 5px 0;">${escapeHtml(app.phone)}</td></tr>
                <tr><td style="padding: 5px 0; width: 30%; font-weight: bold;">Applied On:</td><td style="padding: 5px 0;">${new Date(app.applied).toLocaleDateString()}</td></tr>
            </table>

            <h3 style="color: #d4af37; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Skills & Cover Note</h3>
            <div style="border: 1px solid #eee; padding: 15px; background: #f9f9f9; white-space: pre-wrap; font-size: 13px; line-height: 1.6;">
                ${escapeHtml(app.skills) || 'Candidate provided no detailed note.'}
            </div>

            <p style="text-align: center; margin-top: 40px; font-size: 10px; color: #aaa;">
                Application ID: ${escapeHtml(app.id)} - This document is digitally verified.
            </p>
        </div>
    `;

    // Simulate PDF generation/download using a Blob and download.
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // FIX APPLIED HERE: Changed .pdf to .html to resolve the Adobe Acrobat Reader error
    a.download = `JobGold_Application_${app.name.replace(/\s/g, '_')}_${app.jobTitle.replace(/\s/g, '_')}.html`; // Unique filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Downloading Elite PDF for ${app.name} (${app.jobTitle})...`, 'success');
};


$('createAdmin').addEventListener('click', () => {
    const s = get(KEY_SESSION);
    if (!s || s.role !== 'admin') {
        return showToast('Only the Creator/Admin can create new admins.', 'error');
    }

    const email = trim($('adminEmail').value);
    const pass = trim($('adminPass').value);

    if (!email || !pass) {
        return showToast('Email and Password are required.', 'error');
    }

    const users = get(KEY_USERS);
    if (users.find(u => u.email === email)) {
        return showToast('User with this email already exists.', 'error');
    }

    users.push({ id: uid(), name: 'New Admin', email, pass, role: 'admin' });
    set(KEY_USERS, users);
    showToast('New Admin Account Created Successfully!', 'success');
    $('adminEmail').value = '';
    $('adminPass').value = '';
});


// UPDATED: Added Admin check
$('clearAll').addEventListener('click', ()=>{ 
    const s = get(KEY_SESSION);
    if (!s || s.role !== 'admin') {
        return showToast('Only Admin can delete all data.', 'error');
    }

    if(!confirm('DANGER: Delete ALL jobs, applications, profiles, and hire requests? This action cannot be undone.')) return; 
    localStorage.clear(); // Clears all data
    showToast('All Data cleared. Reloading...', 'error'); 
    setTimeout(() => location.reload(), 1500); 
});

// Added placeholder for Export/Import
$('exportBtn').onclick = () => showToast('Data Exported/Backed up successfully (Simulated).', 'success');
$('importBtn').onclick = () => showToast('Data Restored successfully (Simulated).', 'success');

// NEW: Voice Search Toggle Logic
$('voiceSearchBtn').onclick = () => {
    const btn = $('voiceSearchBtn');
    const input = $('searchInput');
    
    if (!isListening) {
        // Start Listening
        isListening = true;
        btn.classList.add('listening');
        input.placeholder = "Listening... Speak now!";
        showToast('🎙️ Voice Search Activated! Speak your job title or location now...', 'info');
    } else {
        // Stop Listening and Process
        isListening = false;
        btn.classList.remove('listening');
        input.placeholder = "Search by title, skill or city...";
        showToast('Processing voice command...', 'info');

        // Simulate delayed search result based on the request
        setTimeout(() => {
            const simulatedQuery = 'Chef job in Dhaba';
            input.value = simulatedQuery;
            showToast(`🔍 Searching for: "${simulatedQuery}"`, 'success');
            renderAllJobs();
        }, 1500); 
    }
};


function escapeHtml(text) { if (!text) return text; return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
$('searchBtn').onclick = renderAllJobs; $('navLogo').onclick = () => showView('dashboard'); $('ctaApply').onclick = () => showView('add');

checkSession(); renderDashboard();