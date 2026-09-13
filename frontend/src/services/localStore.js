const HISTORY_KEY = 'zyid-local-history-v2';
const RECORDS_KEY = 'zyid-record-screening-v2';
function get(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key) ?? '');
    }
    catch {
        return fallback;
    }
}
function set(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    }
    catch { /* private browsing or quota */ }
}
export function loadHistory() { return get(HISTORY_KEY, []); }
export function saveHistory(entry) { const next = [entry, ...loadHistory().filter((item) => item.id !== entry.id)].slice(0, 50); set(HISTORY_KEY, next); return next; }
export function loadScreeningRecords() { return get(RECORDS_KEY, []); }
export function saveScreeningRecord(record) { const next = [record, ...loadScreeningRecords().filter((item) => item.id !== record.id)].slice(0, 25); set(RECORDS_KEY, next); return next; }
export function deleteScreeningRecord(id) { const next = loadScreeningRecords().filter((item) => item.id !== id); set(RECORDS_KEY, next); return next; }
export function clearLocalData() { try {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem(RECORDS_KEY);
}
catch { /* ignore */ } }
