import { Icon } from './Icon';
export function StatusPill({ status }) {
    const copy = status === 'VERIFIED' ? 'Valid' : status === 'FAILED' ? 'Invalid' : 'Review';
    const icon = status === 'VERIFIED' ? 'CheckCircle2' : status === 'FAILED' ? 'XCircle' : 'AlertTriangle';
    return <span className={`status-pill ${status === 'VERIFIED' ? 'verified' : status === 'FAILED' ? 'failed' : 'review'}`}><Icon name={icon} size={12}/>{copy}</span>;
}
export function RiskPill({ level }) {
    return <span className={`status-pill ${level === 'LOW' ? 'verified' : level === 'CRITICAL' || level === 'HIGH' ? 'failed' : 'review'}`}>{level}</span>;
}
