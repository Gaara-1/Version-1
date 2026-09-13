export function reportHtml(entry) {
    const name = 'document' in entry ? entry.document : entry.detected;
    return `<!doctype html><html><head><meta charset="utf-8"><title>ZyID Verification Report</title><style>body{font:14px Arial;color:#182333;padding:40px}h1{font-size:24px}table{border-collapse:collapse;width:100%;margin-top:20px}td{border-bottom:1px solid #d9e0e7;padding:10px;text-align:left}small{color:#607086}</style></head><body><small>ZyID Local Verification · browser-only report</small><h1>${name}</h1><table><tr><td>Status</td><td>${entry.status}</td></tr><tr><td>Risk signal</td><td>${entry.riskPercent}% · ${entry.risk}</td></tr><tr><td>Source</td><td>${entry.sourceName}</td></tr><tr><td>Reference</td><td>${entry.identityCode}</td></tr><tr><td>Created</td><td>${entry.createdAt}</td></tr></table><p>Local demo report. No external verification service was contacted.</p></body></html>`;
}
export function asDataUrl(html) { return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`; }
function pdfSafe(value) { return String(value ?? '').replace(/[^\x20-\x7E]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)').slice(0, 112); }
export function asPdfDataUrl(entry) {
    const lines = [
        'ZyID LOCAL VERIFICATION',
        'BROWSER-ONLY REPORT · AUTHORIZED REVIEW ONLY',
        `Document: ${'document' in entry ? entry.document : entry.detected}`,
        `Source file: ${entry.sourceName}`,
        `Verification result: ${entry.status}`,
        `Risk signal: ${entry.riskPercent}% · ${entry.risk}`,
        `Reference: ${entry.identityCode}`,
        `Created: ${entry.createdAt}`,
        '',
        'No external verification service was contacted.',
    ];
    let stream = 'BT\n/F1 11 Tf\n50 760 Td\n';
    lines.forEach((line, index) => { if (index)
        stream += '0 -18 Td\n'; stream += `(${pdfSafe(line)}) Tj\n`; });
    stream += 'ET';
    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return `data:application/pdf;base64,${btoa(pdf)}`;
}
export function downloadReport(entry) {
    const link = document.createElement('a');
    link.href = asPdfDataUrl(entry);
    link.download = `zyid-${entry.identityCode.toLowerCase()}.pdf`;
    link.click();
}
