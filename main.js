import { ExpenseTracker } from "./modules/expense-tracker.js";

const tracker = new ExpenseTracker();

if (typeof window !== "undefined") {
    window.tracker = tracker;
}
