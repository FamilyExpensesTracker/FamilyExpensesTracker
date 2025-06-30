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
        sortBy: "Sort by:",
        sortDateDesc: "Date (Newest First)",
        sortDateAsc: "Date (Oldest First)", 
        sortAmountDesc: "Amount (Highest First)",
        sortAmountAsc: "Amount (Lowest First)",
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
        settingsSaved: "Settings saved successfully!",
        
        // Encryption
        exportOptions: "Export Options",
        plainTextExport: "Plain Text (No Encryption)",
        plainTextDesc: "Export data as readable JSON file",
        encryptedExport: "Encrypted (Password Protected)",
        encryptedDesc: "Export data encrypted with a password",
        enterPassword: "Enter Password",
        confirmPassword: "Confirm Password",
        passwordPlaceholder: "Enter password",
        confirmPasswordPlaceholder: "Confirm password",
        passwordMismatch: "Passwords do not match",
        passwordTooShort: "Password must be at least 8 characters long",
        encryptionFailed: "Encryption failed",
        decryptAndImport: "Decrypt & Import",
        decrypting: "Decrypting...",
        decryptingData: "Decrypting data...",
        incorrectPassword: "Incorrect password or corrupted file",
        fileEncrypted: "This file is encrypted. Please enter the password to decrypt it:",
        importCancelled: "Import cancelled",
        editExpense: "Edit Expense",
        editBtn: "✏️ Edit",
        saveChanges: "Save Changes",
        expenseUpdated: "Expense updated successfully!",
        editCancelled: "Edit cancelled",
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
        sortBy: "Trier par:",
        sortDateDesc: "Date (Le Plus Récent)",
        sortDateAsc: "Date (Le Plus Ancien)",
        sortAmountDesc: "Montant (Le Plus Élevé)",
        sortAmountAsc: "Montant (Le Plus Bas)",
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
        settingsSaved: "Paramètres enregistrés avec succès!",
        
        // Encryption
        exportOptions: "Options d'Exportation",
        plainTextExport: "Texte Brut (Sans Chiffrement)",
        plainTextDesc: "Exporter les données comme fichier JSON lisible",
        encryptedExport: "Chiffré (Protégé par Mot de Passe)",
        encryptedDesc: "Exporter les données chiffrées avec un mot de passe",
        enterPassword: "Entrer le Mot de Passe",
        confirmPassword: "Confirmer le Mot de Passe",
        passwordPlaceholder: "Entrer le mot de passe",
        confirmPasswordPlaceholder: "Confirmer le mot de passe",
        passwordMismatch: "Les mots de passe ne correspondent pas",
        passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
        encryptionFailed: "Échec du chiffrement",
        decryptAndImport: "Déchiffrer et Importer",
        decrypting: "Déchiffrement...",
        decryptingData: "Déchiffrement des données...",
        incorrectPassword: "Mot de passe incorrect ou fichier corrompu",
        fileEncrypted: "Ce fichier est chiffré. Veuillez entrer le mot de passe pour le déchiffrer:",
        importCancelled: "Importation annulée",
        editExpense: "Modifier la Dépense",
        editBtn: "✏️ Modifier",
        saveChanges: "Enregistrer les Modifications",
        expenseUpdated: "Dépense mise à jour avec succès!",
        editCancelled: "Modification annulée",
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
        sortBy: "並び替え:",
        sortDateDesc: "日付 (新しい順)",
        sortDateAsc: "日付 (古い順)",
        sortAmountDesc: "金額 (高い順)",
        sortAmountAsc: "金額 (安い順)",
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
        settingsSaved: "設定が正常に保存されました！",
        
        // Encryption
        exportOptions: "エクスポートオプション",
        plainTextExport: "プレーンテキスト（暗号化なし）",
        plainTextDesc: "読み取り可能なJSONファイルとしてデータをエクスポート",
        encryptedExport: "暗号化（パスワード保護）",
        encryptedDesc: "パスワードで暗号化されたデータをエクスポート",
        enterPassword: "パスワードを入力",
        confirmPassword: "パスワードを確認",
        passwordPlaceholder: "パスワードを入力",
        confirmPasswordPlaceholder: "パスワードを確認",
        passwordMismatch: "パスワードが一致しません",
        passwordTooShort: "パスワードは8文字以上である必要があります",
        encryptionFailed: "暗号化に失敗しました",
        decryptAndImport: "復号化してインポート",
        decrypting: "復号化中...",
        decryptingData: "データを復号化中...",
        incorrectPassword: "パスワードが間違っているかファイルが破損しています",
        fileEncrypted: "このファイルは暗号化されています。復号化するためのパスワードを入力してください：",
        importCancelled: "インポートがキャンセルされました",
        editExpense: "支出を編集",
        editBtn: "✏️ 編集",
        saveChanges: "変更を保存",
        expenseUpdated: "支出が正常に更新されました！",
        editCancelled: "編集がキャンセルされました",
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
        this.currentSort = { field: 'date', order: 'desc' }; // Default sort: newest first
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

    editExpense(id) {
        const expense = this.expenses.find(e => e.id === id);
        if (!expense) {
            this.showToast('Expense not found', 'error');
            return;
        }
        
        this.showEditModal(expense);
    }

    showEditModal(expense) {
        const modal = document.getElementById('editModal');
        
        // Populate form with expense data
        document.getElementById('editAmount').value = expense.amount;
        document.getElementById('editDescription').value = expense.description;
        document.getElementById('editDate').value = expense.date;
        document.getElementById('editPaidBy').value = expense.paidBy;
        
        // Populate category dropdown and set selected value
        this.populateEditCategoryDropdown();
        document.getElementById('editCategory').value = expense.category;
        
        // Store the expense ID for saving
        modal.dataset.expenseId = expense.id;
        
        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => document.getElementById('editAmount').focus(), 100);
    }

    hideEditModal() {
        const modal = document.getElementById('editModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        delete modal.dataset.expenseId;
    }

    initializeEditModal() {
        const modal = document.getElementById('editModal');
        const closeBtn = document.getElementById('closeEdit');
        const cancelBtn = document.getElementById('cancelEdit');
        const saveBtn = document.getElementById('saveEdit');
        const form = document.getElementById('editExpenseForm');

        // Close modal handlers
        const closeModal = () => {
            this.hideEditModal();
            this.showToast(this.t('editCancelled'), 'info');
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });

        // Save changes handler
        const saveChanges = (e) => {
            e.preventDefault();
            this.saveExpenseChanges();
        };

        saveBtn.addEventListener('click', saveChanges);
        form.addEventListener('submit', saveChanges);
    }

    saveExpenseChanges() {
        const modal = document.getElementById('editModal');
        const expenseId = modal.dataset.expenseId;
        
        if (!expenseId) {
            this.showToast('Error: Expense ID not found', 'error');
            return;
        }

        const form = document.getElementById('editExpenseForm');
        const formData = new FormData(form);
        
        // Validate required fields
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description').trim();
        const category = formData.get('category');
        const date = formData.get('date');
        const paidBy = formData.get('paidBy').trim();

        if (!amount || amount <= 0) {
            this.showToast('Please enter a valid amount', 'error');
            return;
        }

        if (!description) {
            this.showToast('Please enter a description', 'error');
            return;
        }

        if (!category) {
            this.showToast('Please select a category', 'error');
            return;
        }

        if (!date) {
            this.showToast('Please select a date', 'error');
            return;
        }

        if (!paidBy) {
            this.showToast('Please enter who paid', 'error');
            return;
        }

        // Find and update the expense
        const expenseIndex = this.expenses.findIndex(e => e.id === expenseId);
        if (expenseIndex === -1) {
            this.showToast('Expense not found', 'error');
            return;
        }

        // Update the expense while preserving the original ID and timestamp
        const originalExpense = this.expenses[expenseIndex];
        this.expenses[expenseIndex] = {
            ...originalExpense,
            amount: amount,
            description: description,
            category: category,
            date: date,
            paidBy: paidBy,
            lastModified: new Date().toISOString()
        };

        // Save to localStorage
        this.saveExpenses();
        
        // Update UI
        this.showToast(this.t('expenseUpdated'));
        this.hideEditModal();
        
        // Refresh displays
        if (this.currentTab === 'dashboard') {
            this.updateDashboard();
        }
        this.renderExpenseHistory();
        this.setupFilters();
    }

    populateEditCategoryDropdown() {
        const categorySelect = document.getElementById('editCategory');
        const categories = this.getCategories();
        
        // Clear existing options
        categorySelect.innerHTML = '';
        
        // Add placeholder option
        const placeholderOption = document.createElement('option');
        placeholderOption.value = '';
        placeholderOption.textContent = this.t('selectCategory');
        categorySelect.appendChild(placeholderOption);
        
        // Add categories from the configuration
        Object.values(categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = `${category.emoji} ${category.translations[this.currentLanguage]}`;
            categorySelect.appendChild(option);
        });
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
        
        // Update edit modal texts
        this.updateEditModalTexts();
        
        // Update category options dynamically
        this.populateCategoryDropdown();
        
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
        
        // Update sort controls
        document.querySelector('.sort-label').textContent = this.t('sortBy');
        document.getElementById('sortDateDesc').title = this.t('sortDateDesc');
        document.getElementById('sortDateAsc').title = this.t('sortDateAsc');
        document.getElementById('sortAmountDesc').title = this.t('sortAmountDesc');
        document.getElementById('sortAmountAsc').title = this.t('sortAmountAsc');
        
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
        
        // Re-render expense history to update edit/delete buttons
        this.renderExpenseHistory();
        
        // Update filters
        this.setupFilters();
        
        // Update period selector buttons
        this.updatePeriodSelectorTexts();
    }

    updateEditModalTexts() {
        // Update modal header
        const editTitle = document.querySelector('#editModal .modal-header h2');
        if (editTitle) {
            editTitle.textContent = `✏️ ${this.t('editExpense')}`;
        }

        // Update form labels
        const editAmountLabel = document.querySelector('label[for="editAmount"]');
        if (editAmountLabel) {
            const currency = currencies[this.currentCurrency];
            editAmountLabel.textContent = `${this.t('amount')} (${currency.code})`;
        }

        const editDescriptionLabel = document.querySelector('label[for="editDescription"]');
        if (editDescriptionLabel) {
            editDescriptionLabel.textContent = this.t('description');
        }

        const editCategoryLabel = document.querySelector('label[for="editCategory"]');
        if (editCategoryLabel) {
            editCategoryLabel.textContent = this.t('category');
        }

        const editDateLabel = document.querySelector('label[for="editDate"]');
        if (editDateLabel) {
            editDateLabel.textContent = this.t('date');
        }

        const editPaidByLabel = document.querySelector('label[for="editPaidBy"]');
        if (editPaidByLabel) {
            editPaidByLabel.textContent = this.t('paidBy');
        }

        // Update placeholder
        const editPaidByInput = document.getElementById('editPaidBy');
        if (editPaidByInput) {
            editPaidByInput.placeholder = this.t('paidByPlaceholder');
        }

        // Update buttons
        const cancelBtn = document.getElementById('cancelEdit');
        if (cancelBtn) {
            cancelBtn.textContent = this.t('cancel');
        }

        const saveBtn = document.getElementById('saveEdit');
        if (saveBtn) {
            saveBtn.textContent = this.t('saveChanges');
        }

        // Update category dropdown in edit modal if it exists and is populated
        if (document.getElementById('editCategory').children.length > 0) {
            this.populateEditCategoryDropdown();
        }
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
        this.populateCategoryDropdown(); // Populate categories first
        this.updateDashboard();
        this.renderExpenseHistory();
        this.setupFilters();
        this.initializeLanguageSelector();
        this.initializeCurrencySelector();
        this.updateAllTexts(); // Apply translations on initial load
        this.initializeSettingsModal();
        this.initializeEditModal();
        
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
        document.getElementById('historyStartDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('historyEndDate').addEventListener('change', () => this.applyFilters());

        // Sort controls
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleSort(btn));
        });
        
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
        // Use filtered expenses if provided, otherwise apply current sort to all expenses
        const expenses = filteredExpenses || this.sortExpenses(this.expenses);

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

        // Get categories configuration for translation
        const categories = this.getCategories();

        expenseList.innerHTML = expenses.map(expense => {
            // Get translated category name
            const category = categories[expense.category];
            const categoryDisplay = category ? 
                `${category.emoji} ${category.translations[this.currentLanguage]}` : 
                expense.category; // Fallback to stored value if category not found

            return `
                <div class="expense-item">
                    <div class="expense-info">
                        <div class="expense-description">${expense.description}</div>
                        <div class="expense-details">
                            <span class="expense-detail-item expense-date">📅 ${new Date(expense.date).toLocaleDateString()}</span>
                            <span class="expense-detail-item expense-category">${categoryDisplay}</span>
                            <span class="expense-detail-item expense-member">👤 ${expense.paidBy}</span>
                        </div>
                    </div>
                    <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                    <div class="expense-actions">
                        <button class="btn btn-edit btn-small" onclick="tracker.editExpense('${expense.id}')">
                            ${this.t('editBtn')}
                        </button>
                        <button class="btn btn-danger btn-small" onclick="tracker.deleteExpense('${expense.id}')">
                            ${this.t('deleteBtn')}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    setupFilters() {
        // Populate category filter with proper translations
        const usedCategories = [...new Set(this.expenses.map(e => e.category))];
        const allCategories = this.getCategories();
        const categoryFilter = document.getElementById('categoryFilter');
        
        let categoryOptions = `<option value="">${this.t('allCategories')}</option>`;
        usedCategories.forEach(categoryValue => {
            const category = allCategories[categoryValue];
            if (category) {
                const displayName = `${category.emoji} ${category.translations[this.currentLanguage]}`;
                categoryOptions += `<option value="${categoryValue}">${displayName}</option>`;
            } else {
                // Fallback for categories not in the configuration
                categoryOptions += `<option value="${categoryValue}">${categoryValue}</option>`;
            }
        });
        categoryFilter.innerHTML = categoryOptions;

        // Populate member filter
        const members = [...new Set(this.expenses.map(e => e.paidBy))];
        const memberFilter = document.getElementById('memberFilter');
        memberFilter.innerHTML = `<option value="">${this.t('allMembers')}</option>` +
            members.map(member => `<option value="${member}">${member}</option>`).join('');
            
        // Ensure sort controls are properly initialized
        this.initializeSortControls();
    }
    
    initializeSortControls() {
        // Reset all sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        
        // Set the active button based on current sort state
        const activeButton = document.querySelector(`[data-sort="${this.currentSort.field}"][data-order="${this.currentSort.order}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const memberFilter = document.getElementById('memberFilter').value;
        const startDate = document.getElementById('historyStartDate').value;
        const endDate = document.getElementById('historyEndDate').value;

        let filteredExpenses = this.expenses;

        if (categoryFilter) {
            filteredExpenses = filteredExpenses.filter(e => e.category === categoryFilter);
        }

        if (memberFilter) {
            filteredExpenses = filteredExpenses.filter(e => e.paidBy === memberFilter);
        }

        if (startDate) {
            filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= new Date(startDate));
        }

        if (endDate) {
            filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= new Date(endDate));
        }

        // Apply current sorting
        const sortedExpenses = this.sortExpenses(filteredExpenses);

        this.renderExpenseHistory(sortedExpenses);
    }

    clearFilters() {
        document.getElementById('categoryFilter').value = '';
        document.getElementById('memberFilter').value = '';
        document.getElementById('historyStartDate').value = '';
        document.getElementById('historyEndDate').value = '';
        
        // Reset sort to default (date descending)
        this.currentSort = { field: 'date', order: 'desc' };
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById('sortDateDesc').classList.add('active');
        
        this.renderExpenseHistory();
    }

    // Get categories configuration
    getCategories() {
        return {
            Food: {
                value: "Food",
                emoji: "🍕",
                translations: {
                    en: "Food",
                    fr: "Nourriture", 
                    ja: "食費"
                }
            },
            Transportation: {
                value: "Transportation",
                emoji: "🚗",
                translations: {
                    en: "Transportation",
                    fr: "Transport",
                    ja: "交通費"
                }
            },
            Shopping: {
                value: "Shopping",
                emoji: "🛍️",
                translations: {
                    en: "Shopping",
                    fr: "Shopping",
                    ja: "ショッピング"
                }
            },
            Entertainment: {
                value: "Entertainment",
                emoji: "🎬",
                translations: {
                    en: "Entertainment",
                    fr: "Divertissement",
                    ja: "娯楽"
                }
            },
            Utilities: {
                value: "Utilities",
                emoji: "💡",
                translations: {
                    en: "Utilities",
                    fr: "Services Publics",
                    ja: "光熱費"
                }
            },
            Healthcare: {
                value: "Healthcare",
                emoji: "🏥",
                translations: {
                    en: "Healthcare",
                    fr: "Santé",
                    ja: "医療"
                }
            },
            Education: {
                value: "Education",
                emoji: "📚",
                translations: {
                    en: "Education",
                    fr: "Éducation",
                    ja: "教育"
                }
            },
            Travel: {
                value: "Travel",
                emoji: "✈️",
                translations: {
                    en: "Travel",
                    fr: "Voyage",
                    ja: "旅行"
                }
            },
            "Personal Care": {
                value: "Personal Care",
                emoji: "💅",
                translations: {
                    en: "Personal Care",
                    fr: "Soins Personnels",
                    ja: "美容・身だしなみ"
                }
            },
            Housing: {
                value: "Housing",
                emoji: "🏡",
                translations: {
                    en: "Housing",
                    fr: "Logement",
                    ja: "住居"
                }
            },  
            Other: {
                value: "Other",
                emoji: "📦",
                translations: {
                    en: "Other",
                    fr: "Autre",
                    ja: "その他"
                }
            }
        };
    }

    exportData() {
        this.showExportOptionsModal();
    }

    showExportOptionsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📤 ${this.t('exportOptions')}</h2>
                    <button class="modal-close" id="closeExportModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="export-options">
                        <label class="export-option">
                            <input type="radio" name="exportType" value="plain" checked>
                            <span class="option-label">📄 ${this.t('plainTextExport')}</span>
                            <span class="option-description">${this.t('plainTextDesc')}</span>
                        </label>
                        <label class="export-option">
                            <input type="radio" name="exportType" value="encrypted">
                            <span class="option-label">🔐 ${this.t('encryptedExport')}</span>
                            <span class="option-description">${this.t('encryptedDesc')}</span>
                        </label>
                    </div>
                    <div class="password-section" id="passwordSection" style="display: none;">
                        <div class="form-group">
                            <label for="exportPassword">${this.t('enterPassword')}:</label>
                            <input type="password" id="exportPassword" placeholder="${this.t('passwordPlaceholder')}">
                        </div>
                        <div class="form-group">
                            <label for="exportPasswordConfirm">${this.t('confirmPassword')}:</label>
                            <input type="password" id="exportPasswordConfirm" placeholder="${this.t('confirmPasswordPlaceholder')}">
                        </div>
                        <div class="password-strength" id="passwordStrength"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelExportBtn">${this.t('cancel')}</button>
                    <button class="btn btn-primary" id="performExportBtn">${this.t('exportData')}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for modal controls
        const closeBtn = modal.querySelector('#closeExportModal');
        const cancelBtn = modal.querySelector('#cancelExportBtn');
        const exportBtn = modal.querySelector('#performExportBtn');
        
        const closeModal = () => {
            modal.remove();
        };
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        exportBtn.addEventListener('click', () => this.performExport());
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Add event listeners for export type radio buttons
        const radioButtons = modal.querySelectorAll('input[name="exportType"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                const passwordSection = modal.querySelector('#passwordSection');
                if (radio.value === 'encrypted') {
                    passwordSection.style.display = 'block';
                } else {
                    passwordSection.style.display = 'none';
                }
            });
        });
        
        // Add password strength indicator
        const passwordInput = modal.querySelector('#exportPassword');
        const strengthIndicator = modal.querySelector('#passwordStrength');
        
        if (passwordInput && strengthIndicator) {
            passwordInput.addEventListener('input', () => {
                const password = passwordInput.value;
                const strength = this.calculatePasswordStrength(password);
                strengthIndicator.textContent = strength.text;
                strengthIndicator.className = `password-strength ${strength.class}`;
            });
        }
    }

    async performExport() {
        // Find the modal more specifically
        const modal = document.querySelector('.modal.show');
        if (!modal) {
            console.error('Export modal not found');
            this.showToast('Export modal not found', 'error');
            return;
        }

        const exportTypeElement = modal.querySelector('input[name="exportType"]:checked');
        if (!exportTypeElement) {
            console.error('Export type not selected');
            this.showToast('Please select an export type', 'error');
            return;
        }

        const exportType = exportTypeElement.value;
        
        // Define the categories available in the app
        const categories = this.getCategories();

        const data = {
            expenses: this.expenses,
            categories: categories,
            language: this.currentLanguage,
            currency: this.currentCurrency,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        let exportData;
        let filename;
        
        if (exportType === 'encrypted') {
            const passwordElement = modal.querySelector('#exportPassword');
            const confirmPasswordElement = modal.querySelector('#exportPasswordConfirm');
            
            if (!passwordElement || !confirmPasswordElement) {
                console.error('Password fields not found in modal');
                this.showToast('Password fields not found', 'error');
                return;
            }

            const password = passwordElement.value;
            const confirmPassword = confirmPasswordElement.value;
            
            if (!password) {
                this.showToast('Please enter a password', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showToast(this.t('passwordMismatch'), 'error');
                return;
            }
            
            if (password.length < 8) {
                this.showToast(this.t('passwordTooShort'), 'error');
                return;
            }
            
            try {
                exportData = await this.encryptData(data, password);
                filename = `family-expenses-encrypted-${new Date().toISOString().split('T')[0]}.json`;
            } catch (error) {
                console.error('Encryption error:', error);
                this.showToast(this.t('encryptionFailed') + ': ' + error.message, 'error');
                return;
            }
        } else {
            exportData = JSON.stringify(data, null, 2);
            filename = `family-expenses-${new Date().toISOString().split('T')[0]}.json`;
        }
        
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        modal.remove();
        this.showToast(this.t('dataExported'));
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];
        
        if (password.length >= 8) score += 1;
        else feedback.push('at least 8 characters');
        
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('lowercase letters');
        
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('uppercase letters');
        
        if (/[0-9]/.test(password)) score += 1;
        else feedback.push('numbers');
        
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else feedback.push('special characters');
        
        if (score < 2) return { text: 'Weak - Add: ' + feedback.slice(0, 2).join(', '), class: 'weak' };
        if (score < 4) return { text: 'Medium - Add: ' + feedback.slice(0, 1).join(', '), class: 'medium' };
        return { text: 'Strong', class: 'strong' };
    }

    async encryptData(data, password) {
        try {
            // Generate a random salt
            const salt = crypto.getRandomValues(new Uint8Array(16));
            
            // Generate a random IV
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Import the password as a key
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            
            // Derive the encryption key using PBKDF2
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['encrypt']
            );
            
            // Encrypt the data
            const encodedData = new TextEncoder().encode(JSON.stringify(data));
            const encryptedData = await crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encodedData
            );
            
            // Create the encrypted package
            const encryptedPackage = {
                encrypted: true,
                version: '1.0',
                salt: Array.from(salt),
                iv: Array.from(iv),
                data: Array.from(new Uint8Array(encryptedData))
            };
            
            return JSON.stringify(encryptedPackage, null, 2);
        } catch (error) {
            throw new Error('Failed to encrypt data: ' + error.message);
        }
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const rawData = JSON.parse(e.target.result);
                
                // Check if data is encrypted
                if (rawData.encrypted === true) {
                    await this.handleEncryptedImport(rawData);
                } else {
                    await this.handlePlainImport(rawData);
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

    async handleEncryptedImport(encryptedData) {
        return new Promise((resolve, reject) => {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🔐 ${this.t('enterPassword')}</h2>
                        <button class="modal-close" id="cancelImportBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${this.t('fileEncrypted')}</p>
                        <div class="form-group">
                            <label for="importPassword">${this.t('enterPassword')}:</label>
                            <input type="password" id="importPassword" placeholder="${this.t('passwordPlaceholder')}" autofocus>
                        </div>
                        <div class="decrypt-status" id="decryptStatus"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancelImportBtn2">${this.t('cancel')}</button>
                        <button class="btn btn-primary" id="decryptBtn">${this.t('decryptAndImport')}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const passwordInput = modal.querySelector('#importPassword');
            const decryptBtn = modal.querySelector('#decryptBtn');
            const statusDiv = modal.querySelector('#decryptStatus');
            const cancelBtn1 = modal.querySelector('#cancelImportBtn');
            const cancelBtn2 = modal.querySelector('#cancelImportBtn2');
            
            const cancelImport = () => {
                modal.remove();
                reject(new Error(this.t('importCancelled')));
            };
            
            cancelBtn1.addEventListener('click', cancelImport);
            cancelBtn2.addEventListener('click', cancelImport);
            
            const attemptDecrypt = async () => {
                const password = passwordInput.value;
                if (!password) {
                    statusDiv.textContent = this.t('passwordPlaceholder');
                    statusDiv.className = 'decrypt-status error';
                    return;
                }
                
                try {
                    decryptBtn.disabled = true;
                    decryptBtn.textContent = this.t('decrypting');
                    statusDiv.textContent = this.t('decryptingData');
                    statusDiv.className = 'decrypt-status info';
                    
                    const decryptedData = await this.decryptData(encryptedData, password);
                    await this.handlePlainImport(decryptedData);
                    
                    modal.remove();
                    resolve();
                } catch (error) {
                    console.error('Decryption error:', error);
                    statusDiv.textContent = this.t('incorrectPassword');
                    statusDiv.className = 'decrypt-status error';
                    decryptBtn.disabled = false;
                    decryptBtn.textContent = this.t('decryptAndImport');
                }
            };
            
            decryptBtn.addEventListener('click', attemptDecrypt);
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    attemptDecrypt();
                }
            });
        });
    }

    async handlePlainImport(data) {
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
    }

    async decryptData(encryptedPackage, password) {
        try {
            // Extract the encrypted data components
            const salt = new Uint8Array(encryptedPackage.salt);
            const iv = new Uint8Array(encryptedPackage.iv);
            const encryptedData = new Uint8Array(encryptedPackage.data);
            
            // Import the password as a key
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                new TextEncoder().encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveKey']
            );
            
            // Derive the decryption key using PBKDF2
            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: salt,
                    iterations: 100000,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );
            
            // Decrypt the data
            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encryptedData
            );
            
            // Convert back to JSON
            const decryptedText = new TextDecoder().decode(decryptedData);
            return JSON.parse(decryptedText);
        } catch (error) {
            throw new Error('Failed to decrypt data: Incorrect password or corrupted file');
        }
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

    // Populate category dropdown dynamically
    populateCategoryDropdown() {
        const categorySelect = document.getElementById('category');
        const categories = this.getCategories();
        
        // Clear existing options except the first one (Select a category)
        const firstOption = categorySelect.querySelector('option[value=""]');
        categorySelect.innerHTML = '';
        categorySelect.appendChild(firstOption);
        
        // Update the placeholder text
        firstOption.textContent = this.t('selectCategory');
        
        // Add categories from the configuration
        Object.values(categories).forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = `${category.emoji} ${category.translations[this.currentLanguage]}`;
            categorySelect.appendChild(option);
        });
    }

    handleSort(button) {
        const sortField = button.dataset.sort;
        const sortOrder = button.dataset.order;
        
        // Update current sort state
        this.currentSort = { field: sortField, order: sortOrder };
        
        // Update button states
        document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Apply current filters with new sort
        this.applyFilters();
    }

    sortExpenses(expenses) {
        return [...expenses].sort((a, b) => {
            let comparison = 0;
            
            if (this.currentSort.field === 'date') {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                comparison = dateA - dateB;
            } else if (this.currentSort.field === 'amount') {
                comparison = a.amount - b.amount;
            }
            
            // Reverse for descending order
            return this.currentSort.order === 'desc' ? -comparison : comparison;
        });
    }
}

// Initialize the app
const tracker = new ExpenseTracker();
