// --- GLOBAL STATE (MOCK BACKEND DATA) ---
let currentStatus = 'safe';
let identityData = {
    ip: '10.20.30.150',
    mac: '00:0A:95:9D:68:F1',
    lastRotation: new Date().toLocaleTimeString(),
    vpnStatus: 'Connected (WireGuard)'
};
let logData = [
    { time: '10:00:00', event: 'System Start', source: 'Local Daemon', risk: 'low' },
    { time: '10:05:30', event: 'Successful Identity Rotation', source: 'Automated', risk: 'low' }
];

// --- CORE UI FUNCTIONS ---

function updateStatusUI() {
    const indicator = document.getElementById('status-indicator');
    const text = document.getElementById('status-text');
    const riskLevelDisplay = document.getElementById('risk-level');
    
    indicator.className = `status-bar ${currentStatus}`;
    riskLevelDisplay.className = currentStatus;

    let statusText, levelText;

    switch (currentStatus) {
        case 'high':
            statusText = 'Threat Detected: **HIGH** - Automated Response Active';
            levelText = 'HIGH';
            break;
        case 'medium':
            statusText = 'Alert: Anomalous Activity Detected';
            levelText = 'MEDIUM';
            break;
        case 'safe':
        default:
            statusText = 'System Status: **Secure**';
            levelText = 'LOW';
            break;
    }
    
    text.innerHTML = statusText;
    riskLevelDisplay.textContent = levelText;
}

function switchPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId + '-page').classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageId) {
            item.classList.add('active');
        }
    });
}

function renderLogTable() {
    const tableBody = document.querySelector('#event-log-table tbody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    logData.slice().reverse().forEach(entry => {
        const row = tableBody.insertRow();
        const riskClass = entry.risk === 'high' ? 'high' : entry.risk === 'medium' ? 'medium' : 'low';
        
        row.innerHTML = `
            <td>${entry.time}</td>
            <td>${entry.event}</td>
            <td>${entry.source}</td>
            <td class="log-risk ${riskClass}">${entry.risk.toUpperCase()}</td>
        `;
    });
}

function addLogEntry(event, source, risk) {
    const time = new Date().toLocaleTimeString();
    logData.push({ time, event, source, risk });
    // Limit log size for performance
    if (logData.length > 50) logData.shift(); 
    renderLogTable();
}

// --- PAGE-SPECIFIC RENDERING ---

function initDashboardPage() {
    const page = document.getElementById('dashboard-page');
    page.innerHTML = `
        <h2><i class="fas fa-chart-line"></i> Dashboard Overview</h2>
        
        <div class="card" id="risk-display">
            <div class="label">Current Threat Level</div>
            <span id="risk-level" class="low">LOW</span>
            <p><strong>Tracking Detection Status:</strong> <span id="detection-status">Active</span></p>
        </div>

        <div class="grid-3">
            <div class="metric-box safe-score">
                <div class="value" id="security-score">95%</div>
                <div class="label">Security Confidence Score</div>
            </div>
            <div class="metric-box threat-count">
                <div class="value" id="threat-count">0</div>
                <div class="label">Threats Blocked (Last 24h)</div>
            </div>
            <div class="metric-box id-rotations">
                <div class="value" id="rotation-count">3</div>
                <div class="label">Identity Rotations (Today)</div>
            </div>
        </div>

        <div class="card">
            <h3>Quick Actions</h3>
            <div class="grid-2">
                <div>
                    <button id="panic-button" class="btn btn-danger"><i class="fas fa-redo"></i> Panic Rotate Identity</button>
                    <p class="text-muted">Immediately change IP/MAC and re-establish secure connection.</p>
                </div>
                <div>
                    <button id="disconnect-btn" class="btn btn-primary"><i class="fas fa-power-off"></i> Disconnect All</button>
                    <p class="text-muted">Instantly drop all external network connections.</p>
                </div>
            </div>
        </div>

        <div class="card">
            <h3>Activity History (Visual)</h3>
            <canvas id="activityChart"></canvas>
        </div>
    `;
}

function initLogsPage() {
    const page = document.getElementById('logs-page');
    page.innerHTML = `
        <h2><i class="fas fa-list-ul"></i> Threat Analysis & Logs</h2>
        
        <div class="grid-2">
            <div class="card reputation-card">
                <h3>Server Reputation Checker</h3>
                <p>Check if a server or URL is globally categorized as malicious or tracking.</p>
                <input type="text" id="target-url" placeholder="Enter URL or IP to check">
                <button id="check-reputation-btn" class="btn btn-primary"><i class="fas fa-search"></i> Check Reputation</button>
                <div id="reputation-result" class="result" style="margin-top: 15px;">
                    <p style="background-color: #333649; padding: 10px; border-radius: 5px;">Awaiting check...</p>
                </div>
            </div>
            
            <div class="card">
                <h3>Threat Scoring Summary</h3>
                <canvas id="riskPieChart"></canvas>
                <p style="margin-top: 15px; font-size: 0.9em; color: #aaa;">Distribution of blocked threats by severity level.</p>
            </div>
        </div>

        <div class="card log-card">
            <h3>Full Security Event Log</h3>
            <table id="event-log-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Event Type</th>
                        <th>Source/Destination</th>
                        <th>Severity</th>
                    </tr>
                </thead>
                <tbody>
                    </tbody>
            </table>
        </div>
    `;
    renderLogTable(); // Render initial log data
}

function initIdentityPage() {
    const page = document.getElementById('identity-page');
    page.innerHTML = `
        <h2><i class="fas fa-user-secret"></i> Identity Control</h2>
        <div class="grid-2">
            <div class="card">
                <h3>Current Anonymous Identity</h3>
                <p><strong>Proxy IP Address:</strong> <span id="anon-ip">${identityData.ip}</span></p>
                <p><strong>Virtual MAC Address:</strong> <span id="anon-mac">${identityData.mac}</span></p>
                <p><strong>VPN/Anonymity Network:</strong> <span id="vpn-status-text">${identityData.vpnStatus}</span></p>
                <p><strong>Last Rotation Time:</strong> <span id="last-rotation-time">${identityData.lastRotation}</span></p>
            </div>

            <div class="card">
                <h3>Automatic Rotation Settings</h3>
                <div class="toggle-switch">
                    <span>Enable IP Auto-Rotation</span>
                    <input type="checkbox" id="ip-rotation-toggle" checked>
                    <span class="slider"></span>
                </div>
                <div class="toggle-switch">
                    <span>Enable MAC Spoofing</span>
                    <input type="checkbox" id="mac-spoofing-toggle" checked>
                    <span class="slider"></span>
                </div>
                <label for="rotation-interval" style="display: block; margin-top: 20px;">Rotation Interval (Minutes):</label>
                <input type="number" id="rotation-interval" value="15" min="5" max="120">
                <button class="btn btn-success" id="apply-identity-settings"><i class="fas fa-check"></i> Apply Settings</button>
            </div>
        </div>
    `;
}

function initSettingsPage() {
    const page = document.getElementById('settings-page');
    page.innerHTML = `
        <h2><i class="fas fa-cogs"></i> Advanced Settings</h2>
        
        <div class="card">
            <h3>Smart Detection System (IDS) Configuration</h3>
            <div class="toggle-switch">
                <span>Activate Real-time Traffic Analysis</span>
                <input type="checkbox" id="detection-toggle" checked>
                <span class="slider"></span>
            </div>
            <div class="setting-group" style="margin-top: 15px;">
                <label for="detection-sensitivity">Detection Sensitivity Level:</label>
                <select id="detection-sensitivity">
                    <option value="low">Low (Fewer False Positives)</option>
                    <option value="medium" selected>Medium (Recommended)</option>
                    <option value="high">High (Maximum Security)</option>
                </select>
            </div>
        </div>

        <div class="card">
            <h3>Automated Response (IPS)</h3>
            <div class="toggle-switch">
                <span>Enable Automated Threat Mitigation</span>
                <input type="checkbox" id="auto-response-toggle" checked>
                <span class="slider"></span>
            </div>
            <p style="margin-top: 10px;">Select actions for **HIGH** risk events:</p>
            <label><input type="checkbox" checked> Re-route traffic to Tor</label><br>
            <label><input type="checkbox" checked> Block source IP via Firewall</label><br>
            <label><input type="checkbox" checked> Initiate Identity Rotation</label><br>
        </div>
        
    `;
}

// --- CHART INITIALIZATION ---

let activityChart, riskPieChart;

function initCharts() {
    // 1. Activity History Chart (Dashboard)
    const ctxActivity = document.getElementById('activityChart');
    if (ctxActivity) {
        activityChart = new Chart(ctxActivity, {
            type: 'line',
            data: {
                labels: ['10:00', '10:15', '10:30', '10:45', '11:00', '11:15'],
                datasets: [{
                    label: 'Threat Score Trend',
                    data: [10, 15, 5, 25, 12, 8], // Mock data: 0-100 score
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 30, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } },
                    x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: 'white' } }
                }
            }
        });
    }

    // 2. Risk Pie Chart (Logs Page)
    const ctxRisk = document.getElementById('riskPieChart');
    if (ctxRisk) {
        riskPieChart = new Chart(ctxRisk, {
            type: 'doughnut',
            data: {
                labels: ['High Risk', 'Medium Risk', 'Low Risk'],
                datasets: [{
                    data: [25, 40, 35], // Mock distribution
                    backgroundColor: [
                        '#dc3545', // Danger
                        '#ffc107', // Warning
                        '#28a745'  // Success
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } }
            }
        });
    }
}

// --- INTERACTION HANDLERS ---

function handlePanicButton() {
    alert('Initiating Emergency Identity Rotation and Connection Reset...');
    // Mock successful action
    identityData.ip = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    identityData.mac = `00:0A:95:${Math.floor(Math.random() * 99)}:${Math.floor(Math.random() * 99)}:${Math.floor(Math.random() * 99)}`;
    identityData.lastRotation = new Date().toLocaleTimeString();
    
    addLogEntry('Emergency Identity Rotation Success', 'Local System', 'low');
    currentStatus = 'safe';
    updateSystemData(); 
    alert('Identity successfully rotated and connection secured.');
}

function handleReputationCheck() {
    const url = document.getElementById('target-url').value.trim();
    const resultDiv = document.getElementById('reputation-result');
    
    if (!url) {
        resultDiv.innerHTML = '<p style="background-color: #333649; padding: 10px; border-radius: 5px;">Please enter a valid URL or IP.</p>';
        return;
    }

    resultDiv.innerHTML = '<p style="background-color: #007bff; padding: 10px; border-radius: 5px; color: white;">Checking reputation for ' + url + '...</p>';

    // Mock Reputation Check based on content
    setTimeout(() => {
        if (url.includes('malware') || url.includes('phishing') || url.includes('tracker')) {
            resultDiv.innerHTML = `
                <p style="background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--danger-color')}; padding: 10px; border-radius: 5px; color: white;">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <strong>UNSAFE:</strong> Destination classified as High Risk (90%). Connection Blocked.
                </p>
            `;
            addLogEntry('Connection Blocked - High Risk Server', url, 'high');
            currentStatus = 'medium';
        } else {
            resultDiv.innerHTML = `
                <p style="background-color: ${getComputedStyle(document.documentElement).getPropertyValue('--success-color')}; padding: 10px; border-radius: 5px; color: white;">
                    <i class="fas fa-check-circle"></i> 
                    <strong>SAFE:</strong> Destination is trusted. Risk Score: Low (5%).
                </p>
            `;
        }
        updateSystemData();
    }, 2000);
}

// Function to update all dynamic data elements
function updateSystemData() {
    // 1. Update Global Status Bar
    updateStatusUI();

    // 2. Update Identity Page Data
    const anonIp = document.getElementById('anon-ip');
    const anonMac = document.getElementById('anon-mac');
    const lastRotationTime = document.getElementById('last-rotation-time');
    
    if (anonIp) anonIp.textContent = identityData.ip;
    if (anonMac) anonMac.textContent = identityData.mac;
    if (lastRotationTime) lastRotationTime.textContent = identityData.lastRotation;

    // 3. Update Dashboard Metrics (mock logic)
    const threatCountEl = document.getElementById('threat-count');
    if (threatCountEl) threatCountEl.textContent = logData.filter(e => e.risk !== 'low').length;
    
    // 4. Update Logs Table
    renderLogTable();
}

// --- MAIN INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize all pages (render content)
    initDashboardPage();
    initLogsPage();
    initIdentityPage();
    initSettingsPage();

    // 2. Initial Data Load
    updateSystemData();
    initCharts(); // Initialize charts after canvas elements are rendered

    // 3. Navigation Setup
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(item.getAttribute('data-page'));
        });
    });

    // 4. Event Listeners
    // Dashboard actions
    document.getElementById('panic-button').addEventListener('click', handlePanicButton);
    // Logs actions
    document.getElementById('check-reputation-btn').addEventListener('click', handleReputationCheck);

    // 5. Mock Real-time Monitoring (Simulates Backend Updates)
    setInterval(() => {
        // Randomly simulate a risk event
        const rand = Math.random();
        if (rand > 0.95) {
            currentStatus = 'high';
            addLogEntry('Critical Port Scan Attempt', '210.5.4.1', 'high');
            // Mock Automated Response:
            if (document.getElementById('auto-response-toggle') && document.getElementById('auto-response-toggle').checked) {
                currentStatus = 'safe';
                addLogEntry('Automated Response: Source Blocked and Identity Rotated', 'IPS Service', 'low');
                handlePanicButton(); // Simulate rotation action
            }
        } else if (rand > 0.8) {
            currentStatus = 'medium';
            addLogEntry('Suspicious Data Outflow Detected', 'Tracking.io', 'medium');
        } else {
            currentStatus = 'safe';
        }

        updateSystemData(); 
        
    }, 5000); // Update every 5 seconds
});