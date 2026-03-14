export class BaseSyncManager {
    constructor(tracker) {
        this.tracker = tracker;
        this.apiBaseUrl = this.resolveApiBaseUrl();
        this.authToken = localStorage.getItem("syncAuthToken");
        this.userEmail = localStorage.getItem("syncUserEmail");
        this.lastSyncTimeMs = this.loadLastSyncTimeMs();
        this.pendingDeletes = this.loadPendingDeletes();
        this.isSyncing = false;
        this.autoSyncInterval = null;
    }
    resolveApiBaseUrl() {
        const metaBase =
            document
            .querySelector('meta[name="expense-api-base"]')
            ?.content?.trim() || "";
        const windowBase =
            typeof window.EXPENSE_API_BASE === "string" ?
            window.EXPENSE_API_BASE.trim() :
            "";
        const configured = metaBase || windowBase;
        const base = new URL(configured || "./api/", window.location.href).href;
        return base.replace(/\/$/, "");
    }
    loadLastSyncTimeMs() {
        const direct = Number(localStorage.getItem("lastSyncTimeMs"));
        if (Number.isFinite(direct) && direct > 0) {
            return Math.round(direct);
        }
        const legacy = localStorage.getItem("lastSyncTime");
        if (legacy) {
            const parsed = Date.parse(legacy);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
        return 0;
    }
    saveLastSyncTimeMs(value) {
        const ms = Math.max(0, Math.round(Number(value) || 0));
        this.lastSyncTimeMs = ms;
        localStorage.setItem("lastSyncTimeMs", String(ms));
        localStorage.removeItem("lastSyncTime");
    }
    loadPendingDeletes() {
        try {
            const saved = localStorage.getItem("pendingDeletes");
            const parsed = saved ? JSON.parse(saved) : [];
            if (!Array.isArray(parsed)) return [];
            return [...new Set(parsed.map((v) => String(v)).filter(Boolean))];
        } catch {
            return [];
        }
    }
    savePendingDeletes() {
        localStorage.setItem("pendingDeletes", JSON.stringify(this.pendingDeletes));
    }
    isAuthenticated() {
        return !!this.authToken && !!this.userEmail;
    }
    async requestJson(path, options = {}) {
        const response = await fetch(`${this.apiBaseUrl}/${path}`, options);
        const text = await response.text();
        let payload = {};
        if (text) {
            try {
                payload = JSON.parse(text);
            } catch {
                payload = {};
            }
        }
        if (!response.ok) {
            const error = new Error(
                payload.error || `Request failed (${response.status})`,
            );
            error.status = response.status;
            throw error;
        }
        return payload.data;
    }
    async requestOTP(email) {
        return this.requestJson("auth.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "request_otp",
                email
            }),
        });
    }
    async verifyOTP(email, otp) {
        const data = await this.requestJson("auth.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action: "verify_otp",
                email,
                otp
            }),
        });
        this.authToken = data.token;
        this.userEmail = email;
        localStorage.setItem("syncAuthToken", this.authToken);
        localStorage.setItem("syncUserEmail", email);
        if (data.user?.settings) {
            if (data.user.settings.language) {
                this.tracker.setLanguage(data.user.settings.language);
            }
            if (data.user.settings.currency) {
                this.tracker.setCurrency(data.user.settings.currency);
            }
        }
        return data;
    }
    async logoutRemote() {
        if (!this.authToken) {
            return;
        }
        try {
            await this.requestJson("auth.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.authToken}`,
                },
                body: JSON.stringify({
                    action: "logout"
                }),
            });
        } catch (error) {
            console.warn("Remote logout failed:", error);
        }
    }
    logout() {
        this.authToken = null;
        this.userEmail = null;
        this.lastSyncTimeMs = 0;
        this.pendingDeletes = [];
        localStorage.removeItem("syncAuthToken");
        localStorage.removeItem("syncUserEmail");
        localStorage.removeItem("lastSyncTimeMs");
        localStorage.removeItem("lastSyncTime");
        localStorage.removeItem("pendingDeletes");
        this.stopAutoSync();
        this.updateSyncUI();
    }
    normalizeExpenseForSync(expense) {
        const timestamp =
            typeof expense.timestamp === "string" && expense.timestamp ?
            expense.timestamp :
            new Date().toISOString();
        const lastModifiedMs = this.tracker.parseTimestampMs(
            expense.lastModifiedMs ?? expense.lastModified ?? timestamp,
        );
        return {
            id: String(expense.id),
            amount: Number(expense.amount) || 0,
            description: String(expense.description || ""),
            category: String(expense.category || "Other"),
            date: String(expense.date || this.tracker.todayYmd()),
            paidBy: String(expense.paidBy || "Unknown"),
            timestamp,
            lastModifiedMs,
            lastModified: new Date(lastModifiedMs).toISOString(),
        };
    }
    async sync() {
        if (this.isSyncing) {
            return;
        }
        if (!this.isAuthenticated()) {
            throw new Error("Not authenticated");
        }
        this.isSyncing = true;
        this.updateSyncUI("syncing");
        try {
            const clientExpenses = this.tracker.expenses
                .filter((expense) => {
                    if (!this.lastSyncTimeMs) return true;
                    const modMs = this.tracker.parseTimestampMs(
                        expense.lastModifiedMs ?? expense.lastModified ?? expense.timestamp,
                    );
                    return modMs > this.lastSyncTimeMs;
                })
                .map((expense) => this.normalizeExpenseForSync(expense));
            const data = await this.requestJson("sync.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.authToken}`,
                },
                body: JSON.stringify({
                    expenses: clientExpenses,
                    lastSyncTimeMs: this.lastSyncTimeMs || null,
                    deletedIds: this.pendingDeletes,
                }),
            });
            this.applyServerChanges(
                data.serverChanges || [],
                data.serverDeleted || [],
            );
            this.pendingDeletes = [];
            this.savePendingDeletes();
            const syncTimeMs = Number(data.syncTimeMs) || Date.now();
            this.saveLastSyncTimeMs(syncTimeMs);
            if (Array.isArray(data.conflicts) && data.conflicts.length > 0) {
                this.tracker.showToast(
                    `Sync completed with ${data.conflicts.length} conflict(s). Server version kept.`,
                    "warning",
                );
            } else {
                this.tracker.showToast(
                    this.tracker.t("syncSuccess") || "Sync completed successfully!",
                );
            }
            this.updateSyncUI("synced");
            this.tracker.updateDashboard();
            this.tracker.renderExpenseHistory();
            this.tracker.setupFilters();
            return data;
        } catch (error) {
            if (error?.status === 401) {
                await this.logoutRemote();
                this.logout();
                throw new Error("Authentication expired. Please login again.");
            }
            this.updateSyncUI("error");
            throw error;
        } finally {
            this.isSyncing = false;
        }
    }
    applyServerChanges(serverChanges, serverDeleted) {
        const localExpenseMap = new Map(
            this.tracker.expenses.map((e) => [String(e.id), e]),
        );
        const deletedSet = new Set((serverDeleted || []).map((id) => String(id)));
        if (deletedSet.size > 0) {
            this.tracker.expenses = this.tracker.expenses.filter(
                (e) => !deletedSet.has(String(e.id)),
            );
        }
        (serverChanges || []).forEach((serverExpenseRaw) => {
            const serverExpense = this.normalizeExpenseForSync(serverExpenseRaw);
            const localExpense = localExpenseMap.get(serverExpense.id);
            if (localExpense) {
                const localModifiedMs = this.tracker.parseTimestampMs(
                    localExpense.lastModifiedMs ??
                    localExpense.lastModified ??
                    localExpense.timestamp,
                );
                if (serverExpense.lastModifiedMs > localModifiedMs) {
                    Object.assign(localExpense, serverExpense);
                }
            } else {
                this.tracker.expenses.push(serverExpense);
            }
        });
        this.tracker.saveExpenses();
    }
    trackDelete(expenseId) {
        const normalized = String(expenseId || "");
        if (!normalized) {
            return;
        }
        if (!this.pendingDeletes.includes(normalized)) {
            this.pendingDeletes.push(normalized);
            this.savePendingDeletes();
        }
    }
    startAutoSync(intervalMinutes = 5) {
        this.stopAutoSync();
        this.autoSyncInterval = setInterval(
            () => {
                if (this.isAuthenticated() && !this.isSyncing) {
                    this.sync().catch((error) => {
                        console.error("Auto-sync failed:", error);
                    });
                }
            },
            intervalMinutes * 60 * 1000,
        );
    }
    stopAutoSync() {
        if (this.autoSyncInterval) {
            clearInterval(this.autoSyncInterval);
            this.autoSyncInterval = null;
        }
    }
    formatLastSyncLabel() {
        if (!this.lastSyncTimeMs) {
            return "Never synced";
        }
        const lastSync = new Date(this.lastSyncTimeMs);
        return `Last sync: ${lastSync.toLocaleTimeString()}`;
    }
    updateSyncUI(status = null) {
        const syncBtn = document.getElementById("syncBtn");
        const syncStatus = document.getElementById("syncStatus");
        const logoutBtn = document.getElementById("syncLogoutBtn");
        if (!syncBtn) return;
        if (!this.isAuthenticated()) {
            syncBtn.textContent = "L";
            syncBtn.title = "Login to sync";
            if (syncStatus) {
                syncStatus.textContent = "Not logged in";
                syncStatus.className = "sync-status offline";
            }
            if (logoutBtn) {
                logoutBtn.style.display = "none";
            }
            return;
        }
        if (logoutBtn) {
            logoutBtn.style.display = "inline-flex";
            logoutBtn.textContent = this.tracker.t("syncLogout") || "Logout";
        }
        switch (status) {
            case "syncing":
                syncBtn.textContent = "...";
                syncBtn.classList.add("syncing");
                if (syncStatus) {
                    syncStatus.textContent = "Syncing...";
                    syncStatus.className = "sync-status syncing";
                }
                break;
            case "synced":
                syncBtn.textContent = "OK";
                syncBtn.classList.remove("syncing");
                if (syncStatus) {
                    syncStatus.textContent = this.formatLastSyncLabel();
                    syncStatus.className = "sync-status synced";
                }
                break;
            case "error":
                syncBtn.textContent = "!";
                syncBtn.classList.remove("syncing");
                if (syncStatus) {
                    syncStatus.textContent = "Sync failed";
                    syncStatus.className = "sync-status error";
                }
                break;
            default:
                syncBtn.textContent = "S";
                syncBtn.classList.remove("syncing");
                if (syncStatus) {
                    syncStatus.textContent = this.formatLastSyncLabel();
                    syncStatus.className = "sync-status";
                }
                break;
        }
    }
}
