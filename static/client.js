// ==================== AUTONOMICZNY FRONTEND (CSR) ====================
const API_BASE = 'http://localhost:5000/api';

// Stan aplikacji
let state = {
    currentTab: 'dashboard',
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    transactions: [],
    categories: [],
    filterType: 'all',
    filterCategory: 'all'
};

let currentDeleteId = null;

// ==================== RENDEROWANIE ====================
function render() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <div class="app-container">
            <aside class="sidebar">
                <div class="logo">
                    <i class="fas fa-coins"></i>
                    <span>Budget<span class="premium">Planner</span></span>
                </div>
                <nav class="nav-menu">
                    <a href="#" class="nav-item ${state.currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
                        <i class="fas fa-chart-line"></i><span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item ${state.currentTab === 'months' ? 'active' : ''}" data-tab="months">
                        <i class="fas fa-calendar-alt"></i><span>Przegląd miesięcy</span>
                    </a>
                    <a href="#" class="nav-item ${state.currentTab === 'transactions' ? 'active' : ''}" data-tab="transactions">
                        <i class="fas fa-list"></i><span>Wszystkie transakcje</span>
                    </a>
                    <a href="#" class="nav-item ${state.currentTab === 'statistics' ? 'active' : ''}" data-tab="statistics">
                        <i class="fas fa-chart-pie"></i><span>Statystyki</span>
                    </a>
                </nav>
            </aside>
            <main class="main-content">
                ${renderDashboard()}
                ${renderMonths()}
                ${renderTransactions()}
                ${renderStatistics()}
            </main>
        </div>
        ${renderModals()}
    `;
    
    attachEventListeners();
}

function renderDashboard() {
    const monthStr = `${state.currentYear}-${String(state.currentMonth + 1).padStart(2, '0')}`;
    const monthTransactions = state.transactions.filter(t => t.date.startsWith(monthStr));
    const totalIncome = monthTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
                        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    
    return `
        <div id="dashboard-tab" class="tab-content ${state.currentTab === 'dashboard' ? 'active' : ''}">
            <div class="header-actions">
                <h1>Planer budżetu</h1>
                <div class="quick-actions">
                    <button class="btn-income" id="addIncomeBtn"><i class="fas fa-plus-circle"></i> Przychód</button>
                    <button class="btn-expense" id="addExpenseBtn"><i class="fas fa-minus-circle"></i> Wydatek</button>
                </div>
            </div>
            <div class="month-selector">
                <button class="month-nav" id="prevMonth"><i class="fas fa-chevron-left"></i></button>
                <div class="current-month-display"><h2>${monthNames[state.currentMonth]} ${state.currentYear}</h2></div>
                <button class="month-nav" id="nextMonth"><i class="fas fa-chevron-right"></i></button>
                <button class="btn-today" id="todayBtn">Dziś</button>
            </div>
            <div class="stats-grid">
                <div class="stat-card income">
                    <div class="stat-icon"><i class="fas fa-arrow-up"></i></div>
                    <div class="stat-info"><span class="stat-label">Przychody</span><span class="stat-value">${totalIncome.toFixed(2)} zł</span></div>
                </div>
                <div class="stat-card expense">
                    <div class="stat-icon"><i class="fas fa-arrow-down"></i></div>
                    <div class="stat-info"><span class="stat-label">Wydatki</span><span class="stat-value">${totalExpense.toFixed(2)} zł</span></div>
                </div>
                <div class="stat-card balance ${balance >= 0 ? 'positive' : 'negative'}">
                    <div class="stat-icon"><i class="fas fa-wallet"></i></div>
                    <div class="stat-info"><span class="stat-label">Saldo</span><span class="stat-value">${balance.toFixed(2)} zł</span></div>
                </div>
            </div>
            <div class="transactions-section">
                <div class="section-header"><h2>Transakcje w tym miesiącu</h2></div>
                <div class="transactions-list">${monthTransactions.length > 0 ? monthTransactions.map(t => renderTransaction(t)).join('') : '<div style="text-align:center;padding:40px;">Brak transakcji w tym miesiącu</div>'}</div>
            </div>
        </div>
    `;
}

function renderMonths() {
    const monthsData = {};
    state.transactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (!monthsData[month]) monthsData[month] = { income: 0, expense: 0 };
        if (t.amount > 0) monthsData[month].income += t.amount;
        else monthsData[month].expense += Math.abs(t.amount);
    });
    const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
    
    const sortedMonths = Object.keys(monthsData).sort().reverse();
    
    return `
        <div id="months-tab" class="tab-content ${state.currentTab === 'months' ? 'active' : ''}">
            <h1 style="color:white;">Przegląd miesięcy</h1>
            <div class="months-grid">
                ${sortedMonths.length > 0 ? sortedMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    const data = monthsData[month];
                    const balance = data.income - data.expense;
                    return `
                        <div class="month-card" onclick="goToMonth('${month}')">
                            <div class="month-card-header"><h3>${monthNames[parseInt(monthNum)-1]} ${year}</h3><i class="fas fa-chevron-right"></i></div>
                            <div class="month-card-stats">
                                <div class="month-stat"><span class="month-stat-label">Przychody</span><span class="month-stat-income">+${data.income.toFixed(2)} zł</span></div>
                                <div class="month-stat"><span class="month-stat-label">Wydatki</span><span class="month-stat-expense">-${data.expense.toFixed(2)} zł</span></div>
                                <div class="month-stat"><span class="month-stat-label">Saldo</span><span class="month-stat-balance ${balance >= 0 ? 'positive' : 'negative'}">${balance.toFixed(2)} zł</span></div>
                            </div>
                        </div>
                    `;
                }).join('') : '<div style="text-align:center;padding:40px;background:white;border-radius:15px;">Brak danych. Dodaj pierwsze transakcje!</div>'}
            </div>
        </div>
    `;
}

function renderTransactions() {
    let filtered = [...state.transactions];
    if (state.filterType === 'income') filtered = filtered.filter(t => t.amount > 0);
    if (state.filterType === 'expense') filtered = filtered.filter(t => t.amount < 0);
    if (state.filterCategory !== 'all') filtered = filtered.filter(t => t.category_id == state.filterCategory);
    
    const sortedFiltered = filtered.sort((a, b) => b.date.localeCompare(a.date));
    
    return `
        <div id="transactions-tab" class="tab-content ${state.currentTab === 'transactions' ? 'active' : ''}">
            <h1 style="color:white;">Wszystkie transakcje</h1>
            <div class="filters-section">
                <div class="filter-group">
                    <label>Typ:</label>
                    <select id="filterType" class="filter-select">
                        <option value="all" ${state.filterType === 'all' ? 'selected' : ''}>Wszystkie</option>
                        <option value="income" ${state.filterType === 'income' ? 'selected' : ''}>Przychody</option>
                        <option value="expense" ${state.filterType === 'expense' ? 'selected' : ''}>Wydatki</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Kategoria:</label>
                    <select id="filterCategory" class="filter-select">
                        <option value="all">Wszystkie kategorie</option>
                        ${state.categories.map(c => `<option value="${c.id}" ${state.filterCategory == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
                <button class="btn-filter" id="applyFiltersBtn"><i class="fas fa-search"></i> Filtruj</button>
            </div>
            <div class="transactions-section">
                <div class="transactions-list">${sortedFiltered.length > 0 ? sortedFiltered.map(t => renderTransaction(t)).join('') : '<div style="text-align:center;padding:40px;">Brak transakcji</div>'}</div>
            </div>
        </div>
    `;
}

function renderStatistics() {
    const year = new Date().getFullYear();
    const yearTransactions = state.transactions.filter(t => t.date.startsWith(year));
    const monthlyData = {};
    for (let i = 1; i <= 12; i++) monthlyData[`${year}-${String(i).padStart(2,'0')}`] = { income: 0, expense: 0 };
    yearTransactions.forEach(t => {
        const month = t.date.substring(0, 7);
        if (monthlyData[month]) {
            if (t.amount > 0) monthlyData[month].income += t.amount;
            else monthlyData[month].expense += Math.abs(t.amount);
        }
    });
    const categoryData = {};
    yearTransactions.filter(t => t.amount < 0).forEach(t => {
        if (!categoryData[t.category_name]) categoryData[t.category_name] = 0;
        categoryData[t.category_name] += Math.abs(t.amount);
    });
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
    
    return `
        <div id="statistics-tab" class="tab-content ${state.currentTab === 'statistics' ? 'active' : ''}">
            <h1 style="color:white;">Statystyki ${year}</h1>
            <div class="stats-container">
                <div class="stats-card">
                    <h3>Podsumowanie miesięczne</h3>
                    ${Object.entries(monthlyData).map(([month, data], i) => `
                        <div class="monthly-stats-item">
                            <span class="monthly-stats-month">${monthNames[i]}</span>
                            <span class="monthly-stats-income">+${data.income.toFixed(2)} zł</span>
                            <span class="monthly-stats-expense">-${data.expense.toFixed(2)} zł</span>
                            <span class="monthly-stats-balance" style="color: ${data.income - data.expense >= 0 ? '#2ecc71' : '#e74c3c'}">${(data.income - data.expense).toFixed(2)} zł</span>
                        </div>
                    `).join('')}
                </div>
                <div class="stats-card">
                    <h3>Wydatki według kategorii</h3>
                    ${Object.entries(categoryData).length > 0 ? Object.entries(categoryData).map(([cat, amount]) => `
                        <div class="category-stats-item"><span>${cat}</span><span class="category-amount">${amount.toFixed(2)} zł</span></div>
                    `).join('') : '<div style="text-align:center;padding:20px;">Brak danych</div>'}
                </div>
            </div>
        </div>
    `;
}

function renderTransaction(t) {
    return `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${t.amount > 0 ? 'income-icon' : 'expense-icon'}">
                    <i class="fas ${t.amount > 0 ? 'fa-plus' : 'fa-minus'}"></i>
                </div>
                <div class="transaction-details">
                    <span class="transaction-desc">${escapeHtml(t.description)}</span>
                    <span class="transaction-category">${t.category_name || 'Przychód'}</span>
                    <span class="transaction-date">${t.date}</span>
                </div>
            </div>
            <div class="transaction-amount ${t.amount > 0 ? 'positive-amount' : 'negative-amount'}">${Math.abs(t.amount).toFixed(2)} zł</div>
            <div class="transaction-actions">
                <button class="action-btn edit-btn" onclick="editTransaction(${t.id})"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" onclick="deleteTransaction(${t.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `;
}

function renderModals() {
    return `
        <div id="incomeModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Dodaj przychód</h2>
                    <span class="close-income">&times;</span>
                </div>
                <form id="incomeForm">
                    <div class="form-group">
                        <label>Opis</label>
                        <input type="text" id="incomeDesc" required placeholder="Np. Wynagrodzenie">
                    </div>
                    <div class="form-group">
                        <label>Kwota (zł)</label>
                        <input type="number" id="incomeAmount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="incomeDate" required>
                    </div>
                    <button type="submit" class="btn-premium-full">Dodaj przychód</button>
                </form>
            </div>
        </div>
        
        <div id="expenseModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Dodaj wydatek</h2>
                    <span class="close-expense">&times;</span>
                </div>
                <form id="expenseForm">
                    <div class="form-group">
                        <label>Opis</label>
                        <input type="text" id="expenseDesc" required placeholder="Np. Zakupy">
                    </div>
                    <div class="form-group">
                        <label>Kwota (zł)</label>
                        <input type="number" id="expenseAmount" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" id="expenseDate" required>
                    </div>
                    <div class="form-group">
                        <label>Kategoria</label>
                        <select id="expenseCategoryId" required>
                            <option value="">Wybierz kategorię</option>
                            ${state.categories.filter(c => c.type === 'expense').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn-premium-full">Dodaj wydatek</button>
                </form>
            </div>
        </div>
        
        <div id="deleteModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Potwierdź usunięcie</h2>
                    <span class="close-delete">&times;</span>
                </div>
                <div class="modal-body">
                    <p>Czy na pewno chcesz usunąć tę transakcję?</p>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn-premium-full" id="confirmDeleteBtn" style="background: #e74c3c;">Usuń</button>
                        <button class="btn-premium-full" id="cancelDeleteBtn" style="background: #95a5a6;">Anuluj</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ==================== API CALLS ====================
async function loadData() {
    try {
        const [transRes, catRes] = await Promise.all([
            fetch(`${API_BASE}/transactions`),
            fetch(`${API_BASE}/categories`)
        ]);
        if (transRes.ok && catRes.ok) {
            state.transactions = await transRes.json();
            state.categories = await catRes.json();
            render();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Błąd ładowania danych', 'error');
    }
}

async function addIncome(desc, amount, date) {
    try {
        const response = await fetch(`${API_BASE}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: desc, amount, date, category_id: 1 })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Błąd dodawania');
        }
        await loadData();
        showNotification('Przychód dodany!', 'success');
        return true;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function addExpense(desc, amount, date, categoryId) {
    try {
        const response = await fetch(`${API_BASE}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: desc, amount: -amount, date, category_id: categoryId })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Błąd dodawania');
        }
        await loadData();
        showNotification('Wydatek dodany!', 'success');
        return true;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function updateTransactionAPI(id, desc, amount, date, categoryId = null) {
    try {
        const body = categoryId ? { description: desc, amount, date, category_id: categoryId } : { description: desc, amount, date };
        const response = await fetch(`${API_BASE}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Błąd aktualizacji');
        await loadData();
        showNotification('Zaktualizowano!', 'success');
        return true;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

async function deleteTransactionAPI(id) {
    try {
        const response = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Błąd usuwania');
        await loadData();
        showNotification('Transakcja usunięta!', 'success');
        return true;
    } catch (error) {
        showNotification(error.message, 'error');
        return false;
    }
}

// ==================== EVENTY ====================
function attachEventListeners() {
    // Nawigacja zakładek
    document.querySelectorAll('.nav-item').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            state.currentTab = el.getAttribute('data-tab');
            render();
        });
    });
    
    // Przyciski dodawania
    const addIncomeBtn = document.getElementById('addIncomeBtn');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    
    if (addIncomeBtn) {
        addIncomeBtn.addEventListener('click', () => {
            document.getElementById('incomeModal').style.display = 'block';
            document.getElementById('incomeDate').value = new Date().toISOString().slice(0, 10);
        });
    }
    
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', () => {
            document.getElementById('expenseModal').style.display = 'block';
            document.getElementById('expenseDate').value = new Date().toISOString().slice(0, 10);
        });
    }
    
    // Nawigacja miesięczna
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    
    if (prevMonth) {
        prevMonth.addEventListener('click', () => {
            state.currentMonth--;
            if (state.currentMonth < 0) {
                state.currentMonth = 11;
                state.currentYear--;
            }
            render();
        });
    }
    
    if (nextMonth) {
        nextMonth.addEventListener('click', () => {
            state.currentMonth++;
            if (state.currentMonth > 11) {
                state.currentMonth = 0;
                state.currentYear++;
            }
            render();
        });
    }
    
    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            const today = new Date();
            state.currentYear = today.getFullYear();
            state.currentMonth = today.getMonth();
            render();
        });
    }
    
    // Filtry
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            state.filterType = document.getElementById('filterType').value;
            state.filterCategory = document.getElementById('filterCategory').value;
            render();
        });
    }
    
    // Formularz przychodu
    const incomeForm = document.getElementById('incomeForm');
    if (incomeForm) {
        incomeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const desc = document.getElementById('incomeDesc').value;
            const amount = parseFloat(document.getElementById('incomeAmount').value);
            const date = document.getElementById('incomeDate').value;
            
            if (!desc || !amount || !date) {
                showNotification('Wszystkie pola są wymagane', 'error');
                return;
            }
            
            const success = await addIncome(desc, amount, date);
            if (success) {
                document.getElementById('incomeModal').style.display = 'none';
                incomeForm.reset();
            }
        });
    }
    
    // Formularz wydatku
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const desc = document.getElementById('expenseDesc').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);
            const date = document.getElementById('expenseDate').value;
            const categoryId = parseInt(document.getElementById('expenseCategoryId').value);
            
            if (!desc || !amount || !date || !categoryId) {
                showNotification('Wszystkie pola są wymagane', 'error');
                return;
            }
            
            const success = await addExpense(desc, amount, date, categoryId);
            if (success) {
                document.getElementById('expenseModal').style.display = 'none';
                expenseForm.reset();
            }
        });
    }
    
    // Zamykanie modali
    document.querySelectorAll('.close-income, .close-expense, .close-delete').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        });
    });
    
    // Przyciski usuwania
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            if (currentDeleteId) {
                await deleteTransactionAPI(currentDeleteId);
                document.getElementById('deleteModal').style.display = 'none';
                currentDeleteId = null;
            }
        });
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', () => {
            document.getElementById('deleteModal').style.display = 'none';
            currentDeleteId = null;
        });
    }
    
    // Kliknięcie poza modalem
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
}

// ==================== FUNKCJE GLOBALNE ====================
window.goToMonth = (month) => {
    const [year, monthNum] = month.split('-');
    state.currentYear = parseInt(year);
    state.currentMonth = parseInt(monthNum) - 1;
    state.currentTab = 'dashboard';
    render();
};

window.editTransaction = async (id) => {
    const transaction = state.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const newDesc = prompt('Nowy opis:', transaction.description);
    if (!newDesc) return;
    
    const newAmount = parseFloat(prompt('Nowa kwota:', Math.abs(transaction.amount)));
    if (isNaN(newAmount)) return;
    
    const newDate = prompt('Nowa data (YYYY-MM-DD):', transaction.date);
    if (!newDate) return;
    
    const amountValue = transaction.amount > 0 ? newAmount : -newAmount;
    await updateTransactionAPI(id, newDesc, amountValue, newDate, transaction.category_id);
};

window.deleteTransaction = (id) => {
    currentDeleteId = id;
    document.getElementById('deleteModal').style.display = 'block';
};

// ==================== HELPERY ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 2000;
        background: ${type === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ==================== START ====================
loadData();
