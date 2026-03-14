import { BaseExpenseTracker } from "./base-expense-tracker.js";
import {
    currencies,
    recurrenceOptions,
    translations,
} from "./translations.js";

const MONTHLY_BUDGETS_KEY = "expenseTrackerMonthlyBudgets";
const RECURRENCE_HORIZON_DAYS = 365;

export class ExpenseTracker extends BaseExpenseTracker {
    init() {
        this.initializeEnhancedState();
        this.ensureEnhancedLayout();
        super.init();
        this.renderBudgetSettings();
        this.generateRecurringExpenses({ save: true });
        this.updateDashboard();
        this.renderExpenseHistory();
        this.setupFilters();
    }

    initializeEnhancedState() {
        if (this._enhancedStateReady) {
            return;
        }

        this.monthlyBudgets = this.loadMonthlyBudgets();
        this._recurrenceControlsBound = false;
        this._enhancedStateReady = true;
    }

    ensureEnhancedLayout() {
        this.ensureRecurrenceFields(
            document.getElementById("expenseForm"),
            "paidBy",
            "",
        );
        this.ensureRecurrenceFields(
            document.getElementById("editExpenseForm"),
            "editPaidBy",
            "edit",
        );
        this.ensureBudgetOverviewCard();
        this.ensureBudgetSettingsSection();
    }

    ensureRecurrenceFields(form, paidByFieldId, prefix) {
        if (!form || form.querySelector(`[data-enhanced="${prefix || "add"}"]`)) {
            return;
        }

        const paidByGroup = form
            .querySelector(`label[for="${paidByFieldId}"]`)
            ?.closest(".form-group");
        if (!paidByGroup) {
            return;
        }

        const key = prefix || "add";
        const recurrenceId = prefix ? `${prefix}Recurrence` : "recurrence";
        const recurrenceEndId = prefix
            ? `${prefix}RecurrenceEnd`
            : "recurrenceEnd";

        paidByGroup.insertAdjacentHTML(
            "afterend",
            `
            <div class="form-group recurrence-group" data-enhanced="${key}">
                <label for="${recurrenceId}"></label>
                <select id="${recurrenceId}" name="recurrence">
                    <option value="none"></option>
                    <option value="daily"></option>
                    <option value="weekly"></option>
                    <option value="monthly"></option>
                    <option value="yearly"></option>
                </select>
            </div>
            <div class="form-group recurrence-group recurrence-end-group" id="${recurrenceEndId}Group" data-enhanced="${key}-end">
                <label for="${recurrenceEndId}"></label>
                <input type="date" id="${recurrenceEndId}" name="recurrenceEnd">
            </div>
            `,
        );
    }

    ensureBudgetOverviewCard() {
        if (document.getElementById("budgetOverviewCard")) {
            return;
        }

        const dashboard = document.getElementById("dashboard");
        const anchor = dashboard?.querySelector(".chart-container");
        if (!dashboard || !anchor) {
            return;
        }

        anchor.insertAdjacentHTML(
            "beforebegin",
            `
            <div class="card budget-overview-card" id="budgetOverviewCard">
                <div class="budget-overview-header">
                    <h3 id="budgetOverviewTitle"></h3>
                    <p id="budgetOverviewHint" class="budget-overview-hint"></p>
                </div>
                <div class="budget-overview-list" id="budgetOverviewList"></div>
            </div>
            `,
        );
    }

    ensureBudgetSettingsSection() {
        if (document.getElementById("budgetSettingsSection")) {
            return;
        }

        const categoriesSection = document
            .getElementById("customCategoryList")
            ?.closest(".settings-section");
        if (!categoriesSection) {
            return;
        }

        categoriesSection.insertAdjacentHTML(
            "afterend",
            `
            <div class="settings-section budget-settings-section" id="budgetSettingsSection">
                <h3 id="budgetSettingsTitle"></h3>
                <p id="budgetSettingsHint" class="budget-settings-hint"></p>
                <div class="budget-settings-list" id="budgetSettingsList"></div>
            </div>
            `,
        );
    }

    setupEventListeners() {
        super.setupEventListeners();
        this.bindRecurringControls();
    }

    bindRecurringControls() {
        if (this._recurrenceControlsBound) {
            return;
        }

        const addSelect = document.getElementById("recurrence");
        const editSelect = document.getElementById("editRecurrence");

        if (addSelect) {
            addSelect.addEventListener("change", () =>
                this.updateRecurrenceVisibility(""),
            );
        }

        if (editSelect) {
            editSelect.addEventListener("change", () =>
                this.updateRecurrenceVisibility("edit"),
            );
        }

        this._recurrenceControlsBound = true;
        this.updateRecurrenceVisibility("");
        this.updateRecurrenceVisibility("edit");
    }

    initializeSettingsModal() {
        const settingsBtn = document.getElementById("settingsBtn");
        const modal = document.getElementById("settingsModal");
        const closeBtn = document.getElementById("closeSettings");
        const saveBtn = document.getElementById("saveSettings");

        settingsBtn.addEventListener("click", () => {
            this.renderBudgetSettings();
            modal.classList.add("show");
        });

        const closeModal = () => {
            modal.classList.remove("show");
        };

        closeBtn.addEventListener("click", closeModal);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        saveBtn.addEventListener("click", () => {
            this.saveMonthlyBudgets();
            this.renderBudgetSettings();
            this.renderBudgetOverview();
            this.showToast(this.t("settingsSaved"), "success");
            closeModal();

            if (this.syncManager.isAuthenticated() && !this.syncManager.isSyncing) {
                this.syncManager.sync().catch((error) => {
                    console.error("Settings sync failed:", error);
                });
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("show")) {
                closeModal();
            }
        });
    }

    updateAllTexts() {
        super.updateAllTexts();
        this.populateRecurrenceSelect(
            document.getElementById("recurrence"),
            this.normalizeRecurrence(
                document.getElementById("recurrence")?.value || "none",
            ),
        );
        this.populateRecurrenceSelect(
            document.getElementById("editRecurrence"),
            this.normalizeRecurrence(
                document.getElementById("editRecurrence")?.value || "none",
            ),
        );

        const recurrenceLabel = document.querySelector('label[for="recurrence"]');
        const recurrenceEndLabel = document.querySelector(
            'label[for="recurrenceEnd"]',
        );
        const budgetTitle = document.getElementById("budgetOverviewTitle");
        const budgetHint = document.getElementById("budgetOverviewHint");

        if (recurrenceLabel) {
            recurrenceLabel.textContent = this.t("recurrence");
        }
        if (recurrenceEndLabel) {
            recurrenceEndLabel.textContent = this.t("recurrenceEnd");
        }
        if (budgetTitle) {
            budgetTitle.textContent = this.t("monthlyBudgets");
        }
        if (budgetHint) {
            budgetHint.textContent = this.t("budgetSettingsHint");
        }

        this.updateRecurrenceVisibility("");
        this.updateRecurrenceVisibility("edit");
        this.renderBudgetSettings();
        this.renderBudgetOverview();
    }

    updateEditModalTexts() {
        super.updateEditModalTexts();

        const recurrenceLabel = document.querySelector(
            'label[for="editRecurrence"]',
        );
        const recurrenceEndLabel = document.querySelector(
            'label[for="editRecurrenceEnd"]',
        );

        if (recurrenceLabel) {
            recurrenceLabel.textContent = this.t("recurrence");
        }
        if (recurrenceEndLabel) {
            recurrenceEndLabel.textContent = this.t("recurrenceEnd");
        }

        this.populateRecurrenceSelect(
            document.getElementById("editRecurrence"),
            this.normalizeRecurrence(
                document.getElementById("editRecurrence")?.value || "none",
            ),
        );
        this.applyEditModeVisibility(
            document.getElementById("editModal")?.dataset.editMode || "",
        );
    }

    updateSettingsModalTexts() {
        super.updateSettingsModalTexts();

        const budgetTitle = document.getElementById("budgetSettingsTitle");
        const budgetHint = document.getElementById("budgetSettingsHint");

        if (budgetTitle) {
            budgetTitle.textContent = this.t("monthlyBudgets");
        }
        if (budgetHint) {
            budgetHint.textContent = this.t("budgetSettingsHint");
        }
    }

    renderCustomCategoryList() {
        const list = document.getElementById("customCategoryList");
        if (!list) {
            return;
        }
        if (this.customCategories.length === 0) {
            list.innerHTML = `<div class="category-empty">${this.t(
                "noCustomCategories",
            )}</div>`;
            return;
        }

        list.innerHTML = "";
        this.customCategories.forEach((cat, idx) => {
            const item = document.createElement("div");
            item.className = "category-item";
            item.innerHTML = `<span>${this.escapeHtml(cat.emoji)} ${this.escapeHtml(
                cat.name,
            )}</span>`;

            const removeBtn = document.createElement("button");
            removeBtn.className = "btn-remove";
            removeBtn.textContent = "x";
            removeBtn.addEventListener("click", () => {
                this.customCategories.splice(idx, 1);
                this.saveCustomCategories();
                this.renderCustomCategoryList();
                this.populateCategoryDropdown();
                this.setupFilters();
                this.showToast(this.t("categoryRemoved"));
            });

            item.appendChild(removeBtn);
            list.appendChild(item);
        });
    }

    saveCustomCategories(options = {}) {
        super.saveCustomCategories(options);
        this.cleanupBudgetsForUnknownCategories(options);
        this.renderBudgetSettings();
        this.renderBudgetOverview();
    }

    loadExpenses() {
        return super.loadExpenses().map((expense) => this.normalizeExpense(expense));
    }

    getHistoryExpensesSource() {
        return this.expenses.filter((expense) => !this.isSeriesAnchor(expense));
    }

    normalizeRecurrence(value) {
        return recurrenceOptions.includes(value) ? value : "none";
    }

    normalizeExpense(expense) {
        const generatedFromId = expense.generatedFromId
            ? String(expense.generatedFromId)
            : "";
        const occurrenceDate = this.normalizeDateValue(
            expense.occurrenceDate || "",
        );
        const normalized = {
            ...expense,
            recurrence: this.normalizeRecurrence(expense.recurrence || "none"),
            recurrenceEnd: this.normalizeDateValue(expense.recurrenceEnd),
            seriesId: expense.seriesId ? String(expense.seriesId) : "",
            generatedFromId,
            occurrenceDate,
            excludedDates: this.normalizeDateList(expense.excludedDates),
            isRecurringTemplate: Boolean(expense.isRecurringTemplate),
            isSeriesAnchorOnly: Boolean(expense.isSeriesAnchorOnly),
            isGeneratedRecurring: Boolean(
                expense.isGeneratedRecurring ||
                    (!expense.isRecurringTemplate && generatedFromId),
            ),
        };

        if (normalized.recurrence === "none") {
            normalized.recurrenceEnd = "";
        }

        if (normalized.isRecurringTemplate && !normalized.seriesId) {
            normalized.seriesId = String(normalized.id);
        }

        if (normalized.isGeneratedRecurring && !normalized.generatedFromId) {
            normalized.isGeneratedRecurring = false;
        }

        if (normalized.isGeneratedRecurring && !normalized.occurrenceDate) {
            normalized.occurrenceDate = this.normalizeDateValue(normalized.date);
        }

        if (!normalized.isGeneratedRecurring) {
            normalized.occurrenceDate = "";
        }

        if (!normalized.isRecurringTemplate) {
            normalized.excludedDates = [];
            normalized.isSeriesAnchorOnly = false;
        }

        return normalized;
    }

    loadMonthlyBudgets() {
        try {
            const saved = localStorage.getItem(MONTHLY_BUDGETS_KEY);
            return this.normalizeBudgetMap(saved ? JSON.parse(saved) : {});
        } catch {
            return {};
        }
    }

    saveMonthlyBudgets(options = {}) {
        localStorage.setItem(
            MONTHLY_BUDGETS_KEY,
            JSON.stringify(this.monthlyBudgets),
        );
        if (options.touch !== false) {
            this.touchSettingsModified();
        }
    }

    normalizeBudgetValue(value) {
        const amount = Number(value);
        if (!Number.isFinite(amount) || amount <= 0) {
            return null;
        }
        return Math.round(amount * 100) / 100;
    }

    normalizeBudgetMap(raw) {
        if (!raw || typeof raw !== "object") {
            return {};
        }

        const normalized = {};
        Object.entries(raw).forEach(([category, amount]) => {
            const safeAmount = this.normalizeBudgetValue(amount);
            if (safeAmount) {
                normalized[String(category)] = safeAmount;
            }
        });
        return normalized;
    }

    cleanupBudgetsForUnknownCategories(options = {}) {
        const validCategories = new Set(
            Object.values(this.getCategories()).map((category) => category.value),
        );

        Object.keys(this.monthlyBudgets).forEach((category) => {
            if (!validCategories.has(category)) {
                delete this.monthlyBudgets[category];
            }
        });

        this.saveMonthlyBudgets(options);
    }

    buildSyncSettings() {
        return {
            language: this.currentLanguage,
            currency: this.currentCurrency,
            customCategories: (this.customCategories || []).map((category) => ({
                name: String(category.name || "").trim(),
                emoji: String(category.emoji || "").trim() || "+",
            })),
            monthlyBudgets: this.normalizeBudgetMap(this.monthlyBudgets),
            ...this.getSettingsSyncMetadata(),
        };
    }

    applyRemoteSettings(settings = {}) {
        const remoteSettingsMs = this.normalizeOptionalTimestampMs(
            settings.lastModifiedMs ?? settings.lastModified ?? null,
        );
        const localSettingsMs = this.getSettingsLastModifiedMs();
        if (
            (remoteSettingsMs > 0 && remoteSettingsMs < localSettingsMs) ||
            (remoteSettingsMs === 0 && localSettingsMs > 0)
        ) {
            return false;
        }

        if (settings.language && translations[settings.language]) {
            this.setLanguage(settings.language, { touch: false });
        }

        if (settings.currency && currencies[settings.currency]) {
            this.setCurrency(settings.currency, { touch: false });
        }

        if (Array.isArray(settings.customCategories)) {
            const seen = new Set();
            this.customCategories = settings.customCategories
                .map((category) => ({
                    name: String(category?.name || "").trim(),
                    emoji: String(category?.emoji || "").trim() || "+",
                }))
                .filter(
                    (category) =>
                        category.name && !seen.has(category.name) && seen.add(category.name),
                );
            super.saveCustomCategories({ touch: false });
            this.renderCustomCategoryList();
            this.populateCategoryDropdown();
            this.populateEditCategoryDropdown();
            this.setupFilters();
            this.cleanupBudgetsForUnknownCategories({ touch: false });
        }

        if (
            Object.prototype.hasOwnProperty.call(settings, "monthlyBudgets") &&
            settings.monthlyBudgets &&
            typeof settings.monthlyBudgets === "object"
        ) {
            this.monthlyBudgets = this.normalizeBudgetMap(settings.monthlyBudgets);
            this.cleanupBudgetsForUnknownCategories({ touch: false });
        } else if (Object.prototype.hasOwnProperty.call(settings, "monthlyBudgets")) {
            this.monthlyBudgets = {};
            this.saveMonthlyBudgets({ touch: false });
        }

        this.renderBudgetSettings();
        this.renderBudgetOverview();
        this.saveSettingsLastModifiedMs(remoteSettingsMs);
        return true;
    }

    getOccurrenceDate(expense) {
        return this.normalizeDateValue(expense?.occurrenceDate || expense?.date || "");
    }

    isSeriesAnchor(expense) {
        return Boolean(expense?.isRecurringTemplate && expense?.isSeriesAnchorOnly);
    }

    findRecurringTemplate(expense) {
        if (!expense) {
            return null;
        }

        if (expense.isRecurringTemplate) {
            return expense;
        }

        const templateId = String(expense.generatedFromId || "");
        if (templateId) {
            return (
                this.expenses.find(
                    (candidate) =>
                        String(candidate.id) === templateId &&
                        candidate.isRecurringTemplate,
                ) || null
            );
        }

        const seriesId = String(expense.seriesId || "");
        if (!seriesId) {
            return null;
        }

        return (
            this.expenses.find(
                (candidate) =>
                    candidate.isRecurringTemplate &&
                    String(candidate.seriesId || candidate.id) === seriesId,
            ) || null
        );
    }

    hasOccurrenceChanges(originalExpense, updatedExpense) {
        return (
            Number(originalExpense.amount) !== Number(updatedExpense.amount) ||
            String(originalExpense.description || "") !==
                String(updatedExpense.description || "") ||
            String(originalExpense.category || "") !==
                String(updatedExpense.category || "") ||
            String(originalExpense.date || "") !== String(updatedExpense.date || "") ||
            String(originalExpense.paidBy || "") !== String(updatedExpense.paidBy || "") ||
            this.normalizeRecurrence(originalExpense.recurrence || "none") !==
                this.normalizeRecurrence(updatedExpense.recurrence || "none") ||
            this.normalizeDateValue(originalExpense.recurrenceEnd) !==
                this.normalizeDateValue(updatedExpense.recurrenceEnd)
        );
    }

    excludeOccurrenceFromTemplate(expense) {
        const templateId = String(expense?.generatedFromId || "");
        const occurrenceDate = this.getOccurrenceDate(expense);
        if (!templateId || !occurrenceDate) {
            return false;
        }

        const templateIndex = this.expenses.findIndex(
            (candidate) =>
                String(candidate.id) === templateId && candidate.isRecurringTemplate,
        );
        if (templateIndex === -1) {
            return false;
        }

        const template = this.expenses[templateIndex];
        if ((template.excludedDates || []).includes(occurrenceDate)) {
            return false;
        }

        const lastModifiedMs = Date.now();
        this.expenses[templateIndex] = this.normalizeExpense({
            ...template,
            excludedDates: [...(template.excludedDates || []), occurrenceDate],
            lastModifiedMs,
            lastModified: new Date(lastModifiedMs).toISOString(),
        });
        return true;
    }

    detachGeneratedOccurrence(expense) {
        return this.normalizeExpense({
            ...expense,
            seriesId: expense.seriesId || String(expense.id),
            generatedFromId: "",
            occurrenceDate: "",
            isSeriesAnchorOnly: false,
            isGeneratedRecurring: false,
        });
    }

    createSeriesAnchorTemplate(expense) {
        const lastModifiedMs = Date.now();
        return this.normalizeExpense({
            ...expense,
            isSeriesAnchorOnly: true,
            lastModifiedMs,
            lastModified: new Date(lastModifiedMs).toISOString(),
        });
    }

    populateRecurrenceSelect(select, selectedValue = "none") {
        if (!select) {
            return;
        }

        const labels = {
            none: this.t("recurrenceNone"),
            daily: this.t("recurrenceDaily"),
            weekly: this.t("recurrenceWeekly"),
            monthly: this.t("recurrenceMonthly"),
            yearly: this.t("recurrenceYearly"),
        };

        Array.from(select.options).forEach((option) => {
            option.textContent = labels[option.value] || option.value;
        });

        select.value = this.normalizeRecurrence(selectedValue);
    }

    updateRecurrenceVisibility(prefix) {
        const recurrenceId = prefix ? `${prefix}Recurrence` : "recurrence";
        const recurrenceEndGroupId = prefix
            ? `${prefix}RecurrenceEndGroup`
            : "recurrenceEndGroup";
        const select = document.getElementById(recurrenceId);
        const endGroup = document.getElementById(recurrenceEndGroupId);

        if (!select || !endGroup) {
            return;
        }

        endGroup.style.display =
            this.normalizeRecurrence(select.value) === "none" ? "none" : "block";
    }

    renderBudgetSettings() {
        const list = document.getElementById("budgetSettingsList");
        if (!list) {
            return;
        }

        const categories = Object.values(this.getCategories()).sort((left, right) =>
            left.translations[this.currentLanguage].localeCompare(
                right.translations[this.currentLanguage],
            ),
        );

        list.innerHTML = "";

        categories.forEach((category) => {
            const row = document.createElement("label");
            row.className = "budget-setting-row";

            const name = document.createElement("span");
            name.className = "budget-setting-name";
            name.textContent = `${category.emoji} ${category.translations[this.currentLanguage]}`;

            const valueWrap = document.createElement("span");
            valueWrap.className = "budget-setting-input-wrap";

            const input = document.createElement("input");
            input.type = "number";
            input.className = "budget-setting-input";
            input.min = "0";
            input.step = this.currentCurrency === "JPY" ? "1" : "0.01";
            input.value = this.monthlyBudgets[category.value] ?? "";
            input.placeholder = this.currentCurrency === "JPY" ? "0" : "0.00";
            input.addEventListener("change", () => {
                const budget = this.normalizeBudgetValue(input.value);
                if (budget) {
                    this.monthlyBudgets[category.value] = budget;
                } else {
                    delete this.monthlyBudgets[category.value];
                    input.value = "";
                }
                this.saveMonthlyBudgets();
                this.renderBudgetOverview();
            });

            const suffix = document.createElement("span");
            suffix.className = "budget-setting-code";
            suffix.textContent = this.currentCurrency;

            valueWrap.appendChild(input);
            valueWrap.appendChild(suffix);
            row.appendChild(name);
            row.appendChild(valueWrap);
            list.appendChild(row);
        });
    }

    renderBudgetOverview() {
        const list = document.getElementById("budgetOverviewList");
        if (!list) {
            return;
        }

        const totals = this.getCurrentMonthCategoryTotals();
        const categories = this.getCategories();
        const rows = Object.entries(this.monthlyBudgets)
            .map(([category, budget]) => ({
                category,
                budget,
                spent: Number(totals[category] || 0),
                info: categories[category],
            }))
            .sort((left, right) => {
                const leftRatio = left.budget ? left.spent / left.budget : 0;
                const rightRatio = right.budget ? right.spent / right.budget : 0;
                return rightRatio - leftRatio;
            });

        list.innerHTML = "";

        if (rows.length === 0) {
            const empty = document.createElement("div");
            empty.className = "budget-empty-state";
            empty.textContent = this.t("noBudgetsConfigured");
            list.appendChild(empty);
            return;
        }

        rows.forEach((row) => {
            const percent = row.budget > 0 ? (row.spent / row.budget) * 100 : 0;
            const remaining = Math.max(row.budget - row.spent, 0);
            const item = document.createElement("div");
            item.className = "budget-progress-item";

            const header = document.createElement("div");
            header.className = "budget-progress-header";
            header.innerHTML = `
                <span>${this.escapeHtml(
                    row.info
                        ? `${row.info.emoji} ${row.info.translations[this.currentLanguage]}`
                        : row.category,
                )}</span>
                <strong>${this.formatCurrency(row.spent)} / ${this.formatCurrency(
                    row.budget,
                )}</strong>
            `;

            const bar = document.createElement("div");
            bar.className = "budget-progress-bar";
            bar.innerHTML = `<span class="budget-progress-fill ${
                percent > 100 ? "is-over" : ""
            }" style="width:${Math.min(percent, 100)}%"></span>`;

            const meta = document.createElement("div");
            meta.className = "budget-progress-meta";
            meta.innerHTML = `
                <span>${this.t("spentLabel")}: ${this.formatCurrency(row.spent)}</span>
                <span>${this.t("remainingLabel")}: ${this.formatCurrency(
                    remaining,
                )}</span>
            `;

            item.appendChild(header);
            item.appendChild(bar);
            item.appendChild(meta);
            list.appendChild(item);
        });
    }

    getCurrentMonthCategoryTotals() {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const totals = {};

        this.getAnalyticsExpenses().forEach((expense) => {
            const expenseDate = this.parseDateOnly(expense.date);
            if (
                expenseDate &&
                expenseDate.getMonth() === month &&
                expenseDate.getFullYear() === year
            ) {
                totals[expense.category] =
                    (totals[expense.category] || 0) + Number(expense.amount || 0);
            }
        });

        return totals;
    }

    checkBudgetAlerts(previousTotals = {}) {
        const currentTotals = this.getCurrentMonthCategoryTotals();
        const categories = this.getCategories();

        Object.entries(this.monthlyBudgets).forEach(([category, budget]) => {
            const previous = Number(previousTotals[category] || 0);
            const current = Number(currentTotals[category] || 0);
            if (budget > 0 && current > budget && previous <= budget) {
                const label = categories[category]
                    ? `${categories[category].emoji} ${categories[category].translations[this.currentLanguage]}`
                    : category;
                this.showToast(
                    this.t("budgetExceeded").replace("{category}", label),
                    "warning",
                );
            }
        });
    }

    addExpense() {
        const previousTotals = this.getCurrentMonthCategoryTotals();
        const expense = this.buildExpenseFromForm(
            document.getElementById("expenseForm"),
        );
        if (!expense) {
            return;
        }

        this.expenses.push(expense);
        this.generateRecurringExpenses({ save: false });
        this.saveExpenses();
        this.showToast(this.t("expenseAdded"));
        document.getElementById("expenseForm").reset();
        this.setDefaultDate();
        this.updateRecurrenceVisibility("");

        if (this.currentTab === "dashboard") {
            this.updateDashboard();
        }
        this.renderExpenseHistory();
        this.setupFilters();
        this.checkBudgetAlerts(previousTotals);
    }

    async editExpense(id) {
        const expense = this.expenses.find((candidate) => candidate.id === id);
        if (!expense) {
            this.showToast("Expense not found", "error");
            return;
        }

        const template = this.findRecurringTemplate(expense);
        if (!template || this.isSeriesAnchor(expense)) {
            this.openExpenseEdit(expense);
            return;
        }

        const editMode = await this.promptRecurringEditMode();
        if (!editMode) {
            return;
        }

        if (editMode === "series") {
            this.openExpenseEdit(template);
            return;
        }

        this.openExpenseEdit(expense, "occurrence");
    }

    openExpenseEdit(expense, mode = "") {
        const modal = document.getElementById("editModal");
        if (!modal) {
            return;
        }

        if (mode === "occurrence") {
            modal.dataset.editMode = "occurrence";
        } else {
            delete modal.dataset.editMode;
        }

        this.showEditModal(expense);
    }

    promptRecurringEditMode() {
        return new Promise((resolve) => {
            const existingModal = document.getElementById(
                "recurringEditChoiceModal",
            );
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement("div");
            modal.id = "recurringEditChoiceModal";
            modal.className = "modal show recurring-edit-modal";
            modal.innerHTML = `
                <div class="modal-content recurring-edit-modal-content">
                    <div class="modal-header">
                        <h2>${this.t("editRecurringTitle")}</h2>
                        <button type="button" class="modal-close" id="closeRecurringEditChoice">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="recurring-edit-description">${this.t("editRecurringDesc")}</p>
                        <div class="recurring-edit-options">
                            <button type="button" class="recurring-edit-card" id="editOccurrenceChoice">
                                <strong>${this.t("editThisOccurrence")}</strong>
                                <span>${this.t("editThisOccurrenceDesc")}</span>
                            </button>
                            <button type="button" class="recurring-edit-card recurring-edit-card-series" id="editSeriesChoice">
                                <strong>${this.t("editWholeSeries")}</strong>
                                <span>${this.t("editWholeSeriesDesc")}</span>
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelRecurringEditChoice">${this.t("cancel")}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            document.body.style.overflow = "hidden";

            const occurrenceBtn = document.getElementById("editOccurrenceChoice");
            const seriesBtn = document.getElementById("editSeriesChoice");
            const closeBtn = document.getElementById("closeRecurringEditChoice");
            const cancelBtn = document.getElementById("cancelRecurringEditChoice");
            let settled = false;

            const cleanup = (result) => {
                if (settled) {
                    return;
                }

                settled = true;
                occurrenceBtn?.removeEventListener("click", handleOccurrence);
                seriesBtn?.removeEventListener("click", handleSeries);
                closeBtn?.removeEventListener("click", handleCancel);
                cancelBtn?.removeEventListener("click", handleCancel);
                modal.removeEventListener("click", handleBackdropClick);
                document.removeEventListener("keydown", handleKeydown);
                modal.remove();
                document.body.style.overflow = "";
                resolve(result);
            };

            const handleOccurrence = () => cleanup("occurrence");
            const handleSeries = () => cleanup("series");
            const handleCancel = () => cleanup(null);
            const handleBackdropClick = (event) => {
                if (event.target === modal) {
                    handleCancel();
                }
            };
            const handleKeydown = (event) => {
                if (event.key === "Escape") {
                    handleCancel();
                }
            };

            occurrenceBtn?.addEventListener("click", handleOccurrence);
            seriesBtn?.addEventListener("click", handleSeries);
            closeBtn?.addEventListener("click", handleCancel);
            cancelBtn?.addEventListener("click", handleCancel);
            modal.addEventListener("click", handleBackdropClick);
            document.addEventListener("keydown", handleKeydown);

            setTimeout(() => occurrenceBtn?.focus(), 0);
        });
    }

    applyEditModeVisibility(mode = "") {
        const recurrenceGroup = document.querySelector('[data-enhanced="edit"]');
        const recurrenceEndGroup = document.getElementById("editRecurrenceEndGroup");
        const recurrenceSelect = document.getElementById("editRecurrence");
        const recurrenceEnd = document.getElementById("editRecurrenceEnd");
        const occurrenceMode = mode === "occurrence";

        if (recurrenceGroup) {
            recurrenceGroup.style.display = occurrenceMode ? "none" : "block";
        }
        if (recurrenceSelect) {
            recurrenceSelect.disabled = occurrenceMode;
        }
        if (recurrenceEnd) {
            recurrenceEnd.disabled = occurrenceMode;
        }

        if (occurrenceMode) {
            this.populateRecurrenceSelect(recurrenceSelect, "none");
            if (recurrenceEnd) {
                recurrenceEnd.value = "";
            }
            if (recurrenceEndGroup) {
                recurrenceEndGroup.style.display = "none";
            }
            return;
        }

        this.updateRecurrenceVisibility("edit");
    }

    showEditModal(expense) {
        super.showEditModal(expense);
        const recurrenceSelect = document.getElementById("editRecurrence");
        const recurrenceEnd = document.getElementById("editRecurrenceEnd");

        this.populateRecurrenceSelect(
            recurrenceSelect,
            this.normalizeRecurrence(expense.recurrence || "none"),
        );
        if (recurrenceEnd) {
            recurrenceEnd.value = expense.recurrenceEnd || "";
        }
        this.applyEditModeVisibility(
            document.getElementById("editModal")?.dataset.editMode || "",
        );
    }

    saveExpenseChanges() {
        const modal = document.getElementById("editModal");
        const expenseId = modal.dataset.expenseId;
        if (!expenseId) {
            this.showToast("Error: Expense ID not found", "error");
            return;
        }

        const expenseIndex = this.expenses.findIndex((expense) => expense.id === expenseId);
        if (expenseIndex === -1) {
            this.showToast("Expense not found", "error");
            return;
        }

        const previousTotals = this.getCurrentMonthCategoryTotals();
        const originalExpense = this.expenses[expenseIndex];
        const updatedExpense = this.buildExpenseFromForm(
            document.getElementById("editExpenseForm"),
            originalExpense,
        );
        const editMode = modal.dataset.editMode || "";
        const occurrenceOnly = editMode === "occurrence";

        if (!updatedExpense) {
            return;
        }

        if (originalExpense.isRecurringTemplate && !occurrenceOnly) {
            this.removeGeneratedOccurrences(originalExpense.id, {
                fromDate: this.todayYmd(),
                trackDeletes: this.syncManager.isAuthenticated(),
            });
        }

        let nextExpense = updatedExpense;
        let additionalExpenses = [];
        let removeCurrentExpense = false;
        if (originalExpense.isRecurringTemplate && occurrenceOnly) {
            const occurrenceId =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : Date.now() + "-" + Math.random().toString(16).slice(2);
            const occurrenceExpense = this.normalizeExpense({
                ...updatedExpense,
                id: occurrenceId,
                seriesId: originalExpense.seriesId || String(originalExpense.id),
                generatedFromId: "",
                occurrenceDate: "",
                excludedDates: [],
                isRecurringTemplate: false,
                isSeriesAnchorOnly: false,
                isGeneratedRecurring: false,
            });

            nextExpense = this.createSeriesAnchorTemplate(originalExpense);
            additionalExpenses = [occurrenceExpense];
        } else if (
            originalExpense.isRecurringTemplate &&
            originalExpense.isSeriesAnchorOnly &&
            !updatedExpense.isRecurringTemplate
        ) {
            removeCurrentExpense = true;
        } else if (
            originalExpense.isGeneratedRecurring &&
            this.hasOccurrenceChanges(originalExpense, updatedExpense)
        ) {
            this.excludeOccurrenceFromTemplate(originalExpense);
            nextExpense = this.detachGeneratedOccurrence(updatedExpense);
        }

        if (removeCurrentExpense) {
            this.expenses.splice(expenseIndex, 1);
        } else {
            this.expenses[expenseIndex] = nextExpense;
        }
        if (additionalExpenses.length > 0) {
            this.expenses.push(...additionalExpenses);
        }
        this.cleanupOrphanedRecurringExpenses();
        this.generateRecurringExpenses({ save: false });
        this.saveExpenses();
        this.showToast(this.t("expenseUpdated"));
        this.hideEditModal();

        if (this.currentTab === "dashboard") {
            this.updateDashboard();
        }
        this.renderExpenseHistory();
        this.setupFilters();
        this.checkBudgetAlerts(previousTotals);
    }

    buildExpenseFromForm(form, existingExpense = null) {
        const formData = new FormData(form);
        const amount = parseFloat(formData.get("amount"));
        const description = String(formData.get("description") || "").trim();
        const category = String(formData.get("category") || "").trim();
        const date = String(formData.get("date") || "").trim();
        const paidBy = String(formData.get("paidBy") || "").trim();
        const recurrence = this.normalizeRecurrence(
            String(formData.get("recurrence") || "none"),
        );
        const recurrenceEnd =
            recurrence === "none"
                ? ""
                : this.normalizeDateValue(formData.get("recurrenceEnd"));

        if (!amount || amount <= 0) {
            this.showToast("Please enter a valid amount", "error");
            return null;
        }
        if (!description) {
            this.showToast("Please enter a description", "error");
            return null;
        }
        if (!category) {
            this.showToast("Please select a category", "error");
            return null;
        }
        if (!date) {
            this.showToast("Please select a date", "error");
            return null;
        }
        if (!paidBy) {
            this.showToast("Please enter who paid", "error");
            return null;
        }
        if (recurrence !== "none" && recurrenceEnd && recurrenceEnd < date) {
            this.showToast(this.t("invalidDateRange"), "error");
            return null;
        }

        const safeId =
            existingExpense?.id ||
            (typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now() + "-" + Math.random().toString(16).slice(2));
        const lastModifiedMs = Date.now();

        const baseExpense = {
            id: safeId,
            amount,
            description,
            category,
            date,
            paidBy,
            timestamp: existingExpense?.timestamp || new Date().toISOString(),
            lastModifiedMs,
            lastModified: new Date(lastModifiedMs).toISOString(),
            recurrence,
            recurrenceEnd,
            seriesId: existingExpense?.seriesId || safeId,
            generatedFromId: existingExpense?.generatedFromId || "",
            occurrenceDate: existingExpense?.occurrenceDate || "",
            excludedDates: existingExpense?.excludedDates || [],
            isRecurringTemplate: recurrence !== "none",
            isSeriesAnchorOnly: Boolean(existingExpense?.isSeriesAnchorOnly),
            isGeneratedRecurring: Boolean(existingExpense?.isGeneratedRecurring),
        };

        if (baseExpense.isRecurringTemplate) {
            baseExpense.generatedFromId = "";
            baseExpense.isGeneratedRecurring = false;
            baseExpense.seriesId = existingExpense?.seriesId || safeId;
        } else if (!baseExpense.isGeneratedRecurring) {
            baseExpense.generatedFromId = "";
        }

        return this.normalizeExpense(baseExpense);
    }

    showConfirmModal(expenseId) {
        const modal = document.getElementById("confirmModal");
        const confirmMessage = document.getElementById("confirmMessage");
        const confirmBtn = document.getElementById("confirmDelete");
        const cancelBtn = document.getElementById("cancelDelete");
        const closeBtn = document.getElementById("closeConfirm");
        const targetExpense = this.expenses.find((expense) => expense.id === expenseId);

        confirmMessage.textContent = this.t("deleteConfirm");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
        setTimeout(() => cancelBtn.focus(), 100);

        const handleConfirm = () => {
            const idsToDelete = this.collectExpenseIdsForDeletion(targetExpense);
            if (targetExpense?.isGeneratedRecurring) {
                this.excludeOccurrenceFromTemplate(targetExpense);
            }
            if (this.syncManager.isAuthenticated()) {
                idsToDelete.forEach((id) => this.syncManager.trackDelete(id));
            }

            const previousTotals = this.getCurrentMonthCategoryTotals();
            const deletionSet = new Set(idsToDelete);
            this.expenses = this.expenses.filter(
                (expense) => !deletionSet.has(String(expense.id)),
            );
            this.saveExpenses();
            this.showToast(this.t("expenseDeleted"));
            this.renderExpenseHistory();
            this.updateDashboard();
            this.setupFilters();
            this.hideConfirmModal();
            this.checkBudgetAlerts(previousTotals);
            cleanup();
        };

        const handleCancel = () => {
            this.hideConfirmModal();
            cleanup();
        };

        const cleanup = () => {
            confirmBtn.removeEventListener("click", handleConfirm);
            cancelBtn.removeEventListener("click", handleCancel);
            closeBtn.removeEventListener("click", handleCancel);
            modal.removeEventListener("click", handleBackdropClick);
            document.removeEventListener("keydown", handleKeydown);
        };

        const handleBackdropClick = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        const handleKeydown = (e) => {
            if (e.key === "Escape") {
                handleCancel();
            } else if (e.key === "Enter") {
                handleConfirm();
            }
        };

        confirmBtn.addEventListener("click", handleConfirm);
        cancelBtn.addEventListener("click", handleCancel);
        closeBtn.addEventListener("click", handleCancel);
        modal.addEventListener("click", handleBackdropClick);
        document.addEventListener("keydown", handleKeydown);
    }

    collectExpenseIdsForDeletion(expense) {
        if (!expense) {
            return [];
        }

        const ids = [String(expense.id)];
        if (expense.isRecurringTemplate) {
            this.expenses.forEach((candidate) => {
                if (String(candidate.generatedFromId) === String(expense.id)) {
                    ids.push(String(candidate.id));
                }
            });
        }
        return [...new Set(ids)];
    }

    removeGeneratedOccurrences(templateId, options = {}) {
        const removed = [];
        const fromDate = options.fromDate ? this.parseDateOnly(options.fromDate) : null;

        this.expenses = this.expenses.filter((expense) => {
            if (
                !expense.isGeneratedRecurring ||
                String(expense.generatedFromId) !== String(templateId)
            ) {
                return true;
            }

            if (fromDate) {
                const expenseDate = this.parseDateOnly(expense.date);
                if (expenseDate && expenseDate < fromDate) {
                    return true;
                }
            }

            removed.push(expense);
            return false;
        });

        if (options.trackDeletes && this.syncManager.isAuthenticated()) {
            removed.forEach((expense) => this.syncManager.trackDelete(expense.id));
        }
    }

    cleanupOrphanedRecurringExpenses() {
        const templateIds = new Set(
            this.expenses
                .filter((expense) => expense.isRecurringTemplate)
                .map((expense) => String(expense.id)),
        );

        const beforeCount = this.expenses.length;
        this.expenses = this.expenses.filter((expense) => {
            if (!expense.isGeneratedRecurring) {
                return true;
            }
            return templateIds.has(String(expense.generatedFromId));
        });
        return beforeCount !== this.expenses.length;
    }

    generateRecurringExpenses(options = {}) {
        const horizon = new Date();
        horizon.setDate(horizon.getDate() + RECURRENCE_HORIZON_DAYS);
        let changed = this.cleanupOrphanedRecurringExpenses();

        this.expenses
            .filter(
                (expense) =>
                    expense.isRecurringTemplate &&
                    this.normalizeRecurrence(expense.recurrence) !== "none",
            )
            .forEach((template) => {
                changed =
                    this.generateOccurrencesForTemplate(template, horizon) || changed;
            });

        if (changed && options.save !== false) {
            this.saveExpenses();
        }

        return changed;
    }

    generateOccurrencesForTemplate(template, horizonDate) {
        const startDate = this.parseDateOnly(template.date);
        if (!startDate) {
            return false;
        }

        const seriesEnd = template.recurrenceEnd
            ? this.parseDateOnly(template.recurrenceEnd)
            : null;
        const excludedDates = new Set(template.excludedDates || []);
        const maxDate =
            seriesEnd && seriesEnd < horizonDate ? seriesEnd : horizonDate;
        let occurrenceDate = this.addRecurrenceStep(startDate, template.recurrence);
        let changed = false;

        while (occurrenceDate && occurrenceDate <= maxDate) {
            const ymd = this.ymdFromDate(occurrenceDate);
            if (excludedDates.has(ymd)) {
                occurrenceDate = this.addRecurrenceStep(
                    occurrenceDate,
                    template.recurrence,
                );
                continue;
            }
            const exists = this.expenses.some(
                (expense) =>
                    String(expense.generatedFromId) === String(template.id) &&
                    this.getOccurrenceDate(expense) === ymd,
            );

            if (!exists) {
                this.expenses.push(this.createRecurringInstance(template, ymd));
                changed = true;
            }

            occurrenceDate = this.addRecurrenceStep(
                occurrenceDate,
                template.recurrence,
            );
        }

        return changed;
    }

    createRecurringInstance(template, date) {
        const id =
            typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now() + "-" + Math.random().toString(16).slice(2);
        const lastModifiedMs = Date.now();

        return this.normalizeExpense({
            ...template,
            id,
            date,
            timestamp: new Date().toISOString(),
            lastModifiedMs,
            lastModified: new Date(lastModifiedMs).toISOString(),
            recurrence: "none",
            recurrenceEnd: "",
            generatedFromId: String(template.id),
            occurrenceDate: date,
            seriesId: template.seriesId || String(template.id),
            isRecurringTemplate: false,
            isSeriesAnchorOnly: false,
            isGeneratedRecurring: true,
        });
    }

    addRecurrenceStep(date, recurrence) {
        const current = new Date(date);
        const day = current.getDate();

        switch (this.normalizeRecurrence(recurrence)) {
            case "daily":
                current.setDate(current.getDate() + 1);
                return current;
            case "weekly":
                current.setDate(current.getDate() + 7);
                return current;
            case "monthly": {
                current.setDate(1);
                current.setMonth(current.getMonth() + 1);
                const lastDay = new Date(
                    current.getFullYear(),
                    current.getMonth() + 1,
                    0,
                ).getDate();
                current.setDate(Math.min(day, lastDay));
                return current;
            }
            case "yearly": {
                const month = current.getMonth();
                current.setDate(1);
                current.setFullYear(current.getFullYear() + 1);
                current.setMonth(month);
                const lastDay = new Date(
                    current.getFullYear(),
                    current.getMonth() + 1,
                    0,
                ).getDate();
                current.setDate(Math.min(day, lastDay));
                return current;
            }
            default:
                return null;
        }
    }

    ymdFromDate(date) {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    normalizeDateValue(value) {
        const normalized = String(value || "").trim();
        return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
    }

    normalizeDateList(values) {
        if (!Array.isArray(values)) {
            return [];
        }

        const seen = new Set();
        return values
            .map((value) => this.normalizeDateValue(value))
            .filter((value) => value && !seen.has(value) && seen.add(value))
            .sort();
    }

    updateDashboard() {
        super.updateDashboard();
        this.renderBudgetOverview();
    }

    getAnalyticsExpenses() {
        const today = this.parseDateOnly(this.todayYmd());
        return this.getHistoryExpensesSource().filter((expense) => {
            const date = this.parseDateOnly(expense.date);
            return date && date <= today;
        });
    }

    updateStats() {
        const items = this.getAnalyticsExpenses();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyExpenses = items.filter((expense) => {
            const expenseDate = this.parseDateOnly(expense.date);
            return (
                expenseDate &&
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            );
        });
        const monthlyTotal = monthlyExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
        );

        const yearlyExpenses = items.filter((expense) => {
            const expenseDate = this.parseDateOnly(expense.date);
            return expenseDate && expenseDate.getFullYear() === currentYear;
        });
        const yearlyTotal = yearlyExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0,
        );

        const monthsWithExpenses = new Set();
        items.forEach((expense) => {
            const date = this.parseDateOnly(expense.date);
            if (date) {
                monthsWithExpenses.add(`${date.getFullYear()}-${date.getMonth()}`);
            }
        });

        const avgMonthly =
            monthsWithExpenses.size > 0
                ? items.reduce((sum, expense) => sum + expense.amount, 0) /
                  monthsWithExpenses.size
                : 0;

        document.getElementById("monthlyTotal").textContent =
            this.formatCurrency(monthlyTotal);
        document.getElementById("yearlyTotal").textContent =
            this.formatCurrency(yearlyTotal);
        document.getElementById("totalExpenses").textContent = items.length;
        document.getElementById("avgMonthly").textContent =
            this.formatCurrency(avgMonthly);
    }

    getExpensesForPeriod(period, chartType = "category") {
        const items = this.getAnalyticsExpenses();
        if (period === "custom") {
            const { from, to } =
                chartType === "member"
                    ? this.customMemberDateRange
                    : this.customDateRange;
            if (!from || !to) {
                return items;
            }
            const fromD = this.parseDateOnly(from);
            const toD = this.parseDateOnly(to);
            toD.setHours(23, 59, 59, 999);
            return items.filter((expense) => {
                const date = this.parseDateOnly(expense.date);
                return date >= fromD && date <= toD;
            });
        }
        if (period === "all") {
            return items;
        }
        const days = parseInt(period, 10);
        const cutoff = new Date();
        cutoff.setHours(0, 0, 0, 0);
        cutoff.setDate(cutoff.getDate() - days + 1);
        return items.filter((expense) => this.parseDateOnly(expense.date) >= cutoff);
    }

    renderTrendChart() {
        const ctx = document.getElementById("trendChart");
        if (!ctx) {
            return;
        }
        if (this.charts.trend) {
            this.charts.trend.destroy();
            this.charts.trend = null;
        }
        ctx.width = ctx.width;

        const monthlyData = {};
        this.getAnalyticsExpenses().forEach((expense) => {
            const date = this.parseDateOnly(expense.date);
            const monthKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1,
            ).padStart(2, "0")}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + expense.amount;
        });

        const sortedMonths = Object.keys(monthlyData).sort().slice(-12);
        const amounts = sortedMonths.map((month) => monthlyData[month]);
        if (sortedMonths.length === 0) {
            return;
        }

        this.charts.trend = new Chart(ctx.getContext("2d"), {
            type: "line",
            data: {
                labels: sortedMonths.map((month) => {
                    const [year, monthNum] = month.split("-");
                    return new Date(year, monthNum - 1).toLocaleDateString(
                        this.locale(),
                        {
                            month: "short",
                            year: "numeric",
                        },
                    );
                }),
                datasets: [
                    {
                        label: this.t("monthlySpendingTrend"),
                        data: amounts,
                        borderColor: "#667eea",
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value),
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => this.formatCurrency(context.parsed.y),
                        },
                    },
                },
            },
        });
    }

    renderDailyChart() {
        const ctx = document.getElementById("dailyChart");
        if (!ctx) {
            return;
        }
        if (this.charts.daily) {
            this.charts.daily.destroy();
            this.charts.daily = null;
        }
        ctx.width = ctx.width;

        const last30Days = [];
        const today = new Date();
        for (let index = 29; index >= 0; index -= 1) {
            const date = new Date(today);
            date.setDate(date.getDate() - index);
            last30Days.push(this.ymdFromDate(date));
        }

        const dailyData = {};
        last30Days.forEach((day) => {
            dailyData[day] = 0;
        });

        this.getAnalyticsExpenses().forEach((expense) => {
            if (Object.prototype.hasOwnProperty.call(dailyData, expense.date)) {
                dailyData[expense.date] += expense.amount;
            }
        });

        this.charts.daily = new Chart(ctx.getContext("2d"), {
            type: "bar",
            data: {
                labels: last30Days.map((date) => this.parseDateOnly(date).getDate()),
                datasets: [
                    {
                        label: this.t("dailySpending"),
                        data: Object.values(dailyData),
                        backgroundColor: "rgba(118, 75, 162, 0.8)",
                        borderColor: "#764ba2",
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value),
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: this.t("dailySpending"),
                        },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => this.formatCurrency(context.parsed.y),
                        },
                    },
                },
            },
        });
    }

    async performExport() {
        const modal = document.getElementById("exportModal");
        if (!modal) {
            console.error("Export modal not found");
            this.showToast("Export modal not found", "error");
            return;
        }

        const exportTypeElement = modal.querySelector(
            'input[name="exportType"]:checked',
        );
        if (!exportTypeElement) {
            console.error("Export type not selected");
            this.showToast("Please select an export type", "error");
            return;
        }

        const exportType = exportTypeElement.value;
        const data = {
            expenses: this.expenses,
            categories: this.getCategories(),
            customCategories: this.customCategories,
            monthlyBudgets: this.monthlyBudgets,
            language: this.currentLanguage,
            currency: this.currentCurrency,
            exportDate: new Date().toISOString(),
            version: "1.1",
        };

        let exportData;
        let filename;

        if (exportType === "encrypted") {
            const passwordElement = modal.querySelector("#exportPassword");
            const confirmPasswordElement = modal.querySelector(
                "#exportPasswordConfirm",
            );
            if (!passwordElement || !confirmPasswordElement) {
                console.error("Password fields not found in modal");
                this.showToast("Password fields not found", "error");
                return;
            }

            const password = passwordElement.value;
            const confirmPassword = confirmPasswordElement.value;
            if (!password) {
                this.showToast("Please enter a password", "error");
                return;
            }
            if (password !== confirmPassword) {
                this.showToast(this.t("passwordMismatch"), "error");
                return;
            }
            if (password.length < 8) {
                this.showToast(this.t("passwordTooShort"), "error");
                return;
            }

            try {
                exportData = await this.encryptData(data, password);
                filename = `family-expenses-encrypted-${
                    new Date().toISOString().split("T")[0]
                }.json`;
            } catch (error) {
                console.error("Encryption error:", error);
                this.showToast(
                    this.t("encryptionFailed") + ": " + error.message,
                    "error",
                );
                return;
            }
        } else {
            exportData = JSON.stringify(data, null, 2);
            filename = `family-expenses-${
                new Date().toISOString().split("T")[0]
            }.json`;
        }

        const blob = new Blob([exportData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        modal.remove();
        this.showToast(this.t("dataExported"));
    }

    async handlePlainImport(data) {
        const previousTotals = this.getCurrentMonthCategoryTotals();
        await super.handlePlainImport(data);

        this.expenses = this.expenses.map((expense) => this.normalizeExpense(expense));

        if (Array.isArray(data.customCategories)) {
            const existing = new Set(
                this.customCategories.map((category) => category.name),
            );
            data.customCategories.forEach((category) => {
                const name = String(category?.name || "").trim();
                const emoji = String(category?.emoji || "").trim() || "+";
                if (name && !existing.has(name)) {
                    existing.add(name);
                    this.customCategories.push({ name, emoji });
                }
            });
            super.saveCustomCategories();
        }

        if (data.monthlyBudgets && typeof data.monthlyBudgets === "object") {
            this.monthlyBudgets = {
                ...this.monthlyBudgets,
                ...this.normalizeBudgetMap(data.monthlyBudgets),
            };
            this.cleanupBudgetsForUnknownCategories();
        }

        this.generateRecurringExpenses({ save: true });
        this.renderCustomCategoryList();
        this.populateCategoryDropdown();
        this.populateEditCategoryDropdown();
        this.renderBudgetSettings();
        this.renderBudgetOverview();
        this.updateDashboard();
        this.renderExpenseHistory();
        this.setupFilters();
        this.checkBudgetAlerts(previousTotals);
    }

    async resolveSyncConflicts(conflicts, localSnapshot) {
        const normalizedConflicts = conflicts
            .map((conflict) => {
                const id = String(conflict?.id || conflict);
                const local =
                    conflict?.local ||
                    localSnapshot.get(id) ||
                    this.expenses.find((expense) => String(expense.id) === id);
                const server =
                    conflict?.server ||
                    this.expenses.find((expense) => String(expense.id) === id);

                if (!id || !local || !server) {
                    return null;
                }

                return {
                    id,
                    local: this.normalizeExpense(local),
                    server: this.normalizeExpense(server),
                };
            })
            .filter(Boolean);

        if (normalizedConflicts.length === 0) {
            return 0;
        }

        return new Promise((resolve) => {
            const modal = document.createElement("div");
            modal.className = "modal show conflict-resolution-modal";
            modal.innerHTML = `
                <div class="modal-content conflict-modal-content">
                    <div class="modal-header">
                        <h2>${this.t("syncConflictsTitle")}</h2>
                    </div>
                    <div class="modal-body">
                        <p class="conflict-modal-description">${this.t(
                            "syncConflictsDesc",
                        )}</p>
                        <div class="conflict-list"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" id="applyConflictSelections">${this.t(
                            "applySelections",
                        )}</button>
                    </div>
                </div>
            `;

            const list = modal.querySelector(".conflict-list");
            normalizedConflicts.forEach((conflict, index) => {
                const item = document.createElement("div");
                item.className = "conflict-item";

                const groupName = `conflict-choice-${index}`;
                item.innerHTML = `
                    <div class="conflict-item-header">
                        <strong>${this.escapeHtml(conflict.local.description)}</strong>
                        <span>${this.formatCurrency(conflict.local.amount)}</span>
                    </div>
                    <div class="conflict-columns">
                        ${this.renderConflictColumn(
                            conflict.local,
                            "local",
                            groupName,
                            this.t("localVersion"),
                            false,
                        )}
                        ${this.renderConflictColumn(
                            conflict.server,
                            "server",
                            groupName,
                            this.t("serverVersion"),
                            true,
                        )}
                    </div>
                `;
                list.appendChild(item);
            });

            const applyBtn = modal.querySelector("#applyConflictSelections");
            applyBtn.addEventListener("click", () => {
                let keptLocalCount = 0;
                const previousTotals = this.getCurrentMonthCategoryTotals();

                normalizedConflicts.forEach((conflict, index) => {
                    const selected = modal.querySelector(
                        `input[name="conflict-choice-${index}"]:checked`,
                    );
                    if (selected?.value !== "local") {
                        return;
                    }

                    keptLocalCount += 1;
                    const lastModifiedMs = Date.now() + keptLocalCount;
                    const localVersion = this.normalizeExpense({
                        ...conflict.local,
                        lastModifiedMs,
                        lastModified: new Date(lastModifiedMs).toISOString(),
                    });
                    this.upsertExpense(localVersion);
                });

                if (keptLocalCount > 0) {
                    this.generateRecurringExpenses({ save: false });
                    this.saveExpenses();
                    this.updateDashboard();
                    this.renderExpenseHistory();
                    this.setupFilters();
                    this.checkBudgetAlerts(previousTotals);
                }

                modal.remove();
                this.showToast(this.t("conflictsResolved"), "success");
                resolve(keptLocalCount);
            });

            document.body.appendChild(modal);
        });
    }

    renderConflictColumn(expense, value, groupName, title, checked) {
        const categoryLabel = this.getCategoryLabel(expense.category);
        const recurrenceLabel =
            expense.recurrence && expense.recurrence !== "none"
                ? `${this.t("repeatingLabel")}: ${this.getRecurrenceLabel(
                      expense.recurrence,
                  )}`
                : "";

        return `
            <label class="conflict-column">
                <div class="conflict-column-header">
                    <strong>${this.escapeHtml(title)}</strong>
                    <input type="radio" name="${groupName}" value="${value}" ${
            checked ? "checked" : ""
        }>
                </div>
                <div class="conflict-field"><span>${this.t(
                    "amount",
                )}</span><strong>${this.formatCurrency(expense.amount)}</strong></div>
                <div class="conflict-field"><span>${this.t(
                    "category",
                )}</span><strong>${this.escapeHtml(categoryLabel)}</strong></div>
                <div class="conflict-field"><span>${this.t(
                    "date",
                )}</span><strong>${this.escapeHtml(
                    this.formatDateForUI(expense.date),
                )}</strong></div>
                <div class="conflict-field"><span>${this.t(
                    "paidBy",
                )}</span><strong>${this.escapeHtml(expense.paidBy)}</strong></div>
                ${
                    recurrenceLabel
                        ? `<div class="conflict-field"><span>${this.t(
                              "recurrence",
                          )}</span><strong>${this.escapeHtml(
                              recurrenceLabel,
                          )}</strong></div>`
                        : ""
                }
            </label>
        `;
    }

    upsertExpense(expense) {
        const index = this.expenses.findIndex(
            (current) => String(current.id) === String(expense.id),
        );
        if (index >= 0) {
            this.expenses[index] = expense;
        } else {
            this.expenses.push(expense);
        }
    }

    getCategoryLabel(categoryValue) {
        const category = this.getCategories()[categoryValue];
        return category
            ? `${category.emoji} ${category.translations[this.currentLanguage]}`
            : categoryValue;
    }

    getRecurrenceLabel(recurrence) {
        const keyMap = {
            daily: "recurrenceDaily",
            weekly: "recurrenceWeekly",
            monthly: "recurrenceMonthly",
            yearly: "recurrenceYearly",
            none: "recurrenceNone",
        };
        return this.t(keyMap[this.normalizeRecurrence(recurrence)] || "recurrenceNone");
    }
}
