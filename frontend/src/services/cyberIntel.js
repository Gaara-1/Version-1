export const DEMO_RECORDS = [
    { id: 'ZYID-DEMO-3101', name: 'Parth Raivansh', dob: '14 Feb 2006', serial: 'DEMO-SERIAL-9201', caseNo: 'ZY-DEMO-CASE', status: 'TEST RECORD', court: 'Demo District Court', category: 'Fictional legal-record test profile' },
    { id: 'ZYID-DEMO-3102', name: 'Sanchi Veyra', dob: '28 Jun 2006', serial: 'DEMO-SERIAL-9202', caseNo: 'ZY-DEMO-CASE', status: 'TEST RECORD', court: 'Demo District Court', category: 'Fictional legal-record test profile' },
    { id: 'ZYID-DEMO-3103', name: 'Avishkar Kairav', dob: '07 Oct 2005', serial: 'DEMO-SERIAL-9203', caseNo: 'ZY-DEMO-CASE', status: 'TEST RECORD', court: 'Demo District Court', category: 'Fictional legal-record test profile' },
    { id: 'ZYID-DEMO-3104', name: 'Arbeena Zayra', dob: '19 Jan 2006', serial: 'DEMO-SERIAL-9204', caseNo: 'ZY-DEMO-CASE', status: 'TEST RECORD', court: 'Demo District Court', category: 'Fictional legal-record test profile' },
    { id: 'ZYID-DEMO-3105', name: 'Karan Reyansh', dob: '03 Sep 2005', serial: 'DEMO-SERIAL-9205', caseNo: 'ZY-DEMO-CASE', status: 'TEST RECORD', court: 'Demo District Court', category: 'Fictional legal-record test profile' },
    { id: 'ZYID-DEMO-3106', name: 'Ayush Vihaan', dob: '22 Apr 2006', serial: 'DEMO-SERIAL-9206', caseNo: 'ZY-DEMO-CASE', status: 'TEST RECORD', court: 'Demo District Court', category: 'Fictional legal-record test profile' },
];
function normalize(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
export function analyzeCyberDocument(rawText, fileName, documentId) {
    const haystack = normalize(`${rawText} ${fileName}`);
    const record = DEMO_RECORDS.find((item) => haystack.includes(normalize(item.name)) || haystack.includes(normalize(item.id)) || haystack.includes(normalize(item.serial)));
    const name = record?.name ?? (rawText.match(/[A-Z][a-z]+ [A-Z][a-z]+/)?.[0] ?? 'Unresolved document subject');
    return { matched: Boolean(record), confidence: record ? 98 : 96, subject: { name, dob: record?.dob ?? 'Not extracted', document: record?.id ?? `${documentId.toUpperCase()} · local` }, record: record ?? null, metrics: record ? { name: 100, dob: 100, document: 100, face: 98 } : { name: 94, dob: 88, document: 91, face: 90 }, note: record ? `${record.name} exactly matches a fictional criminal record in the local demo index. Human review is required.` : 'No sufficiently correlated record was returned from the fictional local demo index.' };
}
