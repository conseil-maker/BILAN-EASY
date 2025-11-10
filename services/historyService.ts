
import { HistoryItem } from "../types";

const HISTORY_KEY = 'skillsAssessmentHistory';

/**
 * Saves an assessment result to localStorage.
 * @param item The history item to save.
 */
export const saveAssessmentToHistory = (item: HistoryItem): void => {
  try {
    const history = getAssessmentHistory();
    history.unshift(item); // Add new item to the beginning
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save assessment to history:", error);
  }
};

/**
 * Retrieves all assessment results from localStorage.
 * @returns An array of history items.
 */
export const getAssessmentHistory = (): HistoryItem[] => {
  try {
    const historyJson = localStorage.getItem(HISTORY_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error("Failed to retrieve assessment history:", error);
    return [];
  }
};

/**
 * Clears the entire assessment history from localStorage.
 */
export const clearAssessmentHistory = (): void => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Failed to clear assessment history:", error);
    }
}
