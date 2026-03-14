import assert from "node:assert/strict";

import { ExpenseTracker } from "../../modules/expense-tracker.js";

function addDays(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
}

function ymd(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function isoAtNoon(date) {
    return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0),
    ).toISOString();
}

function buildExpense(id, date, overrides = {}) {
    return {
        id,
        amount: 25,
        description: "Recurring expense",
        category: "Housing",
        date,
        paidBy: "Alice",
        timestamp: isoAtNoon(new Date()),
        lastModifiedMs: Date.now(),
        lastModified: new Date().toISOString(),
        seriesId: "template-1",
        generatedFromId: "",
        occurrenceDate: "",
        excludedDates: [],
        recurrence: "none",
        recurrenceEnd: "",
        isRecurringTemplate: false,
        isSeriesAnchorOnly: false,
        isGeneratedRecurring: false,
        ...overrides,
    };
}

function createTracker(expenses) {
    const tracker = Object.create(ExpenseTracker.prototype);
    tracker.expenses = expenses.map((expense) => tracker.normalizeExpense(expense));
    tracker.saveExpenses = () => {
        tracker.saved = true;
    };
    return tracker;
}

const today = new Date();
const templateDate = ymd(addDays(today, -2));
const excludedDate = ymd(addDays(today, -1));
const validDate = ymd(today);
const invalidFutureDate = ymd(addDays(today, 1));

const tracker = createTracker([
    buildExpense("template-1", templateDate, {
        recurrence: "daily",
        recurrenceEnd: validDate,
        isRecurringTemplate: true,
        isSeriesAnchorOnly: true,
        excludedDates: [excludedDate],
    }),
    buildExpense("generated-excluded", excludedDate, {
        generatedFromId: "template-1",
        occurrenceDate: excludedDate,
        isGeneratedRecurring: true,
    }),
    buildExpense("generated-after-end", invalidFutureDate, {
        generatedFromId: "template-1",
        occurrenceDate: invalidFutureDate,
        isGeneratedRecurring: true,
    }),
]);

const changed = tracker.generateRecurringExpenses({ save: false });
const generatedDates = tracker.expenses
    .filter(
        (expense) =>
            expense.isGeneratedRecurring &&
            String(expense.generatedFromId) === "template-1",
    )
    .map((expense) => expense.occurrenceDate)
    .sort();

assert.equal(changed, true);
assert.deepEqual(generatedDates, [validDate]);

console.log("PASS recurring_generation_prunes_invalid_instances");
