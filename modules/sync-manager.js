import { BaseSyncManager } from "./base-sync-manager.js";

function deepClone(value) {
    if (typeof structuredClone === "function") {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
}

export class SyncManager extends BaseSyncManager {
    normalizeExpenseForSync(expense) {
        const normalized = super.normalizeExpenseForSync(expense);
        return {
            ...normalized,
            recurrence: this.tracker.normalizeRecurrence(
                expense.recurrence || "none",
            ),
            recurrenceEnd:
                typeof expense.recurrenceEnd === "string"
                    ? expense.recurrenceEnd
                    : "",
            seriesId: expense.seriesId ? String(expense.seriesId) : "",
            generatedFromId: expense.generatedFromId
                ? String(expense.generatedFromId)
                : "",
            isRecurringTemplate: Boolean(expense.isRecurringTemplate),
            isGeneratedRecurring: Boolean(expense.isGeneratedRecurring),
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
            const localSnapshot = new Map(
                this.tracker.expenses.map((expense) => [
                    String(expense.id),
                    deepClone(expense),
                ]),
            );

            const previousTotals = this.tracker.getCurrentMonthCategoryTotals();
            const clientExpenses = this.tracker.expenses
                .filter((expense) => {
                    if (!this.lastSyncTimeMs) {
                        return true;
                    }
                    const modMs = this.tracker.parseTimestampMs(
                        expense.lastModifiedMs ??
                            expense.lastModified ??
                            expense.timestamp,
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
                    settings: this.tracker.buildSyncSettings(),
                }),
            });

            this.applyServerChanges(
                data.serverChanges || [],
                data.serverDeleted || [],
            );

            if (data.settings) {
                this.tracker.applyRemoteSettings(data.settings);
            }

            this.pendingDeletes = [];
            this.savePendingDeletes();

            const syncTimeMs = Number(data.syncTimeMs) || Date.now();
            this.saveLastSyncTimeMs(syncTimeMs);

            let keptLocalCount = 0;
            if (Array.isArray(data.conflicts) && data.conflicts.length > 0) {
                keptLocalCount = await this.tracker.resolveSyncConflicts(
                    data.conflicts,
                    localSnapshot,
                );
            } else {
                this.tracker.showToast(
                    this.tracker.t("syncSuccess") ||
                        "Sync completed successfully!",
                );
            }

            this.updateSyncUI("synced");
            this.tracker.updateDashboard();
            this.tracker.renderExpenseHistory();
            this.tracker.setupFilters();
            this.tracker.checkBudgetAlerts(previousTotals);

            if (keptLocalCount > 0) {
                setTimeout(() => {
                    this.sync().catch((error) => {
                        console.error("Follow-up sync failed:", error);
                    });
                }, 0);
            }

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
        super.applyServerChanges(serverChanges, serverDeleted);
        this.tracker.cleanupOrphanedRecurringExpenses();
        this.tracker.generateRecurringExpenses({ save: true });
    }
}
