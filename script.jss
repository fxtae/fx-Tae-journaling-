// Global Variables
let trades = JSON.parse(localStorage.getItem('fxTaeTrades')) || [];
let isAuthenticated = localStorage.getItem('fxTaeAuthenticated') === 'true';
let charts = {};
let currentUser = JSON.parse(localStorage.getItem('fxTaeUser')) || {
    name: "Trader Pro",
    email: "fxtae.chartprogram@gmail.com"
};

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');
const currentDate = document.getElementById('currentDate');
const logoutBtn = document.getElementById('logoutBtn');
const saveTradeBtn = document.getElementById('saveTrade');
const downloadTradeBtn = document.getElementById('downloadTrade');
const quickTradeForm = document.getElementById('quickTradeForm');
const exportAllBtn = document.getElementById('exportAll');

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Set current date
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    if (currentDate) {
        currentDate.textContent = formattedDate;
    }
    
    // Set date input to today
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        const today = now.toISOString().split('T')[0];
        input.value = today;
        input.max = today;
    });
    
    // Start loading animation
    startLoadingAnimation();
    
    // Initialize immediately for testing
    setTimeout(() => {
        finishLoading();
    }, 2000);
});

// Loading functions
function startLoadingAnimation() {
    console.log('Starting loading animation...');
    
    // Animate progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = '100%';
        progressFill.style.transition = 'width 2s ease-in-out';
    }
    
    // Animate currency symbols
    const symbols = document.querySelectorAll('.currency-symbol');
    symbols.forEach((symbol, index) => {
        symbol.style.animation = `float 3s ease-in-out ${index * 0.3}s infinite`;
    });
}

function finishLoading() {
    console.log('Finishing loading...');
    
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            checkAuth();
        }, 500);
    } else {
        checkAuth();
    }
}

// Event Listeners
function initEventListeners() {
    console.log('Initializing event listeners...');
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            console.log('Navigating to:', pageId);
            showPage(pageId);
            
            // Update active state
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Close sidebar on mobile
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('active');
            }
        });
    });
    
    // Menu Toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            console.log('Sidebar toggled');
        });
    }
    
    // Authentication
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            
            if (email && password) {
                loginUser(email, password);
            } else {
                showToast('Please enter email and password', 'error');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName')?.value;
            const email = document.getElementById('registerEmail')?.value;
            const password = document.getElementById('registerPassword')?.value;
            
            if (name && email && password) {
                registerUser(name, email, password);
            } else {
                showToast('Please fill all fields', 'error');
            }
        });
    }
    
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginForm) loginForm.style.display = 'none';
            if (registerForm) registerForm.style.display = 'block';
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerForm) registerForm.style.display = 'none';
            if (loginForm) loginForm.style.display = 'block';
        });
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Trade Actions
    if (saveTradeBtn) {
        saveTradeBtn.addEventListener('click', saveTrade);
    }
    
    if (downloadTradeBtn) {
        downloadTradeBtn.addEventListener('click', saveAndDownloadTrade);
    }
    
    // Export Buttons
    if (exportAllBtn) {
        exportAllBtn.addEventListener('click', exportAllData);
    }
    
    // Download buttons on stat cards
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            downloadStats(type);
        });
    });
    
    // Chart period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const period = this.getAttribute('data-period');
            updateChartPeriod(period);
        });
    });
    
    // Form submit
    if (quickTradeForm) {
        quickTradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTrade();
        });
    }
    
    // Window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 1024 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
    
    console.log('Event listeners initialized');
}

// Authentication Functions
function checkAuth() {
    console.log('Checking authentication...');
    
    // For demo purposes, auto-login
    if (!isAuthenticated) {
        // Auto login for demo
        loginUser('demo@fxtae.com', 'password123');
        return;
        
        // Uncomment for real auth:
        // if (authModal) {
        //     authModal.style.display = 'flex';
        // }
    } else {
        if (authModal) {
            authModal.style.display = 'none';
        }
        initializeDashboard();
    }
}

function loginUser(email, password) {
    console.log('Logging in user:', email);
    
    // Simple validation
    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }
    
    // Auto-login for demo
    localStorage.setItem('fxTaeAuthenticated', 'true');
    localStorage.setItem('fxTaeUser', JSON.stringify({
        name: email.split('@')[0],
        email: email
    }));
    
    isAuthenticated = true;
    currentUser = { name: email.split('@')[0], email: email };
    updateUserInfo();
    
    showToast('Login successful! Welcome to FX Tae Trading Circle', 'success');
    
    setTimeout(() => {
        if (authModal) {
            authModal.style.display = 'none';
        }
        initializeDashboard();
    }, 1000);
}

function registerUser(name, email, password) {
    console.log('Registering user:', email);
    
    if (!name || !email || !password) {
        showToast('Please fill all fields', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }
    
    localStorage.setItem('fxTaeAuthenticated', 'true');
    localStorage.setItem('fxTaeUser', JSON.stringify({
        name: name,
        email: email
    }));
    
    isAuthenticated = true;
    currentUser = { name, email };
    updateUserInfo();
    
    showToast('Account created successfully!', 'success');
    
    setTimeout(() => {
        if (authModal) {
            authModal.style.display = 'none';
        }
        initializeDashboard();
    }, 1000);
}

function logoutUser() {
    console.log('Logging out user');
    
    localStorage.removeItem('fxTaeAuthenticated');
    localStorage.removeItem('fxTaeUser');
    isAuthenticated = false;
    
    if (authModal) {
        authModal.style.display = 'flex';
    }
    
    showPage('dashboard');
    showToast('Logged out successfully', 'info');
}

function updateUserInfo() {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) userName.textContent = currentUser.name;
    if (userEmail) userEmail.textContent = currentUser.email;
    
    console.log('User info updated:', currentUser);
}

// Page Navigation
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    pages.forEach(page => {
        if (page.id === pageId) {
            page.classList.add('active');
            page.style.display = 'block';
        } else {
            page.classList.remove('active');
            page.style.display = 'none';
        }
    });
    
    // Initialize page specific content
    switch(pageId) {
        case 'dashboard':
            initializeDashboard();
            break;
        case 'analytics':
            initializeAnalytics();
            break;
        case 'resources':
            // Resources page is static
            break;
        case 'motivation':
            // Motivation page is static
            break;
        case 'contact':
            // Contact page is static
            break;
    }
}

// Initialize Dashboard
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Initialize event listeners first
    initEventListeners();
    
    // Load sample data if needed
    if (trades.length === 0) {
        loadSampleData();
    }
    
    // Update all dashboard components
    updateStats();
    updateRecentTrades();
    initializeCharts();
    updateTradeLists();
    
    console.log('Dashboard initialized');
}

// Load Sample Data
function loadSampleData() {
    console.log('Loading sample data...');
    
    const sampleTrades = [
        {
            id: 1,
            date: new Date().toISOString().split('T')[0],
            tradeNumber: 1,
            pair: 'EUR/USD',
            strategy: 'Breakout',
            pnl: 320,
            notes: 'Strong breakout after NFP'
        },
        {
            id: 2,
            date: new Date().toISOString().split('T')[0],
            tradeNumber: 2,
            pair: 'GBP/USD',
            strategy: 'Trend Following',
            pnl: -150,
            notes: 'False breakout, stopped out'
        },
        {
            id: 3,
            date: new Date().toISOString().split('T')[0],
            tradeNumber: 3,
            pair: 'USD/JPY',
            strategy: 'Price Action',
            pnl: 420,
            notes: 'Pin bar reversal at resistance'
        },
        {
            id: 4,
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            tradeNumber: 1,
            pair: 'AUD/USD',
            strategy: 'Swing',
            pnl: 280,
            notes: 'Held overnight, TP hit'
        },
        {
            id: 5,
            date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
            tradeNumber: 1,
            pair: 'USD/CAD',
            strategy: 'Scalping',
            pnl: 95,
            notes: 'Quick scalp trade'
        },
        {
            id: 6,
            date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
            tradeNumber: 1,
            pair: 'EUR/USD',
            strategy: 'Breakout',
            pnl: 180,
            notes: 'Daily breakout trade'
        }
    ];
    
    trades = sampleTrades;
    saveTradesToStorage();
    
    console.log('Sample data loaded:', trades.length, 'trades');
}

// Save Trade
function saveTrade() {
    console.log('Saving trade...');
    
    const date = document.getElementById('tradeDate')?.value;
    const tradeNumber = parseInt(document.getElementById('tradeNumber')?.value);
    const strategy = document.getElementById('strategy')?.value;
    const pair = document.getElementById('currencyPair')?.value;
    const pnl = parseFloat(document.getElementById('pnlAmount')?.value);
    const notes = document.getElementById('tradeNotes')?.value;
    
    // Validation
    if (!date || !tradeNumber || !strategy || !pair || isNaN(pnl)) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    // Check max 4 trades per day
    const todayTrades = trades.filter(t => t.date === date);
    if (todayTrades.length >= 4) {
        showToast('Maximum 4 trades per day reached!', 'error');
        return;
    }
    
    // Create trade object
    const trade = {
        id: Date.now(),
        date,
        tradeNumber,
        pair,
        strategy,
        pnl,
        notes: notes || 'No notes provided'
    };
    
    // Add to trades array
    trades.unshift(trade);
    saveTradesToStorage();
    
    // Update UI
    updateStats();
    updateRecentTrades();
    updateTradeLists();
    updateCharts();
    
    // Reset form
    if (quickTradeForm) {
        quickTradeForm.reset();
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('tradeDate');
        if (dateInput) dateInput.value = today;
    }
    
    showToast('Trade saved successfully!', 'success');
    console.log('Trade saved:', trade);
}

function saveAndDownloadTrade() {
    console.log('Saving and downloading trade...');
    saveTrade();
    
    // Download the latest trade after saving
    setTimeout(() => {
        if (trades.length > 0) {
            downloadTradeEntry(trades[0]);
        }
    }, 500);
}

// Update Statistics
function updateStats() {
    console.log('Updating stats...');
    
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(t => t.date === today);
    const todayPnl = todayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    // Update Today's P&L
    const todayPnlElement = document.getElementById('todayPnl');
    if (todayPnlElement) {
        todayPnlElement.textContent = formatCurrency(todayPnl);
        todayPnlElement.className = `stat-value ${todayPnl >= 0 ? 'profit' : 'loss'}`;
    }
    
    // Update Today's Trades Count
    const todayTradesCount = document.getElementById('todayTradesCount');
    if (todayTradesCount) {
        todayTradesCount.textContent = `${todayTrades.length}/4`;
    }
    
    // Update Weekly Performance (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const weeklyTrades = trades.filter(t => t.date >= weekAgo);
    const weeklyPnl = weeklyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    const weeklyPnlElement = document.getElementById('weeklyPnl');
    if (weeklyPnlElement) {
        weeklyPnlElement.textContent = formatCurrency(weeklyPnl);
        weeklyPnlElement.className = `stat-value ${weeklyPnl >= 0 ? 'profit' : 'loss'}`;
    }
    
    // Update Monthly Performance (last 30 days)
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const monthlyTrades = trades.filter(t => t.date >= monthAgo);
    const monthlyPnl = monthlyTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    
    const monthlyPnlElement = document.getElementById('monthlyPnl');
    if (monthlyPnlElement) {
        monthlyPnlElement.textContent = formatCurrency(monthlyPnl);
        monthlyPnlElement.className = `stat-value ${monthlyPnl >= 0 ? 'profit' : 'loss'}`;
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = `${(todayTrades.length / 4) * 100}%`;
    }
    
    console.log('Stats updated');
}

function updateTradeLists() {
    const today = new Date().toISOString().split('T')[0];
    const todayTrades = trades.filter(t => t.date === today);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const weeklyTrades = trades.filter(t => t.date >= weekAgo);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const monthlyTrades = trades.filter(t => t.date >= monthAgo);
    
    // Update trade lists
    updateTradeList('todayTradesList', todayTrades);
    updateTradeList('weeklyTradesList', weeklyTrades);
    updateTradeList('monthlyTradesList', monthlyTrades);
}

function updateTradeList(elementId, tradeList) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (tradeList.length === 0) {
        element.innerHTML = '<p class="no-trades">No trades recorded</p>';
        return;
    }
    
    const list = tradeList.slice(0, 3).map(trade => 
        `<div class="trade-item">
            <span class="trade-date">${formatDate(trade.date)}</span>
            <span class="trade-pair">${trade.pair}</span>
            <span class="trade-pnl ${trade.pnl >= 0 ? 'profit' : 'loss'}">${formatCurrency(trade.pnl)}</span>
        </div>`
    ).join('');
    
    element.innerHTML = list;
}

// Update Recent Trades Table
function updateRecentTrades() {
    const tbody = document.getElementById('recentTradesBody');
    if (!tbody) return;
    
    const recentTrades = trades.slice(0, 5);
    
    tbody.innerHTML = recentTrades.map(trade => `
        <tr>
            <td>${formatDate(trade.date)}</td>
            <td>${trade.tradeNumber}</td>
            <td>${trade.pair}</td>
            <td>${trade.strategy}</td>
            <td class="${trade.pnl >= 0 ? 'profit' : 'loss'}">${formatCurrency(trade.pnl)}</td>
            <td><span class="status-badge ${trade.pnl >= 0 ? 'profit' : 'loss'}">${trade.pnl >= 0 ? 'WIN' : 'LOSS'}</span></td>
        </tr>
    `).join('');
}

// Initialize Charts
function initializeCharts() {
    console.log('Initializing charts...');
    
    // Equity Curve Chart
    const equityCtx = document.getElementById('equityChart');
    if (equityCtx) {
        // Destroy existing chart if it exists
        if (charts.equity) {
            charts.equity.destroy();
        }
        
        charts.equity = new Chart(equityCtx, {
            type: 'line',
            data: getEquityData(),
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Balance: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
        
        console.log('Equity chart initialized');
    }
    
    // Win Rate Chart
    const winRateCtx = document.getElementById('winRateChart');
    if (winRateCtx) {
        // Destroy existing chart if it exists
        if (charts.winRate) {
            charts.winRate.destroy();
        }
        
        charts.winRate = new Chart(winRateCtx, {
            type: 'doughnut',
            data: getWinRateData(),
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20
                        }
                    }
                }
            }
        });
