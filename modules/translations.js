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
        editRecurringTitle: "Edit Recurring Expense",
        editRecurringDesc:
            "Choose whether to update only this occurrence or the recurring series.",
        editThisOccurrence: "Edit This Occurrence",
        editThisOccurrenceDesc:
            "Change only the selected expense. Future recurring entries stay the same.",
        editWholeSeries: "Edit Whole Series",
        editWholeSeriesDesc:
            "Update the recurring template and regenerate upcoming occurrences.",
        seriesUnavailable: "Recurring series not found.",
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
        editRecurringTitle: "Modifier la depense recurrente",
        editRecurringDesc:
            "Choisissez entre cette occurrence et toute la serie recurrente.",
        editThisOccurrence: "Modifier cette occurrence",
        editThisOccurrenceDesc:
            "Modifie seulement la depense selectionnee. Les prochaines occurrences restent inchangees.",
        editWholeSeries: "Modifier toute la serie",
        editWholeSeriesDesc:
            "Met a jour le modele recurrent et regenere les prochaines occurrences.",
        seriesUnavailable: "Serie recurrente introuvable.",
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
        editRecurringTitle: "定期支出を編集",
        editRecurringDesc:
            "この支出だけを変更するか、定期シリーズ全体を変更するかを選択してください。",
        editThisOccurrence: "この支出だけ編集",
        editThisOccurrenceDesc:
            "選択した支出だけを変更します。今後の定期支出はそのままです。",
        editWholeSeries: "シリーズ全体を編集",
        editWholeSeriesDesc:
            "定期テンプレートを更新し、今後の支出を再生成します。",
        seriesUnavailable: "定期シリーズが見つかりません。",
    },
};

const translations = {
    en: { ...baseTranslations.en, ...extraTranslations.en },
    fr: { ...baseTranslations.fr, ...extraTranslations.fr },
    ja: { ...baseTranslations.ja, ...extraTranslations.ja },
};

const recurrenceOptions = ["none", "daily", "weekly", "monthly", "yearly"];

export { currencies, recurrenceOptions, translations };
