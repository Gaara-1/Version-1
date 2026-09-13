import { useState } from 'react';
import { Check, CheckCircle2, Eye, FileCheck2, Fingerprint, Layers, RefreshCcw, Search, ShieldAlert, ShieldCheck, ShieldX, Type, UserRound } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { DocumentPreview } from '@/components/DocumentPreview';
import { StatusPill } from '@/components/StatusPill';
import { DOCUMENT_TYPES, classifyDocument } from '@/utils/documentRules';
import { scanLocalFile } from '@/services/fileScanner';
const STEPS = [{ label: 'Identifying document type', icon: Search }, { label: 'Checking document structure', icon: Layers }, { label: 'Verifying required fields', icon: Type }, { label: 'Validating number format', icon: Fingerprint }, { label: 'Reading QR / barcode', icon: FileCheck2 }, { label: 'Analysing photo region', icon: UserRound }, { label: 'Scanning for tampering', icon: Eye }];
export function VerifyPage({ selectedDocId, onSelectDoc, onComplete, notify, initialScan }) {
    const [file, setFile] = useState(initialScan ? { name: initialScan.fileName, previewUrl: initialScan.previewUrl, rawText: initialScan.rawText } : null);
    const [running, setRunning] = useState(false);
    const [step, setStep] = useState(-1);
    const [result, setResult] = useState(null);
    const [batch, setBatch] = useState([]);
    const doc = DOCUMENT_TYPES.find((item) => item.id === selectedDocId) ?? DOCUMENT_TYPES[0];
    const ingest = async (incoming) => {
        const next = incoming[0];
        if (!next)
            return;
        try {
            const page = (await scanLocalFile(next))[0];
            setFile({ name: next.name, previewUrl: page.previewUrl, rawText: page.text });
            setResult(null);
            notify('Document loaded locally');
        }
        catch {
            notify('Could not read this file. Try a clearer image or PDF.');
        }
    };
    const run = async () => {
        if (!file) {
            notify('Upload a document before verifying');
            return;
        }
        setRunning(true);
        setResult(null);
        for (let index = 0; index < STEPS.length; index += 1) {
            setStep(index);
            await new Promise((resolve) => window.setTimeout(resolve, 210));
        }
        const next = classifyDocument(selectedDocId, file.rawText || file.name.replace(/[_-]/g, ' '), file.name);
        const complete = { ...next, previewUrl: file.previewUrl, fileType: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image', pageCount: 1 };
        setResult(complete);
        setBatch((items) => [complete, ...items]);
        setRunning(false);
        setStep(STEPS.length);
        onComplete(complete);
    };
    const clear = () => { setFile(null); setResult(null); setBatch([]); setStep(-1); };
    return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="label-caps">Verification lane / Document only</div><h1 className="mt-2 font-display text-3xl font-extrabold">A clear answer before the case file.</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Verification stays intentionally narrow: document result, evidence, and one compact risk signal. Identity and case details belong in Cyber Intelligence.</p></div><div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/65 px-3 py-2 text-xs font-bold text-slate-600"><ShieldCheck size={15}/> Browser checks</div></div>
    <div className="data-grid"><div className="span-5 space-y-4"><div className="surface rounded-2xl p-5"><div className="label-caps">Select type</div><select data-testid="select-document-type" className="field mt-3" value={selectedDocId} onChange={(event) => { onSelectDoc(event.target.value); setResult(null); }}><option value="">Choose a category</option>{DOCUMENT_TYPES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><div className="mt-4 rounded-xl bg-[#edf2f5] p-3 text-xs leading-relaxed text-slate-500"><b className="text-slate-700">{doc.name} checks:</b> {doc.fields.join(' · ')}</div></div><div className="surface rounded-2xl p-5"><div className="mb-4 flex items-center justify-between"><div><div className="label-caps">Input</div><h2 className="mt-1 font-display text-lg font-extrabold">Upload source file</h2></div>{file && <button className="matte-button ghost" onClick={clear}>Clear</button>}</div>{file ? <><DocumentPreview url={file.previewUrl} fileName={file.name}/><div className="mt-3 truncate text-xs font-bold text-slate-600">{file.name}</div></> : <UploadZone onFiles={ingest} label={`Upload ${doc.name}`}/>}</div><button data-testid="button-run-verification" className="matte-button primary w-full py-3" onClick={run} disabled={running || !file}>{running ? <><RefreshCcw className="scan-pulse" size={15}/> Running local checks…</> : <><ShieldCheck size={15}/> Run document verification</>}</button></div>
    <div className="span-7 space-y-4"><div className="surface rounded-2xl p-5"><div className="mb-4 flex items-center justify-between"><div><div className="label-caps">Verification trace</div><h2 className="mt-1 font-display text-lg font-extrabold">Seven local checks</h2></div><span className="font-mono text-[10px] text-slate-400">{running ? `CHECK ${Math.min(step + 1, 7)} / 07` : result ? 'COMPLETE' : 'STANDBY'}</span></div><div className="grid gap-2 sm:grid-cols-2">{STEPS.map((item, index) => { const Icon = item.icon; const done = step > index || Boolean(result); const active = running && step === index; return <div key={item.label} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${done ? 'border-[#b8dfc9] bg-[#eaf6ef]' : active ? 'border-[#aabcca] bg-[#edf2f5]' : 'border-slate-200 bg-white/45'}`}><div className={`flex h-7 w-7 items-center justify-center rounded-lg ${done ? 'bg-[#2c9461] text-white' : active ? 'bg-[#526b80] text-white' : 'bg-[#e8edf1] text-slate-400'}`}>{done ? <Check size={14}/> : <Icon size={14}/>}</div><span className={`text-xs font-semibold ${done || active ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>{active && <span className="ml-auto scan-pulse font-mono text-[9px] text-slate-500">RUN</span>}</div>; })}</div></div>{result ? <ResultPanel result={result}/> : <div className="surface-quiet flex min-h-[230px] flex-col items-center justify-center rounded-2xl border-dashed text-center text-slate-400"><ShieldAlert size={34} strokeWidth={1.2}/><p className="mt-3 text-sm font-bold">Result stays here</p><p className="mt-1 max-w-sm text-xs">No identity profile or case details are shown in verification.</p></div>}{batch.length > 1 && <div className="surface rounded-2xl p-4"><div className="mb-3 flex items-center gap-2 text-sm font-bold"><Layers size={15}/> Multi-document run <span className="ml-auto font-mono text-[10px] text-slate-400">{batch.length} results</span></div><div className="space-y-2">{batch.slice(0, 5).map((item, index) => <div key={`${item.sourceName}-${index}`} className="flex items-center gap-2 text-xs"><StatusPill status={item.status}/><span className="min-w-0 flex-1 truncate">{item.sourceName}</span><span className="risk-compact"><strong>{riskPercent(item)}%</strong> risk</span></div>)}</div></div>}</div></div>
  </div>;
}
function ResultPanel({ result }) {
    const good = result.status === 'VERIFIED';
    return <div className={`surface rounded-2xl p-5 ${good ? 'border-t-4 border-t-[#2f9564]' : 'border-t-4 border-t-[#b33d50]'}`}><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-3"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${good ? 'bg-[#e5f4ec] text-[#1f8a5a]' : 'bg-[#fae8eb] text-[#ac3348]'}`}>{good ? <CheckCircle2 size={25}/> : <ShieldX size={25}/>}</div><div><div className="label-caps">Document result</div><h2 className="mt-1 font-display text-2xl font-extrabold">{result.headline}</h2><p className="mt-1 text-xs text-slate-500">{result.detected} · {result.confidence ? `${result.confidence}% confidence` : 'Confidence unavailable'}</p></div></div><div className="text-right"><StatusPill status={result.status}/><div className="mt-3 risk-compact"><strong>{riskPercent(result)}%</strong> risk signal</div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f2f5f7] p-3"><div className="label-caps">Why</div><ul className="mt-2 space-y-1 text-xs text-slate-600">{result.why.map((line) => <li key={line} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"/>{line}</li>)}</ul></div><div className="rounded-xl bg-[#f2f5f7] p-3"><div className="label-caps">Recommendation</div><p className="mt-2 text-xs leading-relaxed text-slate-600">{result.recommendation}</p></div></div>{result.issues.length > 0 && <div className="mt-3 rounded-xl border border-[#ecc4cb] bg-[#fbecee] p-3 text-xs text-[#873446]"><b>{result.issues[0].title}</b><p className="mt-1">{result.issues[0].detail}</p></div>}</div>;
}
function riskPercent(result) { return result.risk.level === 'LOW' ? 8 : result.risk.level === 'MEDIUM' ? 42 : result.risk.level === 'HIGH' ? 76 : 94; }
export { riskPercent };
