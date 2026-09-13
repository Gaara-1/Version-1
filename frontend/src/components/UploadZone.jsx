import { useRef, useState } from 'react';
import { CloudUpload, FileImage, FileText } from 'lucide-react';
import { Icon } from './Icon';
export function UploadZone({ onFiles, label = 'Upload a document', multiple = false }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const choose = (files) => { if (files?.length)
        onFiles(Array.from(files)); };
    return <div data-testid="upload-zone" role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ')
        inputRef.current?.click(); }} onClick={() => inputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); choose(event.dataTransfer.files); }} className={`surface-quiet rounded-2xl border-2 border-dashed p-[clamp(1.25rem,3vw,2.4rem)] text-center transition-colors ${dragging ? 'border-slate-500 bg-slate-100' : 'border-slate-300 hover:border-slate-400 hover:bg-white/80'}`}>
    <input data-testid="input-document-upload" ref={inputRef} className="hidden" type="file" accept="image/*,.pdf,application/pdf" multiple={multiple} onChange={(event) => { choose(event.target.files); event.currentTarget.value = ''; }}/>
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e1e8ee] text-[#425365]"><CloudUpload size={22}/></div>
    <div className="font-display text-sm font-bold text-[#1b293a]">{label}</div>
    <div className="mt-1 text-xs text-slate-500">JPG, PNG or PDF · maximum 10 MB</div>
    <div className="mt-4 flex justify-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400"><FileImage size={13}/> Image <FileText size={13}/> PDF <Icon name="ScanLine" size={13}/> OCR</div>
  </div>;
}
