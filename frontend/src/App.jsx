import { useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { WorkspaceShell } from '@/components/WorkspaceShell';
import { Landing } from '@/pages/Landing';
import { DashboardPage } from '@/pages/DashboardPage';
import { SmartScanPage } from '@/pages/SmartScanPage';
import { VerifyPage } from '@/pages/VerifyPage';
import { CyberIntelligencePage } from '@/pages/CyberIntelligencePage';
import { RecordScreeningPage } from '@/pages/RecordScreeningPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { asPdfDataUrl } from '@/services/reportService';
import { loadHistory, loadScreeningRecords, saveHistory, saveScreeningRecord } from '@/services/localStore';
import { classifyDocument } from '@/utils/documentRules';
const queryClient = new QueryClient();
function LocalApp() {
    const [entered, setEntered] = useState(false);
    const [view, setView] = useState('dashboard');
    const [selectedDocId, setSelectedDocId] = useState('aadhaar');
    const [history, setHistory] = useState(loadHistory);
    const [records, setRecords] = useState(loadScreeningRecords);
    const [latestResult, setLatestResult] = useState(null);
    const [scanPrefill, setScanPrefill] = useState(null);
    const [toast, setToast] = useState('');
    const notify = (message) => { setToast(message); window.setTimeout(() => setToast(''), 2600); };
    const stats = useMemo(() => ({ history, records }), [history, records]);
    const onComplete = (result) => {
        const now = new Date();
        const id = `VR-${Math.floor(2000 + Math.random() * 900)}`;
        const identityCode = `ZID-${Date.now().toString(36).toUpperCase()}`;
        const riskPercent = result.risk.level === 'LOW' ? 8 : result.risk.level === 'MEDIUM' ? 42 : result.risk.level === 'HIGH' ? 76 : 94;
        const entry = { ...result, id: `${identityCode}-${result.docId}`, caseId: id, identityCode, createdAt: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }), riskPercent };
        const nextHistory = saveHistory(entry);
        setHistory(nextHistory);
        setLatestResult(result);
        const record = { id: identityCode, identityCode, caseId: id, document: result.detected, sourceName: result.sourceName, status: result.status, risk: result.risk.level, riskPercent, createdAt: entry.createdAt, pdfDataUrl: asPdfDataUrl(entry) };
        setRecords(saveScreeningRecord(record));
        notify(`Verification saved as ${identityCode}`);
    };
    const useScanResult = (item) => { setSelectedDocId(item.docId); setScanPrefill({ previewUrl: item.previewUrl, fileName: item.file.name, rawText: item.text }); setView('verify'); notify(`${item.docName} routed to verification`); };
    const verifyBatch = (items) => { items.forEach((item) => onComplete({ ...classifyDocument(item.docId, item.text || item.file.name, item.file.name), previewUrl: item.previewUrl, fileType: item.file.type, pageCount: 1 })); notify(`${items.length} documents verified and stored locally`); };
    const clearLocal = () => { setHistory([]); setRecords([]); setLatestResult(null); };
    if (!entered)
        return <Landing onStart={() => setEntered(true)}/>;
    let page;
    if (view === 'dashboard')
        page = <DashboardPage history={stats.history} onView={setView} onSelectDoc={setSelectedDocId}/>;
    else if (view === 'smartscan')
        page = <SmartScanPage notify={notify} onUseResult={(item) => useScanResult(item)} onVerifyBatch={verifyBatch}/>;
    else if (view === 'verify')
        page = <VerifyPage selectedDocId={selectedDocId} onSelectDoc={setSelectedDocId} onComplete={onComplete} notify={notify} initialScan={scanPrefill}/>;
    else if (view === 'cyberintel')
        page = <CyberIntelligencePage source={latestResult} notify={notify}/>;
    else if (view === 'records')
        page = <RecordScreeningPage records={records} onRecords={setRecords} notify={notify}/>;
    else if (view === 'history')
        page = <HistoryPage history={history}/>;
    else if (view === 'reports')
        page = <ReportsPage history={history} notify={notify}/>;
    else if (view === 'integrations')
        page = <IntegrationsPage notify={notify}/>;
    else
        page = <SettingsPage notify={notify} onClear={clearLocal}/>;
    return <WorkspaceShell view={view} onView={setView}>{page}{toast && <div className="toast" data-testid="status-toast">{toast}</div>}</WorkspaceShell>;
}
function App() {
    return <QueryClientProvider client={queryClient}><TooltipProvider><LocalApp /><Toaster /></TooltipProvider></QueryClientProvider>;
}
export default App;
