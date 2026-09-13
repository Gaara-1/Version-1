export const DOCUMENT_TYPES = [
    { id: 'aadhaar', name: 'Aadhaar Card', description: '12-digit identity number issued by UIDAI', fields: ['Name', 'DOB / YOB', 'Gender', 'Aadhaar Number', 'QR Code', 'Photo'] },
    { id: 'pan', name: 'PAN Card', description: '10-character alphanumeric tax ID', fields: ['Name', "Father's Name", 'DOB', 'PAN Number', 'Photo', 'Signature'] },
    { id: 'passport', name: 'Passport', description: 'International travel and identity document', fields: ['Name', 'Passport No.', 'MRZ Zone', 'Photo', 'Nationality', 'DOB'] },
    { id: 'dl', name: 'Driving Licence', description: 'State-issued driving authorisation', fields: ['Licence No.', 'Name', 'DOB', 'Validity', 'Photo', 'Issuing Authority'] },
    { id: 'birth', name: 'Birth Certificate', description: 'Official record of birth registration', fields: ['Name', 'DOB', 'Registration No.', 'Issuing Authority'] },
    { id: 'leaving', name: 'Leaving Certificate', description: 'School leaving or transfer certificate', fields: ['Student Name', 'DOB', 'Institution', 'Certificate No.', 'Class / Course'] },
    { id: 'edu', name: 'Educational Certificate', description: 'Degree, marksheet or course certificate', fields: ['Institution', 'Student Name', 'Course', 'Year', 'Certificate No.'] },
    { id: 'other', name: 'Other Document', description: 'General document screening', fields: ['Document Title', 'Name', 'Identifiers'] },
];
const rules = {
    aadhaar: { concepts: [{ label: 'AADHAAR', accepted: ['AADHAAR'] }, { label: 'GOVERNMENT', accepted: ['GOVERNMENT'] }, { label: 'INDIA', accepted: ['INDIA'] }], number: /\d{4}\D{0,3}\d{4}\D{0,3}\d{4}/, numberLabel: '12-digit Aadhaar number' },
    pan: { concepts: [{ label: 'INCOME TAX', accepted: ['INCOME'] }, { label: 'PERMANENT ACCOUNT NUMBER', accepted: ['PERMANENT'] }, { label: 'GOVT OF INDIA', accepted: ['INDIA'] }], number: /[A-Z]{5}\d{4}[A-Z]/, numberLabel: 'PAN number such as ABCDE1234F' },
    passport: { concepts: [{ label: 'REPUBLIC OF INDIA', accepted: ['REPUBLIC'] }, { label: 'PASSPORT', accepted: ['PASSPORT'] }], number: /[A-Z]\d{7}/, numberLabel: 'passport number' },
    dl: { concepts: [{ label: 'DRIVING', accepted: ['DRIVING'] }, { label: 'LICENCE', accepted: ['LICENCE', 'LICENSE'] }], number: /[A-Z]{2}\d{2}\D{0,2}\d{4,11}/, numberLabel: 'licence number' },
    birth: { concepts: [{ label: 'BIRTH', accepted: ['BIRTH'] }, { label: 'CERTIFICATE', accepted: ['CERTIFICATE'] }], number: /\d{3,}/, numberLabel: 'registration number' },
    leaving: { concepts: [{ label: 'LEAVING', accepted: ['LEAVING'] }, { label: 'CERTIFICATE', accepted: ['CERTIFICATE'] }], number: /\d{2,}/, numberLabel: 'certificate number' },
    edu: { concepts: [{ label: 'CERTIFICATE / DEGREE', accepted: ['CERTIFICATE', 'DEGREE', 'MARKSHEET'] }], number: /\d{2,}/, numberLabel: 'certificate number' },
    other: { concepts: [] },
};
const docById = (id) => DOCUMENT_TYPES.find((doc) => doc.id === id) ?? DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
function levenshtein(a, b) {
    const rows = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let i = 1; i <= b.length; i++)
        rows[0][i] = i;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            rows[i][j] = a[i - 1] === b[j - 1] ? rows[i - 1][j - 1] : 1 + Math.min(rows[i - 1][j - 1], rows[i][j - 1], rows[i - 1][j]);
        }
    }
    return rows[a.length][b.length];
}
function conceptMatch(words, concept) {
    let best = { word: '', distance: Number.POSITIVE_INFINITY, expected: concept.accepted[0] };
    for (const expected of concept.accepted) {
        for (const word of words) {
            if (Math.abs(word.length - expected.length) <= 3) {
                const distance = levenshtein(word, expected);
                if (distance < best.distance)
                    best = { word, distance, expected };
            }
        }
    }
    if (best.distance === 0)
        return { status: 'exact', found: best.word };
    const threshold = Math.max(1, Math.floor(best.expected.length * 0.3));
    if (best.word && best.distance <= threshold)
        return { status: 'near', found: best.word, expected: best.expected };
    return { status: 'missing' };
}
export function classifyDocument(documentId, rawText, sourceName = '') {
    const doc = docById(documentId);
    const text = rawText.toUpperCase();
    const words = text.match(/[A-Z]{3,}/g) ?? [];
    const rule = rules[documentId] ?? rules.other;
    if (documentId === 'other') {
        return { status: 'VERIFIED', headline: 'SCREENED', detected: doc.name, confidence: words.length > 3 ? 80 : 55, issues: [], why: ['Text extracted from document', 'No document-type-specific rules apply to this category'], risk: { level: 'LOW', reasons: ['General screening only'] }, recommendation: 'No action needed.', docId: documentId, sourceName, rawText };
    }
    const matches = rule.concepts.map((concept) => ({ concept: concept.label, ...conceptMatch(words, concept) }));
    const missing = matches.filter((item) => item.status === 'missing');
    const near = matches.filter((item) => item.status === 'near');
    if (missing.length >= Math.ceil(rule.concepts.length / 2)) {
        const alternate = DOCUMENT_TYPES.filter((candidate) => candidate.id !== documentId && candidate.id !== 'other').find((candidate) => {
            const candidateRule = rules[candidate.id];
            return candidateRule.concepts.filter((concept) => conceptMatch(words, concept).status !== 'missing').length >= Math.ceil(candidateRule.concepts.length / 2);
        });
        const wrong = alternate ? `This looks like a ${alternate.name}, not a ${doc.name}.` : `Could not find expected ${doc.name} text in this file.`;
        return { status: 'FAILED', headline: alternate ? 'WRONG DOCUMENT TYPE' : 'INVALID DOCUMENT', detected: alternate?.name ?? 'Unrecognized document', confidence: null, issues: [{ title: alternate ? 'DOCUMENT TYPE MISMATCH' : 'INVALID DOCUMENT', severity: 'CRITICAL', detail: wrong }], why: [`${doc.name} keywords were not found`, 'Document structure does not match the selected category'], risk: { level: 'HIGH', reasons: ['Selected category does not match document content'] }, recommendation: `Please upload a valid ${doc.name}.`, docId: documentId, sourceName, rawText };
    }
    if (near.length) {
        return { status: 'FAILED', headline: 'FAKE DOCUMENT DETECTED', detected: doc.name, confidence: null, issues: near.map((item) => ({ title: 'SUSPECTED FAKE DOCUMENT', severity: 'CRITICAL', detail: `Expected "${item.expected}" but found "${item.found}".` })), why: ['A standard field label appears misspelled', 'Spelling anomalies can indicate a fabricated or edited document'], risk: { level: 'CRITICAL', reasons: ['Spelling mismatch in official terminology'] }, recommendation: 'Reject this document and request manual investigation.', docId: documentId, sourceName, rawText };
    }
    if (rule.number && !rule.number.test(text)) {
        return { status: 'FAILED', headline: 'INVALID NUMBER FORMAT', detected: doc.name, confidence: null, issues: [{ title: 'INVALID NUMBER FORMAT', severity: 'HIGH', detail: `Expected ${rule.numberLabel} was not found or does not match the standard format.` }], why: ['Document text matched but the identifier format is invalid'], risk: { level: 'HIGH', reasons: ['Number format does not match the official standard'] }, recommendation: 'Verify the number manually or request a clearer image.', docId: documentId, sourceName, rawText };
    }
    return { status: 'VERIFIED', headline: 'VERIFIED', detected: doc.name, confidence: 95, issues: [], why: ['Document type keywords matched', 'Identifier number format valid', 'No spelling anomalies detected'], risk: { level: 'LOW', reasons: ['No anomalies detected across text and format checks'] }, recommendation: 'No action needed.', docId: documentId, sourceName, rawText };
}
export function detectDocumentType(rawText, fileName = '') {
    const normalized = `${rawText} ${fileName}`.toUpperCase();
    const scores = DOCUMENT_TYPES.filter((doc) => doc.id !== 'other').map((doc) => {
        const rule = rules[doc.id];
        let score = rule.concepts.filter((concept) => concept.accepted.some((term) => normalized.includes(term))).length / Math.max(1, rule.concepts.length);
        if (rule.number?.test(normalized))
            score += 0.45;
        if (normalized.includes(doc.id.toUpperCase()) || normalized.includes(doc.name.split(' ')[0].toUpperCase()))
            score += 0.25;
        return { doc, score };
    }).sort((a, b) => b.score - a.score);
    const best = scores[0];
    if (!best || best.score < 0.45)
        return { doc: docById('other'), confidence: rawText.length > 20 ? 58 : 35, review: true };
    return { doc: best.doc, confidence: Math.min(98, Math.max(62, Math.round(48 + best.score * 42))), review: best.score < 0.9 };
}
