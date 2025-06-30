/**
 * Family Expense Tracker - Main Application
 * 
 * A modern, multilingual family expense tracking web application with enhanced 
 * dashboard capabilities and custom date range analysis.
 * 
 * Features:
 * - Multi-language support (English, French, Japanese)
 * - Multi-currency support (USD, EUR, JPY)
 * - Interactive charts with Chart.js
 * - Custom date range filtering
 * - Local storage persistence
 * - Import/Export functionality
 * - Responsive design
 * 
 * @author Mounir IDRASSI
 * @created June 2025 
 * @version 1.0
 * @license MIT
 * 
 * Dependencies:
 * - Chart.js (for data visualizations)
 * - Flag Icons CSS (for country flags)
 * 
 * Browser Support:
 * - Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
 * 
 * @see https://github.com/FamilyExpensesTracker/FamilyExpensesTracker
 */

// Internationalization system
const translations = {
    en: {
        // Header
        appTitle: "🏠 Family Expense Tracker",
        exportData: "📤",
        importData: "📥",
        exportTooltip: "Export Data",
        importTooltip: "Import Data",
        settingsTooltip: "Settings",
        
        // Tabs
        addExpense: "Add Expense",
        dashboard: "Dashboard",
        history: "History",
        
        // Add Expense Form
        addNewExpense: "Add New Expense",
        amount: "Amount",
        description: "Description",
        category: "Category",
        selectCategory: "Select a category",
        date: "Date",
        paidBy: "Paid By",
        paidByPlaceholder: "Family member name",
        addExpenseBtn: "Add Expense",
        
        // Categories
        foodDining: "🍕 Food",
        transportation: "🚗 Transportation",
        shopping: "🛍️ Shopping",
        entertainment: "🎬 Entertainment",
        billsUtilities: "💡 Utilities",
        healthcare: "🏥 Healthcare",
        education: "📚 Education",
        travel: "✈️ Travel",
        personalCare: "💅 Personal Care",
        homeGarden: "🏡 Housing",
        other: "📦 Other",
        
        // Dashboard Stats
        thisMonth: "This Month",
        thisYear: "This Year",
        totalExpenses: "Total Expenses",
        avgMonthly: "Average/Month",
        totalAmount: "Total Amount",
        
        // Charts
        expensesByCategory: "Expenses by Category",
        monthlySpendingTrend: "Monthly Spending Trend",
        spendingByMember: "Spending by Family Member",
        dailySpending: "Daily Spending (Last 30 Days)",
        
        // Period selector
        period7Days: "7D",
        period30Days: "30D",
        period3Months: "3M",
        period6Months: "6M",
        period1Year: "1Y",
        periodAll: "All",
        customRange: "Custom",
        fromDate: "From",
        toDate: "To",
        applyRange: "Apply",
        
        // History
        expenseHistory: "Expense History",
        allCategories: "All Categories",
        allMembers: "All Members",
        clearFilters: "Clear Filters",
        deleteBtn: "🗑️ Delete",
        
        // Messages
        expenseAdded: "Expense added successfully!",
        expenseDeleted: "Expense deleted successfully!",
        deleteConfirm: "Are you sure you want to delete this expense?",
        confirmDelete: "Confirm Delete",
        cancel: "Cancel",
        delete: "Delete",
        dataExported: "Data exported successfully!",
        dataImported: "Data imported successfully!",
        dataImportedConverted: "Data imported successfully! Some expenses were converted from a different format.",
        importError: "Error importing data. Please check the file format.",
        noExpenses: "No expenses found. Add some expenses to see them here!",
        customRangeApplied: "Custom date range applied!",
        invalidDateRange: "Invalid date range. From date must be before To date.",
        selectBothDates: "Please select both from and to dates.",
        
        // Language
        language: "Language",
        
        // Currency
        currency: "Currency",
        selectCurrency: "Select Currency",
        
        // Settings
        settings: "Settings",
        saveSettings: "Save Settings",
        settingsSaved: "Settings saved successfully!"
    },
    fr: {
        // Header
        appTitle: "🏠 Suivi des Dépenses Familiales",
        exportData: "📤",
        importData: "📥",
        exportTooltip: "Exporter les Données",
        importTooltip: "Importer les Données",
        settingsTooltip: "Paramètres",
        
        // Tabs
        addExpense: "Ajouter Dépense",
        dashboard: "Tableau de Bord",
        history: "Historique",
        
        // Add Expense Form
        addNewExpense: "Ajouter une Nouvelle Dépense",
        amount: "Montant",
        description: "Description",
        category: "Catégorie",
        selectCategory: "Sélectionner une catégorie",
        date: "Date",
        paidBy: "Payé par",
        paidByPlaceholder: "Nom du membre de la famille",
        addExpenseBtn: "Ajouter Dépense",
        
        // Categories
        foodDining: "🍕 Nourriture",
        transportation: "🚗 Transport",
        shopping: "🛍️ Shopping",
        entertainment: "🎬 Divertissement",
        billsUtilities: "💡 Services Publics",
        healthcare: "🏥 Santé",
        education: "📚 Éducation",
        travel: "✈️ Voyage",
        personalCare: "💅 Soins Personnels",
        homeGarden: "🏡 Logement",
        other: "📦 Autre",
        
        // Dashboard Stats
        thisMonth: "Ce Mois",
        thisYear: "Cette Année",
        totalExpenses: "Total Dépenses",
        avgMonthly: "Moyenne/Mois",
        totalAmount: "Montant Total",
        
        // Charts
        expensesByCategory: "Dépenses par Catégorie",
        monthlySpendingTrend: "Tendance des Dépenses Mensuelles",
        spendingByMember: "Dépenses par Membre de la Famille",
        dailySpending: "Dépenses Quotidiennes (30 Derniers Jours)",
        
        // Period selector
        period7Days: "7J",
        period30Days: "30J",
        period3Months: "3M",
        period6Months: "6M",
        period1Year: "1A",
        periodAll: "Tout",
        customRange: "Personnalisé",
        fromDate: "De",
        toDate: "À",
        applyRange: "Appliquer",
        
        // History
        expenseHistory: "Historique des Dépenses",
        allCategories: "Toutes Catégories",
        allMembers: "Tous Membres",
        clearFilters: "Effacer Filtres",
        deleteBtn: "🗑️ Supprimer",
        
        // Messages
        expenseAdded: "Dépense ajoutée avec succès!",
        expenseDeleted: "Dépense supprimée avec succès!",
        deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette dépense?",
        confirmDelete: "Confirmer la Suppression",
        cancel: "Annuler",
        delete: "Supprimer",
        dataExported: "Données exportées avec succès!",
        dataImported: "Données importées avec succès!",
        dataImportedConverted: "Données importées avec succès! Certaines dépenses ont été converties depuis un format différent.",
        importError: "Erreur lors de l'importation. Veuillez vérifier le format du fichier.",
        noExpenses: "Aucune dépense trouvée. Ajoutez des dépenses pour les voir ici!",
        customRangeApplied: "Plage de dates personnalisée appliquée!",
        invalidDateRange: "Plage de dates invalide. La date de début doit être antérieure à la date de fin.",
        selectBothDates: "Veuillez sélectionner les dates de début et de fin.",
        
        // Language
        language: "Langue",
        
        // Currency
        currency: "Devise",
        selectCurrency: "Sélectionner la Devise",
        
        // Settings
        settings: "Paramètres",
        saveSettings: "Enregistrer les Paramètres",
        settingsSaved: "Paramètres enregistrés avec succès!"
    },
    ja: {
        // Header
        appTitle: "🏠 家計簿トラッカー",
        exportData: "📤",
        importData: "📥",
        exportTooltip: "データをエクスポート",
        importTooltip: "データをインポート",
        settingsTooltip: "設定",
        
        // Tabs
        addExpense: "支出追加",
        dashboard: "ダッシュボード",
        history: "履歴",
        
        // Add Expense Form
        addNewExpense: "新しい支出を追加",
        amount: "金額",
        description: "説明",
        category: "カテゴリー",
        selectCategory: "カテゴリーを選択",
        date: "日付",
        paidBy: "支払者",
        paidByPlaceholder: "家族の名前",
        addExpenseBtn: "支出を追加",
        
        // Categories
        foodDining: "🍕 食費",
        transportation: "🚗 交通費",
        shopping: "🛍️ ショッピング",
        entertainment: "🎬 娯楽",
        billsUtilities: "💡 光熱費",
        healthcare: "🏥 医療",
        education: "📚 教育",
        travel: "✈️ 旅行",
        personalCare: "💅 美容・身だしなみ",
        homeGarden: "🏡 住居",
        other: "📦 その他",
        
        // Dashboard Stats
        thisMonth: "今月",
        thisYear: "今年",
        totalExpenses: "総支出数",
        avgMonthly: "月平均",
        totalAmount: "総金額",
        
        // Charts
        expensesByCategory: "カテゴリー別支出",
        monthlySpendingTrend: "月別支出トレンド",
        spendingByMember: "家族別支出",
        dailySpending: "日別支出（過去30日）",
        
        // Period selector
        period7Days: "7日",
        period30Days: "30日",
        period3Months: "3ヶ月",
        period6Months: "6ヶ月",
        period1Year: "1年",
        periodAll: "全期間",
        customRange: "カスタム",
        fromDate: "開始日",
        toDate: "終了日",
        applyRange: "適用",
        
        // History
        expenseHistory: "支出履歴",
        allCategories: "全カテゴリー",
        allMembers: "全メンバー",
        clearFilters: "フィルターをクリア",
        deleteBtn: "🗑️ 削除",
        
        // Messages
        expenseAdded: "支出が正常に追加されました！",
        expenseDeleted: "支出が正常に削除されました！",
        deleteConfirm: "この支出を削除してもよろしいですか？",
        confirmDelete: "削除の確認",
        cancel: "キャンセル",
        delete: "削除",
        dataExported: "データが正常にエクスポートされました！",
        dataImported: "データが正常にインポートされました！",
        dataImportedConverted: "データが正常にインポートされました！一部の支出は異なる形式から変換されました。",
        importError: "データのインポートエラー。ファイル形式を確認してください。",
        noExpenses: "支出が見つかりません。支出を追加してここで確認してください！",
        customRangeApplied: "カスタム日付範囲が適用されました！",
        invalidDateRange: "無効な日付範囲です。開始日は終了日より前である必要があります。",
        selectBothDates: "開始日と終了日の両方を選択してください。",
        
        // Language
        language: "言語",
        
        // Currency
        currency: "通貨",
        selectCurrency: "通貨を選択",
        
        // Settings
        settings: "設定",
        saveSettings: "設定を保存",
        settingsSaved: "設定が正常に保存されました！"
    }
};

// Currency configuration
const currencies = {
    USD: { symbol: '$', code: 'USD', name: 'US Dollar' },
    EUR: { symbol: '€', code: 'EUR', name: 'Euro' },
    JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen' }
};

class ExpenseTracker {
    constructor() {
        this.expenses = this.loadExpenses();
        this.currentTab = 'add-expense';
        this.charts = {};
        this.currentLanguage = this.loadLanguage();
        this.currentCurrency = this.loadCurrency();
        this.isRendering = false;
        this.renderTimeout = null;
        this.selectedPeriod = '30'; // Default to 30 days
        this.selectedMemberPeriod = '30'; // Default to 30 days for member chart
        this.customDateRange = { from: null, to: null };
        this.customMemberDateRange = { from: null, to: null };
        this.init();
    }

    // Language management methods
    loadLanguage() {
        const savedLanguage = localStorage.getItem('expenseTrackerLanguage');
        if (savedLanguage && translations[savedLanguage]) {
            return savedLanguage;
        }
        
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('fr')) {
            return 'fr';
        } else if (browserLang.startsWith('ja')) {
            return 'ja';
        }
        return 'en'; // Default to English
    }

    saveLanguage() {
        localStorage.setItem('expenseTrackerLanguage', this.currentLanguage);
        document.body.setAttribute('data-lang', this.currentLanguage);
    }

    t(key) {
        return translations[this.currentLanguage][key] || translations.en[key] || key;
    }

    setLanguage(lang) {
        if (translations[lang]) {
            this.currentLanguage = lang;
            this.saveLanguage();
            this.updateAllTexts();
            this.updateChartLabels();
            this.updateLanguageSelector(lang);
        }
    }

    updateAllTexts() {
        // Update header
        document.querySelector('.header h1').textContent = this.t('appTitle');
        document.getElementById('exportBtn').innerHTML = this.t('exportData');
        document.getElementById('importBtn').innerHTML = this.t('importData');
        
        // Update tooltips
        document.getElementById('exportBtn').title = this.t('exportTooltip');
        document.getElementById('importBtn').title = this.t('importTooltip');
        document.getElementById('settingsBtn').title = this.t('settingsTooltip');
        
        // Update tabs
        document.querySelector('[data-tab="add-expense"]').textContent = this.t('addExpense');
        document.querySelector('[data-tab="dashboard"]').textContent = this.t('dashboard');
        document.querySelector('[data-tab="history"]').textContent = this.t('history');
        
        // Update currency selector
        document.getElementById('currencySelector').querySelector('option[value=""]').textContent = this.t('selectCurrency');
        
        // Update add expense form
        document.querySelector('#add-expense h2').textContent = this.t('addNewExpense');
        const amountLabel = document.querySelector('label[for="amount"]');
        const currency = currencies[this.currentCurrency];
        amountLabel.textContent = `${this.t('amount')} (${currency.code})`;
        document.querySelector('label[for="description"]').textContent = this.t('description');
        document.querySelector('label[for="category"]').textContent = this.t('category');
        document.querySelector('label[for="date"]').textContent = this.t('date');
        document.querySelector('label[for="paidBy"]').textContent = this.t('paidBy');
        document.getElementById('paidBy').placeholder = this.t('paidByPlaceholder');
        document.querySelector('#expenseForm button[type="submit"]').textContent = this.t('addExpenseBtn');
        
        // Update category options
        const categorySelect = document.getElementById('category');
        categorySelect.querySelector('option[value=""]').textContent = this.t('selectCategory');
        categorySelect.querySelector('option[value="Food"]').textContent = this.t('foodDining');
        categorySelect.querySelector('option[value="Transportation"]').textContent = this.t('transportation');
        categorySelect.querySelector('option[value="Shopping"]').textContent = this.t('shopping');
        categorySelect.querySelector('option[value="Entertainment"]').textContent = this.t('entertainment');
        categorySelect.querySelector('option[value="Utilities"]').textContent = this.t('billsUtilities');
        categorySelect.querySelector('option[value="Healthcare"]').textContent = this.t('healthcare');
        categorySelect.querySelector('option[value="Education"]').textContent = this.t('education');
        categorySelect.querySelector('option[value="Travel"]').textContent = this.t('travel');
        categorySelect.querySelector('option[value="Personal Care"]').textContent = this.t('personalCare');
        categorySelect.querySelector('option[value="Housing"]').textContent = this.t('homeGarden');
        categorySelect.querySelector('option[value="Other"]').textContent = this.t('other');
        
        // Update dashboard stats
        document.querySelector('.stat-card:nth-child(1) h3').textContent = this.t('thisMonth');
        document.querySelector('.stat-card:nth-child(2) h3').textContent = this.t('thisYear');
        document.querySelector('.stat-card:nth-child(3) h3').textContent = this.t('totalExpenses');
        document.querySelector('.stat-card:nth-child(4) h3').textContent = this.t('avgMonthly');
        
        // Update chart titles
        document.querySelector('.chart-card:nth-child(1) h3').textContent = this.t('expensesByCategory');
        document.querySelector('.chart-card:nth-child(2) h3').textContent = this.t('monthlySpendingTrend');
        document.querySelector('.chart-container:nth-child(3) .chart-card:nth-child(1) h3').textContent = this.t('spendingByMember');
        document.querySelector('.chart-container:nth-child(3) .chart-card:nth-child(2) h3').textContent = this.t('dailySpending');
        
        // Update history section
        document.querySelector('#history h2').textContent = this.t('expenseHistory');
        document.getElementById('clearFilters').textContent = this.t('clearFilters');
        document.querySelector('.total-label').textContent = this.t('totalAmount') + ':';
        
        // Update filter placeholders
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter.querySelector('option[value=""]')) {
            categoryFilter.querySelector('option[value=""]').textContent = this.t('allCategories');
        }
        
        // Update settings modal
        this.updateSettingsModalTexts();
        
        // Update confirmation modal
        this.updateConfirmModalTexts();
        
        const memberFilter = document.getElementById('memberFilter');
        if (memberFilter.querySelector('option[value=""]')) {
            memberFilter.querySelector('option[value=""]').textContent = this.t('allMembers');
        }
        
        // Re-render expense history to update delete buttons
        this.renderExpenseHistory();
        
        // Update filters
        this.setupFilters();
        
        // Update period selector buttons
        this.updatePeriodSelectorTexts();
    }

    updateChartLabels() {
        // Re-render all charts with new language (throttled)
        if (this.currentTab === 'dashboard') {
            this.safeRenderCharts();
        }
    }

    // Safe chart rendering with throttling to prevent infinite loops
    safeRenderCharts() {
        if (this.isRendering) {
            return;
        }
        
        // Clear any pending render timeout
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        
        // Throttle chart rendering to prevent cascading re-renders
        this.renderTimeout = setTimeout(() => {
            if (this.currentTab === 'dashboard') {
                this.renderCharts();
            }
        }, 100);
    }

    // Destroy all charts to prevent memory leaks
    destroyAllCharts() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
                this.charts[key] = null;
            }
        });
    }

    // Currency management methods
    loadCurrency() {
        const savedCurrency = localStorage.getItem('expenseTrackerCurrency');
        if (savedCurrency && currencies[savedCurrency]) {
            return savedCurrency;
        }
        
        // Detect currency based on language
        switch (this.currentLanguage) {
            case 'fr':
                return 'EUR';
            case 'ja':
                return 'JPY';
            default:
                return 'USD';
        }
    }

    saveCurrency() {
        localStorage.setItem('expenseTrackerCurrency', this.currentCurrency);
    }

    setCurrency(currencyCode) {
        if (currencies[currencyCode]) {
            this.currentCurrency = currencyCode;
            this.saveCurrency();
            this.updateAllCurrencyDisplays();
            document.getElementById('currencySelector').value = currencyCode;
        }
    }

    formatCurrency(amount) {
        const currency = currencies[this.currentCurrency];
        
        // Format based on currency and locale
        if (this.currentCurrency === 'JPY') {
            // Japanese Yen doesn't use decimal places
            return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
        } else {
            return `${currency.symbol}${amount.toFixed(2)}`;
        }
    }

    updateAllCurrencyDisplays() {
        // Update amount label in form
        const amountLabel = document.querySelector('label[for="amount"]');
        const currency = currencies[this.currentCurrency];
        amountLabel.textContent = `${this.t('amount')} (${currency.code})`;
        
        // Update all monetary displays
        this.updateStats();
        this.renderExpenseHistory();
        
        // Update charts if on dashboard
        if (this.currentTab === 'dashboard') {
            this.safeRenderCharts();
        }
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.setDefaultDate();
        this.updateDashboard();
        this.renderExpenseHistory();
        this.setupFilters();
        this.initializeLanguageSelector();
        this.initializeCurrencySelector();
        this.updateAllTexts(); // Apply translations on initial load
        this.initializeSettingsModal();
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.destroyAllCharts();
            if (this.renderTimeout) {
                clearTimeout(this.renderTimeout);
            }
        });
    }

    initializeLanguageSelector() {
        this.setupCustomLanguageSelector();
        this.updateLanguageSelector(this.currentLanguage);
        document.body.setAttribute('data-lang', this.currentLanguage);
    }

    setupCustomLanguageSelector() {
        const customSelect = document.querySelector('.language-selector-wrapper');
        const trigger = document.getElementById('languageSelector');
        const options = document.querySelectorAll('.custom-option');

        // Toggle dropdown
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            customSelect.classList.toggle('open');
        });

        // Handle option selection
        options.forEach((option) => {
            option.addEventListener('click', (e) => {
                const value = option.getAttribute('data-value');
                const flagElement = option.querySelector('.fi');
                const flagClass = flagElement ? flagElement.className : '';
                const flagContent = flagElement ? `<span class="${flagClass}"></span>` : '<span>' + option.firstChild.textContent + '</span>';
                const text = option.querySelector('.option-text').textContent;
                
                // Update trigger display
                const selectedOption = trigger.querySelector('.selected-option');
                selectedOption.innerHTML = `${flagContent}<span class="option-text">${text}</span>`;
                
                // Update selected state
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                
                // Close dropdown
                customSelect.classList.remove('open');
                
                // Trigger language change
                if (value) {
                    this.setLanguage(value);
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            customSelect.classList.remove('open');
        });
    }

    updateLanguageSelector(language) {
        const options = document.querySelectorAll('.custom-option');
        const trigger = document.getElementById('languageSelector');
        
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-value') === language) {
                option.classList.add('selected');
                const flagElement = option.querySelector('.fi');
                const flagClass = flagElement ? flagElement.className : '';
                const flagContent = flagElement ? `<span class="${flagClass}"></span>` : '<span>' + option.firstChild.textContent + '</span>';
                const text = option.querySelector('.option-text').textContent;
                
                const selectedOption = trigger.querySelector('.selected-option');
                selectedOption.innerHTML = `${flagContent}<span class="option-text">${text}</span>`;
            }
        });
    }

    initializeCurrencySelector() {
        const currencySelector = document.getElementById('currencySelector');
        currencySelector.value = this.currentCurrency;
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Export/Import
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));

        // Filter controls
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('memberFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('monthFilter').addEventListener('change', () => this.applyFilters());
        
        // Currency selector
        document.getElementById('currencySelector').addEventListener('change', (e) => {
            if (e.target.value) {
                this.setCurrency(e.target.value);
            }
        });
        
        // Period selector for category chart
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('period-btn') && !e.target.classList.contains('member-period-btn')) {
                this.handlePeriodSelection(e.target);
            } else if (e.target.classList.contains('member-period-btn')) {
                this.handleMemberPeriodSelection(e.target);
            } else if (e.target.classList.contains('apply-range-btn')) {
                this.handleCustomRangeApplication(e.target);
            }
        });
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.dataset.tab;
                const previousTab = this.currentTab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === targetTab) {
                        content.classList.add('active');
                    }
                });

                // Clean up previous tab if needed
                if (previousTab === 'dashboard' && targetTab !== 'dashboard') {
                    // Clear any pending render timeout when leaving dashboard
                    if (this.renderTimeout) {
                        clearTimeout(this.renderTimeout);
                        this.renderTimeout = null;
                    }
                }

                this.currentTab = targetTab;
                
                // Update dashboard when switching to it, but with a delay to ensure DOM is ready
                if (targetTab === 'dashboard') {
                    // Wait for tab transition to complete before rendering charts
                    setTimeout(() => {
                        if (this.currentTab === 'dashboard') {
                            this.updateDashboard();
                        }
                    }, 50);
                }
            });
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    addExpense() {
        const form = document.getElementById('expenseForm');
        const formData = new FormData(form);
        
        const expense = {
            id: Date.now().toString(),
            amount: parseFloat(formData.get('amount')),
            description: formData.get('description'),
            category: formData.get('category'),
            date: formData.get('date'),
            paidBy: formData.get('paidBy'),
            timestamp: new Date().toISOString()
        };

        this.expenses.push(expense);
        this.saveExpenses();
        this.showToast(this.t('expenseAdded'));
        
        form.reset();
        this.setDefaultDate();
        
        // Update dashboard if it's the current tab
        if (this.currentTab === 'dashboard') {
            this.updateDashboard();
        }
        
        this.renderExpenseHistory();
        this.setupFilters();
    }

    deleteExpense(id) {
        this.showConfirmModal(id);
    }

    showConfirmModal(expenseId) {
        const modal = document.getElementById('confirmModal');
        const confirmMessage = document.getElementById('confirmMessage');
        const confirmBtn = document.getElementById('confirmDelete');
        const cancelBtn = document.getElementById('cancelDelete');
        const closeBtn = document.getElementById('closeConfirm');

        // Update message text
        confirmMessage.textContent = this.t('deleteConfirm');

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Focus on cancel button for better UX
        setTimeout(() => cancelBtn.focus(), 100);

        // Handle confirm delete
        const handleConfirm = () => {
            this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
            this.saveExpenses();
            this.showToast(this.t('expenseDeleted'));
            this.renderExpenseHistory();
            this.updateDashboard();
            this.setupFilters();
            this.hideConfirmModal();
            cleanup();
        };

        // Handle cancel/close
        const handleCancel = () => {
            this.hideConfirmModal();
            cleanup();
        };

        // Cleanup event listeners
        const cleanup = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            closeBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleBackdropClick);
            document.removeEventListener('keydown', handleKeydown);
        };

        // Handle backdrop click
        const handleBackdropClick = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        // Handle keyboard navigation
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
            } else if (e.key === 'Enter') {
                handleConfirm();
            }
        };

        // Add event listeners
        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);
        closeBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleBackdropClick);
        document.addEventListener('keydown', handleKeydown);
    }

    hideConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    loadExpenses() {
        const saved = localStorage.getItem('familyExpenses');
        return saved ? JSON.parse(saved) : [];
    }

    saveExpenses() {
        localStorage.setItem('familyExpenses', JSON.stringify(this.expenses));
    }

    updateDashboard() {
        this.updateStats();
        this.safeRenderCharts();
    }

    updateStats() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Monthly total
        const monthlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        });
        const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Yearly total
        const yearlyExpenses = this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === currentYear;
        });
        const yearlyTotal = yearlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

        // Average monthly (based on months with expenses)
        const monthsWithExpenses = new Set();
        this.expenses.forEach(expense => {
            const date = new Date(expense.date);
            monthsWithExpenses.add(`${date.getFullYear()}-${date.getMonth()}`);
        });
        const avgMonthly = monthsWithExpenses.size > 0 ? 
            this.expenses.reduce((sum, expense) => sum + expense.amount, 0) / monthsWithExpenses.size : 0;

        // Update DOM
        document.getElementById('monthlyTotal').textContent = this.formatCurrency(monthlyTotal);
        document.getElementById('yearlyTotal').textContent = this.formatCurrency(yearlyTotal);
        document.getElementById('totalExpenses').textContent = this.expenses.length;
        document.getElementById('avgMonthly').textContent = this.formatCurrency(avgMonthly);
    }

    renderCharts() {
        if (this.isRendering) {
            return;
        }
        
        this.isRendering = true;
        
        try {
            this.renderCategoryChart();
            this.renderTrendChart();
            this.renderMemberChart();
            this.renderDailyChart();
        } finally {
            this.isRendering = false;
        }
    }

    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return; // Chart container doesn't exist
        
        // Destroy existing chart
        if (this.charts.category) {
            this.charts.category.destroy();
            this.charts.category = null;
        }

        // Clear canvas to prevent Chart.js stacking bug
        ctx.width = ctx.width;

        const categoryData = {};
        // Use expenses for selected period instead of all expenses
        const periodExpenses = this.getExpensesForPeriod(this.selectedPeriod, 'category');
        periodExpenses.forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

        // Don't render if no data
        if (Object.keys(categoryData).length === 0) {
            return;
        }

        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB'
        ];

        this.charts.category = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: colors.slice(0, Object.keys(categoryData).length),
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    renderTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return; // Chart container doesn't exist
        
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.charts.trend = null;
        }

        ctx.width = ctx.width;

        // Group expenses by month
        const monthlyData = {};
        this.expenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
        });

        // Sort by date and get last 12 months
        const sortedMonths = Object.keys(monthlyData).sort().slice(-12);
        const amounts = sortedMonths.map(month => monthlyData[month]);

        // Don't render if no data
        if (sortedMonths.length === 0) {
            return;
        }

        this.charts.trend = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: sortedMonths.map(month => {
                    const [year, monthNum] = month.split('-');
                    return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                }),
                datasets: [{
                    label: this.t('monthlySpendingTrend'),
                    data: amounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderMemberChart() {
        const ctx = document.getElementById('memberChart');
        if (!ctx) return; // Chart container doesn't exist
        
        if (this.charts.member) {
            this.charts.member.destroy();
            this.charts.member = null;
        }

        ctx.width = ctx.width;

        const memberData = {};
        // Use expenses for selected member period instead of all expenses
        const periodExpenses = this.getExpensesForPeriod(this.selectedMemberPeriod, 'member');
        periodExpenses.forEach(expense => {
            memberData[expense.paidBy] = (memberData[expense.paidBy] || 0) + expense.amount;
        });

        // Don't render if no data
        if (Object.keys(memberData).length === 0) {
            return;
        }

        this.charts.member = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(memberData),
                datasets: [{
                    label: 'Amount Spent',
                    data: Object.values(memberData),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderDailyChart() {
        const ctx = document.getElementById('dailyChart');
        if (!ctx) return; // Chart container doesn't exist
        
        if (this.charts.daily) {
            this.charts.daily.destroy();
            this.charts.daily = null;
        }

        ctx.width = ctx.width;

        // Get last 30 days
        const last30Days = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            last30Days.push(date.toISOString().split('T')[0]);
        }

        // Group expenses by day
        const dailyData = {};
        last30Days.forEach(day => {
            dailyData[day] = 0;
        });

        this.expenses.forEach(expense => {
            if (dailyData.hasOwnProperty(expense.date)) {
                dailyData[expense.date] += expense.amount;
            }
        });

        this.charts.daily = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: last30Days.map(date => {
                    const d = new Date(date);
                    return d.getDate();
                }),
                datasets: [{
                    label: 'Daily Spending',
                    data: Object.values(dailyData),
                    backgroundColor: 'rgba(118, 75, 162, 0.8)',
                    borderColor: '#764ba2',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrency(value);
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Day of Month'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    renderExpenseHistory(filteredExpenses = null) {
        const expenseList = document.getElementById('expenseList');
        const historyTotal = document.getElementById('historyTotal');
        const expenses = filteredExpenses || [...this.expenses].reverse(); // Show newest first

        // Calculate total amount for displayed expenses
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        historyTotal.textContent = this.formatCurrency(totalAmount);

        if (expenses.length === 0) {
            expenseList.innerHTML = `
                <div class="empty-state">
                    <h3>${this.t('noExpenses')}</h3>
                </div>
            `;
            return;
        }

        expenseList.innerHTML = expenses.map(expense => `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-details">
                        <span class="expense-detail-item expense-date">📅 ${new Date(expense.date).toLocaleDateString()}</span>
                        <span class="expense-detail-item expense-category">📂 ${expense.category}</span>
                        <span class="expense-detail-item expense-member">👤 ${expense.paidBy}</span>
                    </div>
                </div>
                <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                <div class="expense-actions">
                    <button class="btn btn-danger btn-small" onclick="tracker.deleteExpense('${expense.id}')">
                        ${this.t('deleteBtn')}
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupFilters() {
        // Populate category filter
        const categories = [...new Set(this.expenses.map(e => e.category))];
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.innerHTML = `<option value="">${this.t('allCategories')}</option>` +
            categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

        // Populate member filter
        const members = [...new Set(this.expenses.map(e => e.paidBy))];
        const memberFilter = document.getElementById('memberFilter');
        memberFilter.innerHTML = `<option value="">${this.t('allMembers')}</option>` +
            members.map(member => `<option value="${member}">${member}</option>`).join('');
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const memberFilter = document.getElementById('memberFilter').value;
        const monthFilter = document.getElementById('monthFilter').value;

        let filteredExpenses = this.expenses;

        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
        }

        if (memberFilter) {
            filteredExpenses = filteredExpenses.filter(e => e.paidBy === memberFilter);
        }

        if (monthFilter) {
            filteredExpenses = filteredExpenses.filter(e => {
                const expenseMonth = e.date.substring(0, 7); // YYYY-MM format
                return expenseMonth === monthFilter;
            });
        }

        this.renderExpenseHistory(filteredExpenses);
    }

    clearFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('memberFilter').value = '';
        document.getElementById('monthFilter').value = '';
        this.renderExpenseHistory();
    }

    exportData() {
        const data = {
            expenses: this.expenses,
            language: this.currentLanguage,
            currency: this.currentCurrency,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-expenses-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast(this.t('dataExported'));
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.expenses && Array.isArray(data.expenses)) {
                    // Transform expenses to match our format
                    let hasConvertedExpenses = false;
                    const transformedExpenses = data.expenses.map(expense => {
                        // Check if expense already has our format (has paidBy field)
                        if (expense.paidBy !== undefined) {
                            return expense; // Already in our format
                        }
                        
                        // Transform from other app format to our format
                        hasConvertedExpenses = true;
                        return {
                            id: expense.id ? expense.id.toString() : Date.now().toString(),
                            amount: parseFloat(expense.amount) || 0,
                            description: expense.description || '',
                            category: expense.category || 'Other',
                            date: expense.date || new Date().toISOString().split('T')[0],
                            paidBy: 'Unknown', // Default value for missing field
                            timestamp: expense.timestamp || new Date().toISOString()
                        };
                    });
                    
                    // Merge imported expenses with existing ones (avoid duplicates by ID)
                    const existingIds = new Set(this.expenses.map(e => e.id));
                    const newExpenses = transformedExpenses.filter(e => !existingIds.has(e.id));
                    
                    this.expenses = [...this.expenses, ...newExpenses];
                    this.saveExpenses();
                    
                    // Handle language settings
                    if (data.language && translations[data.language]) {
                        this.setLanguage(data.language);
                    }
                    
                    // Handle currency settings - support both formats
                    let currencyCode = null;
                    if (data.currency) {
                        if (typeof data.currency === 'string') {
                            // Our format: currency is a string like "USD"
                            currencyCode = data.currency;
                        } else if (data.currency.code) {
                            // Other app format: currency is an object with code property
                            currencyCode = data.currency.code;
                        }
                        
                        if (currencyCode && currencies[currencyCode]) {
                            this.setCurrency(currencyCode);
                        }
                    }
                    
                    // Show appropriate success message
                    const message = hasConvertedExpenses ? this.t('dataImportedConverted') : this.t('dataImported');
                    this.showToast(message);
                    this.updateDashboard();
                    this.renderExpenseHistory();
                    this.setupFilters();
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showToast(this.t('importError'), 'error');
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    initializeSettingsModal() {
        const settingsBtn = document.getElementById('settingsBtn');
        const modal = document.getElementById('settingsModal');
        const closeBtn = document.getElementById('closeSettings');
        const saveBtn = document.getElementById('saveSettings');

        // Open modal
        settingsBtn.addEventListener('click', () => {
            modal.classList.add('show');
        });

        // Close modal
        const closeModal = () => {
            modal.classList.remove('show');
        };

        closeBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Save settings
        saveBtn.addEventListener('click', () => {
            this.showToast(this.t('settingsSaved'), 'success');
            closeModal();
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    }

    updateSettingsModalTexts() {
        // Update modal header
        const settingsTitle = document.querySelector('#settingsModal .modal-header h2');
        if (settingsTitle) {
            settingsTitle.textContent = `⚙️ ${this.t('settings')}`;
        }

        // Update section titles
        const languageSection = document.querySelector('#settingsModal .settings-section:first-child h3');
        if (languageSection) {
            languageSection.innerHTML = `🌐 ${this.t('language')}`;
        }

        const currencySection = document.querySelector('#settingsModal .settings-section:last-child h3');
        if (currencySection) {
            currencySection.innerHTML = `💰 ${this.t('currency')}`;
        }

        // Update currency selector
        const currencySelector = document.querySelector('#settingsModal #currencySelector');
        if (currencySelector) {
            const firstOption = currencySelector.querySelector('option[value=""]');
            if (firstOption) {
                firstOption.textContent = this.t('selectCurrency');
            }
        }

        // Update save button
        const saveBtn = document.getElementById('saveSettings');
        if (saveBtn) {
            saveBtn.textContent = this.t('saveSettings');
        }
    }

    updateConfirmModalTexts() {
        // Update confirmation modal header
        const confirmTitle = document.querySelector('#confirmModal .modal-header h2');
        if (confirmTitle) {
            confirmTitle.textContent = `🗑️ ${this.t('confirmDelete')}`;
        }

        // Update buttons
        const cancelBtn = document.getElementById('cancelDelete');
        if (cancelBtn) {
            cancelBtn.textContent = this.t('cancel');
        }

        const confirmBtn = document.getElementById('confirmDelete');
        if (confirmBtn) {
            confirmBtn.textContent = this.t('delete');
        }
    }

    updatePeriodSelectorTexts() {
        const periodButtons = document.querySelectorAll('.period-btn');
        periodButtons.forEach(btn => {
            const period = btn.dataset.period;
            switch(period) {
                case '7':
                    btn.textContent = this.t('period7Days');
                    break;
                case '30':
                    btn.textContent = this.t('period30Days');
                    break;
                case '90':
                    btn.textContent = this.t('period3Months');
                    break;
                case '180':
                    btn.textContent = this.t('period6Months');
                    break;
                case '365':
                    btn.textContent = this.t('period1Year');
                    break;
                case 'all':
                    btn.textContent = this.t('periodAll');
                    break;
                case 'custom':
                    btn.textContent = this.t('customRange');
                    break;
            }
        });
        
        // Update custom range labels
        const categoryFromLabel = document.querySelector('label[for="categoryFromDate"]');
        const categoryToLabel = document.querySelector('label[for="categoryToDate"]');
        const memberFromLabel = document.querySelector('label[for="memberFromDate"]');
        const memberToLabel = document.querySelector('label[for="memberToDate"]');
        const applyButtons = document.querySelectorAll('.apply-range-btn');
        
        if (categoryFromLabel) categoryFromLabel.textContent = this.t('fromDate');
        if (categoryToLabel) categoryToLabel.textContent = this.t('toDate');
        if (memberFromLabel) memberFromLabel.textContent = this.t('fromDate');
        if (memberToLabel) memberToLabel.textContent = this.t('toDate');
        
        applyButtons.forEach(btn => {
            btn.textContent = this.t('applyRange');
        });
    }

    handlePeriodSelection(selectedBtn) {
        // Remove active class from all category period buttons
        document.querySelectorAll('.period-btn:not(.member-period-btn)').forEach(btn => {
            btn.classList.remove('active', 'custom-range-active');
        });
        
        // Add active class to selected button
        selectedBtn.classList.add('active');
        
        // Update selected period
        this.selectedPeriod = selectedBtn.dataset.period;
        
        // Show/hide custom range controls
        const customRangeControls = document.getElementById('categoryCustomRange');
        if (this.selectedPeriod === 'custom') {
            customRangeControls.style.display = 'block';
        } else {
            customRangeControls.style.display = 'none';
            // Re-render the category chart with new period
            this.renderCategoryChart();
        }
    }

    handleMemberPeriodSelection(selectedBtn) {
        // Remove active class from all member period buttons
        document.querySelectorAll('.member-period-btn').forEach(btn => {
            btn.classList.remove('active', 'custom-range-active');
        });
        
        // Add active class to selected button
        selectedBtn.classList.add('active');
        
        // Update selected member period
        this.selectedMemberPeriod = selectedBtn.dataset.period;
        
        // Show/hide custom range controls
        const customRangeControls = document.getElementById('memberCustomRange');
        if (this.selectedMemberPeriod === 'custom') {
            customRangeControls.style.display = 'block';
        } else {
            customRangeControls.style.display = 'none';
            // Re-render the member chart with new period
            this.renderMemberChart();
        }
    }

    handleCustomRangeApplication(applyBtn) {
        const chartType = applyBtn.dataset.chart;
        
        // Add loading state
        applyBtn.classList.add('loading');
        
        setTimeout(() => {
            if (chartType === 'category') {
                const fromDate = document.getElementById('categoryFromDate').value;
                const toDate = document.getElementById('categoryToDate').value;
                
                if (fromDate && toDate) {
                    if (new Date(fromDate) <= new Date(toDate)) {
                        this.customDateRange = { from: fromDate, to: toDate };
                        this.renderCategoryChart();
                        this.showToast(this.t('customRangeApplied') || 'Custom date range applied!');
                        
                        // Add visual indicator
                        const customBtn = document.querySelector('.period-btn[data-period="custom"]:not(.member-period-btn)');
                        if (customBtn) {
                            customBtn.classList.add('custom-range-active');
                        }
                    } else {
                        this.showToast(this.t('invalidDateRange') || 'Invalid date range. From date must be before To date.', 'error');
                    }
                } else {
                    this.showToast(this.t('selectBothDates') || 'Please select both from and to dates.', 'error');
                }
            } else if (chartType === 'member') {
                const fromDate = document.getElementById('memberFromDate').value;
                const toDate = document.getElementById('memberToDate').value;
                
                if (fromDate && toDate) {
                    if (new Date(fromDate) <= new Date(toDate)) {
                        this.customMemberDateRange = { from: fromDate, to: toDate };
                        this.renderMemberChart();
                        this.showToast(this.t('customRangeApplied') || 'Custom date range applied!');
                        
                        // Add visual indicator
                        const customBtn = document.querySelector('.member-period-btn[data-period="custom"]');
                        if (customBtn) {
                            customBtn.classList.add('custom-range-active');
                        }
                    } else {
                        this.showToast(this.t('invalidDateRange') || 'Invalid date range. From date must be before To date.', 'error');
                    }
                } else {
                    this.showToast(this.t('selectBothDates') || 'Please select both from and to dates.', 'error');
                }
            }
            
            // Remove loading state
            applyBtn.classList.remove('loading');
        }, 300); // Small delay for UX
    }
    
    getExpensesForPeriod(period, chartType = 'category') {
        if (period === 'custom') {
            const customRange = chartType === 'member' ? this.customMemberDateRange : this.customDateRange;
            
            if (!customRange.from || !customRange.to) {
                return this.expenses;
            }
            
            const fromDate = new Date(customRange.from);
            const toDate = new Date(customRange.to);
            // Set toDate to end of day to include the entire day
            toDate.setHours(23, 59, 59, 999);
            
            return this.expenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= fromDate && expenseDate <= toDate;
            });
        }
        
        if (period === 'all') {
            return this.expenses;
        }
        
        const days = parseInt(period);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= cutoffDate;
        });
    }
}

// Initialize the app
const tracker = new ExpenseTracker();
