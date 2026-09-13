import { useState } from 'react';
import { Camera, Check, FileStack, RefreshCcw, ScanLine, Trash2 } from 'lucide-react';
import { UploadZone } from '@/components/UploadZone';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Icon } from '@/components/Icon';
import { detectDocumentType } from '@/utils/documentRules';
import { scanLocalFile } from '@/services/fileScanner';
export function SmartScanPage({ onUseResult, onVerifyBatch, notify }) {
    const [queue, setQueue] = useState([]);
    const [results, setResults] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const scan = async (files) => {
        const valid = files.filter((file) => file.type.startsWith('image/') || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
        if (!valid.length) {
            notify('Only image and PDF files can be scanned');
            return;
        }
        setQueue(valid);
        setResults([]);
        setScanning(true);
        const all = [];
        for (let index = 0; index < valid.length; index += 1) {
            const file = valid[index];
            try {
                const pages = await scanLocalFile(file, (value) => setProgress(Math.round(((index + value / 100) / valid.length) * 100)));
                for (const page of pages) {
                    const detected = detectDocumentType(page.text, file.name);
                    all.push({ id: `${file.name}-${page.page}`, file, previewUrl: page.previewUrl, text: page.text, docId: detected.doc.id, docName: detected.doc.name, confidence: detected.confidence, review: detected.review });
                }
            }
            catch {
                all.push({ id: `${file.name}-error`, file, previewUrl: '', text: '', docId: 'other', docName: 'Unreadable document', confidence: 0, review: true });
            }
            setResults([...all]);
            setProgress(Math.round(((index + 1) / valid.length) * 100));
        }
        setScanning(false);
        notify(`${all.length} page${all.length === 1 ? '' : 's'} classified locally`);
    };
    const active = results[0];
    return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="label-caps">Universal intake / OCR</div><h1 className="mt-2 font-display text-3xl font-extrabold">Let the document tell you where it belongs.</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Upload a mixed batch. ZyID reads available text locally, classifies each page, and lets you send a selected result to verification.</p></div><button className="matte-button secondary" onClick={() => notify('Camera capture is available when this browser grants camera permission')}><Camera size={15}/> Camera capture</button></div>
    <div className="data-grid"><div className="span-5 surface rounded-2xl p-5"><div className="mb-4 flex items-center justify-between"><div><div className="label-caps">Step 01</div><h2 className="mt-1 font-display text-lg font-extrabold">Add files</h2></div><FileStack className="text-slate-400" size={21}/></div><UploadZone onFiles={scan} label="Drop files to classify" multiple/><div className="mt-4 rounded-xl bg-[#edf2f5] p-3 text-xs leading-relaxed text-slate-500"><b className="text-slate-700">Browser OCR note.</b> Image OCR runs only when a local Tesseract runtime is present. PDFs remain previewable and are never uploaded.</div>{queue.length > 0 && <div className="mt-4 space-y-2">{queue.map((file) => <div key={`${file.name}-${file.size}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs"><Icon name={file.type.includes('pdf') ? 'FileText' : 'FileImage'} size={14} className="text-slate-400"/><span className="min-w-0 flex-1 truncate font-semibold">{file.name}</span><button className="text-slate-400 hover:text-rose-600" onClick={() => { setQueue((items) => items.filter((item) => item !== file)); setResults([]); }} aria-label={`Remove ${file.name}`}><Trash2 size={14}/></button></div>)}</div>}</div>
    <div className="span-7 surface rounded-2xl p-5"><div className="flex items-center justify-between"><div><div className="label-caps">Step 02</div><h2 className="mt-1 font-display text-lg font-extrabold">Classification results</h2></div>{scanning && <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500"><RefreshCcw className="scan-pulse" size={13}/> {progress}%</div>}</div>{scanning && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#536b80] transition-all" style={{ width: `${progress}%` }}/></div>}{results.length === 0 && !scanning ? <div className="flex min-h-[310px] flex-col items-center justify-center text-center text-slate-400"><ScanLine size={34} strokeWidth={1.2}/><p className="mt-3 text-sm font-semibold">Your classified pages will appear here</p><p className="mt-1 max-w-xs text-xs">Use an image with visible document text for the strongest result.</p></div> : <div className="mt-5 space-y-3">{results.map((item) => <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 bg-[#f8fafb] p-3 sm:grid-cols-[100px_1fr_auto] sm:items-center"><DocumentPreview url={item.previewUrl} fileName={item.file.name} compact/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">{item.docName}</span>{item.review ? <span className="status-pill review">Review</span> : <span className="status-pill verified">Match</span>}</div><div className="mt-1 truncate text-xs text-slate-500">{item.file.name}</div><div className="mt-2 font-mono text-[10px] text-slate-400">CLASSIFICATION CONFIDENCE <b className="text-slate-600">{item.confidence}%</b></div></div><button data-testid={`button-use-scan-${item.id}`} className="matte-button primary" onClick={() => onUseResult(item, results)}><Check size={14}/> Use result</button></div>)}</div>}</div></div>
    {active && <div className="surface rounded-2xl border-l-4 border-l-[#627c90] p-4 text-xs text-slate-500">Selected classification: <b className="text-slate-700">{active.docName}</b>. Verification will show the document result and compact risk only; identity and case details remain in Cyber Intelligence.{results.length > 1 && <button className="matte-button primary ml-3" onClick={() => onVerifyBatch?.(results)}><Check size={14}/> Verify all {results.length} pages</button>}</div>}
  </div>;
}
