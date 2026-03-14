import {
    translations as baseTranslations,
    currencies,
} from "./base-translations.js";

const extraTranslations = {
    en: {
        monthlyBudgets: "Monthly Budgets",
        budgetSettingsHint: "Set monthly limits per category.",
        noBudgetsConfigured:
            "Set category budgets in Settings to track monthly progress.",
        budgetExceeded: "{category} exceeded its monthly budget.",
        spentLabel: "Spent",
        budgetLabel: "Budget",
        remainingLabel: "Remaining",
        recurrence: "Recurrence",
        recurrenceNone: "None",
        recurrenceDaily: "Daily",
        recurrenceWeekly: "Weekly",
        recurrenceMonthly: "Monthly",
        recurrenceYearly: "Yearly",
        recurrenceEnd: "Repeat Until",
        recurringExpense: "Recurring expense",
        repeatingLabel: "Repeats",
        syncConflictsTitle: "Resolve Sync Conflicts",
        syncConflictsDesc:
            "Choose which version to keep for each conflicting expense.",
        localVersion: "Local Version",
        serverVersion: "Server Version",
        keepLocal: "Keep Local",
        keepServer: "Keep Server",
        applySelections: "Apply Selections",
        conflictsResolved: "Conflict selections applied.",
        noCustomCategories: "No custom categories",
    },
    fr: {
        monthlyBudgets: "Budgets mensuels",
        budgetSettingsHint: "Definissez une limite mensuelle par categorie.",
        noBudgetsConfigured:
            "Definissez des budgets dans les parametres pour suivre le mois en cours.",
        budgetExceeded: "{category} a depasse son budget mensuel.",
        spentLabel: "Depense",
        budgetLabel: "Budget",
        remainingLabel: "Restant",
        recurrence: "Frequence",
        recurrenceNone: "Aucune",
        recurrenceDaily: "Quotidienne",
        recurrenceWeekly: "Hebdomadaire",
        recurrenceMonthly: "Mensuelle",
        recurrenceYearly: "Annuelle",
        recurrenceEnd: "Jusqu'au",
        recurringExpense: "Depense recurrente",
        repeatingLabel: "Frequence",
        syncConflictsTitle: "Resoudre les conflits de synchro",
        syncConflictsDesc:
            "Choisissez la version a conserver pour chaque depense en conflit.",
        localVersion: "Version locale",
        serverVersion: "Version serveur",
        keepLocal: "Garder locale",
        keepServer: "Garder serveur",
        applySelections: "Appliquer",
        conflictsResolved: "Les conflits ont ete traites.",
        noCustomCategories: "Aucune categorie personnalisee",
    },
    ja: {
        monthlyBudgets: "月別予算",
        budgetSettingsHint: "カテゴリごとの月間上限を設定します。",
        noBudgetsConfigured:
            "今月の進捗を表示するには設定でカテゴリ予算を追加してください。",
        budgetExceeded: "{category} は今月の予算を超えました。",
        spentLabel: "支出",
        budgetLabel: "予算",
        remainingLabel: "残り",
        recurrence: "繰り返し",
        recurrenceNone: "なし",
        recurrenceDaily: "毎日",
        recurrenceWeekly: "毎週",
        recurrenceMonthly: "毎月",
        recurrenceYearly: "毎年",
        recurrenceEnd: "終了日",
        recurringExpense: "定期支出",
        repeatingLabel: "繰り返し",
        syncConflictsTitle: "同期競合を解決",
        syncConflictsDesc: "競合した支出ごとに保持する版を選択してください。",
        localVersion: "ローカル版",
        serverVersion: "サーバー版",
        keepLocal: "ローカルを保持",
        keepServer: "サーバーを保持",
        applySelections: "適用",
        conflictsResolved: "競合の選択を適用しました。",
        noCustomCategories: "カスタムカテゴリはありません",
    },
};

const translations = {
    en: { ...baseTranslations.en, ...extraTranslations.en },
    fr: { ...baseTranslations.fr, ...extraTranslations.fr },
    ja: { ...baseTranslations.ja, ...extraTranslations.ja },
};

const recurrenceOptions = ["none", "daily", "weekly", "monthly", "yearly"];

export { currencies, recurrenceOptions, translations };
