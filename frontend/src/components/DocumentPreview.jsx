import { FileText, Image as ImageIcon } from 'lucide-react';
export function DocumentPreview({ url, fileName, compact = false }) {
    const pdf = fileName?.toLowerCase().endsWith('.pdf') || url?.startsWith('data:application/pdf');
    if (!url) {
        return <div className={`document-preview ${compact ? 'min-h-24' : 'min-h-60'} rounded-xl text-slate-400`}><FileText size={30}/><span className="text-xs">No preview</span></div>;
    }
    return <div className={`document-preview rounded-xl ${compact ? 'h-28' : 'min-h-[280px] h-[clamp(280px,44vh,520px)]'}`}>
    {pdf ? <iframe title={`Preview of ${fileName ?? 'PDF document'}`} src={url}/> : <img src={url} alt={`Preview of ${fileName ?? 'uploaded document'}`}/>}
    <span className="absolute hidden" aria-hidden="true">{pdf ? <FileText /> : <ImageIcon />}</span>
  </div>;
}
