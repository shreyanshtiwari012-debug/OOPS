import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, ScanLine, ArrowUpRight, ArrowRight, History, SlidersHorizontal, LockKeyhole, FileText, X, LoaderCircle, ChevronRight, CircleHelp } from 'lucide-react';
import { scanMessage } from './services/api';
import { localAnalysis } from './services/localAnalysis';
import { HistoryModal } from './components/HistoryModal';
import { RulesModal } from './components/RulesModal';
import { ForensicDashboard } from './components/ForensicDashboard';
import { Toast } from './components/ui/Toast';

const examples = [
  { name: 'Bank impersonation', text: 'URGENT: Your bank account will be blocked within 24 hours. Update your KYC immediately at https://secure-bank-verify.example and enter your OTP to avoid suspension.' },
  { name: 'Prize scam', text: 'Congratulations! You have won a lottery prize of ₹50,000. Claim your prize now at https://claim-reward.example. Pay a processing fee to receive your reward.' },
  { name: 'Everyday message', text: 'Hi, your appointment is confirmed for Tuesday at 10 am. Please arrive ten minutes early. See you then.' },
];
export default function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [advanced, setAdvanced] = useState(false);
  const [toast, setToast] = useState(null);
  const help = useRef(null);
  useEffect(() => {
    if (modal !== 'help') return;
    const previous = document.activeElement;
    const onKey = event => {
      if (event.key === 'Escape') setModal(null);
      if (event.key === 'Tab') {
        const controls = help.current?.querySelectorAll('button');
        if (!controls?.length) return;
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [modal]);
  const input = useRef(null);
  const output = useRef(null);
  const notify = (message, tone = 'info') => setToast({ message, tone });
  function reset() { setResult(null); setText(''); setError(''); setAdvanced(false); input.current?.focus(); }
  async function check(event) {
    event.preventDefault();
    if (text.trim().length < 5) { setError('Add at least 5 characters to check a message.'); input.current?.focus(); return; }
    setBusy(true); setError(''); setResult(null);
    try { setResult(await scanMessage(text.trim())); }
    catch (err) {
      if (err.status && err.status < 500 && err.status !== 408) setError(err.message || 'The scan could not be completed. Please try again.');
      else setResult(localAnalysis(text.trim()));
    }
    finally { setBusy(false); setTimeout(() => output.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80); }
  }
  const level = result?.riskLevel;
  const verdict = level === 'critical' ? 'High scam risk' : level === 'suspicious' ? 'Worth a closer look' : 'Low detected risk';
  return <div className="fraudora-app">
    <header className="app-header"><div className="header-inner">
      <button className="wordmark" onClick={reset} aria-label="Fraudora home"><ShieldCheck size={29} strokeWidth={1.7} />Fraudora<span className="brand-dot">.</span></button>
      <nav aria-label="Main navigation"><button className={!modal ? 'nav-current' : ''} onClick={() => { setModal(null); setAdvanced(false); }}>Message checker</button><button aria-label="Scan history" onClick={() => setModal('history')}><History size={16} /><span>Scan history</span></button><button aria-label="How it works" onClick={() => setModal('help')}><CircleHelp size={16} /><span>How it works</span></button></nav>
      <span className="header-note"><LockKeyhole size={14} />Think before you trust.</span>
    </div></header>
    {advanced && result ? <ForensicDashboard result={result} bannerStatus="Review scan findings" onStatusChange={() => {}} onBack={() => setAdvanced(false)} onToast={notify} /> : <main className="checker-main">
      <div className="page-title"><div><h1>Message checker</h1><p>A little doubt? Get a clearer picture before you click.</p></div><button className="text-button" aria-label="Scoring rules" onClick={() => setModal('rules')}><SlidersHorizontal size={16} /><span>Scoring rules</span><ArrowUpRight size={15} /></button></div>
      <div className="checker-grid">
        <section className="input-panel" aria-labelledby="input-title"><div className="panel-heading"><h2 id="input-title"><FileText size={18} />Check a message</h2><span>Text, email or link</span></div>
          <form onSubmit={check}><label className="input-label" htmlFor="message">Paste the message you’re unsure about</label><div className="textarea-wrap"><textarea ref={input} id="message" value={text} maxLength={15000} onChange={e => { setText(e.target.value); setError(''); setResult(null); }} placeholder={'Your account has been suspended. Click here to verify…\n\nPaste the full message here. We’ll look for the warning signs.'} aria-describedby="input-note input-error" disabled={busy} /><div className="textarea-bottom"><span>Include links for a more complete check</span><span>{text.length.toLocaleString()} / 15,000</span></div></div><div id="input-error" role="alert" className="input-error">{error}</div>
          <div className="input-actions"><span id="input-note"><LockKeyhole size={14} />Leave out passwords and personal details.</span><button className="scan-button" disabled={busy} type="submit">{busy ? <LoaderCircle className="spin" size={17} /> : <ScanLine size={17} />}{busy ? 'Checking message…' : 'Analyze message'}{!busy && <ArrowRight size={17} />}</button></div></form>
          <div className="examples"><span>Or try an example</span><div>{examples.map(example => <button key={example.name} disabled={busy} onClick={() => { setText(example.text); setResult(null); setError(''); input.current?.focus(); }}>{example.name}<ArrowUpRight size={13} /></button>)}</div></div>
        </section>
        <section ref={output} className={`result-panel ${result ? `result-${level}` : ''}`} aria-labelledby="result-title" aria-live="polite" aria-busy={busy}><div className="panel-heading"><h2 id="result-title">Your analysis</h2><span>{busy ? 'In progress' : result ? 'Complete' : 'Ready when you are'}</span></div>
          {!result ? <div className="result-empty"><div className="scan-symbol"><ShieldCheck size={43} strokeWidth={1} /><span /></div><h3>{busy ? 'Reading between the lines' : 'A second look starts here'}</h3><p>{busy ? 'Checking the message for risky patterns and suspicious links.' : 'Analyze a message to see its risk score, the warning signs, and what to do next.'}</p><div className="empty-score"><span>Risk score</span><span>Awaiting message</span><div /></div><ul className="preview-checks"><li>Pressure and urgency</li><li>Requests for money or private details</li><li>Links that need verification</li></ul></div> : <div className="result-content">
            {result.local && <p className="offline-note">Offline preview · Basic text patterns only. Full analysis is unavailable.</p>}
            <div className="score-row"><div><p>Risk score</p><strong>{result.score}<small> / 100</small></strong></div><span className="verdict">{verdict}</span></div><div className="score-track" role="meter" aria-label="Scam risk score" aria-valuenow={result.score} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${result.score}%` }} /></div><div className="score-ends"><span>Lower risk</span><span>Higher risk</span></div>
            <p className="result-summary">{result.guidance.explanation}</p><h3>What we found</h3><ul className="findings">{result.indicators.length ? result.indicators.map((item, i) => <li key={`${item.id}-${i}`}><div><strong>{item.ruleName}</strong><p>{item.explanation}</p></div><span>+{item.weight}</span></li>) : <li>No listed warning patterns detected. Always verify the sender.</li>}</ul>
            <details><summary>What should I do next?<ChevronRight size={16} /></summary><ul>{result.guidance.steps.map(step => <li key={step}>{step}</li>)}</ul></details><button className="text-button" onClick={() => setAdvanced(true)}>Open detailed report<ArrowUpRight size={15} /></button>
          </div>}
          <div className="result-footer"><ShieldCheck size={15} /><span>A risk score is a signal, not a guarantee of safety.</span></div>
        </section>
      </div>
      <section className="score-guide" aria-labelledby="guide-title"><div><h2 id="guide-title">Make sense of the score.</h2><p>Higher scores mean more warning signs.<br />Check the reasons, not just the number.</p></div><div className="guide-bands"><div><span className="range">0–29</span><h3>Low detected risk</h3><p>Few warning signs. Still verify who’s behind the message.</p></div><div><span className="range">30–59</span><h3>Suspicious</h3><p>Something needs a closer look. Confirm through an official channel.</p></div><div><span className="range">60–100</span><h3>High risk</h3><p>Strong scam signals. Pause before clicking, paying or replying.</p></div></div></section>
      <div className="safety-note"><ShieldCheck size={19} /><p><strong>When in doubt, go direct.</strong> Open the official app or website yourself instead of following a message’s link.</p><button onClick={() => setModal('help')} aria-label="Learn how Fraudora works"><ArrowUpRight size={19} /></button></div>
    </main>}
    <footer className="app-footer"><span>Fraudora<span className="brand-dot">.</span><span className="footer-copy">A pause can make all the difference.</span></span><button onClick={() => setModal('help')}>Know the signs<ArrowUpRight size={13} /></button></footer>
    <HistoryModal isOpen={modal === 'history'} onClose={() => setModal(null)} onSelectScan={scan => { setResult(scan); setText(scan.payload || ''); setAdvanced(false); }} onToast={notify} />
    <RulesModal isOpen={modal === 'rules'} onClose={() => setModal(null)} />
    {modal === 'help' && <div className="help-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}><dialog ref={help} open aria-modal="true" className="help-dialog" aria-labelledby="help-title" onCancel={() => setModal(null)}><div className="panel-heading"><h2 id="help-title">How Fraudora works</h2><button autoFocus onClick={() => setModal(null)} aria-label="Close help"><X size={20} /></button></div><p>Paste a message and choose Analyze message. Fraudora’s engine checks for patterns such as urgency, sensitive information requests, payment demands and suspicious links.</p><p>Detected rules add weighted points to a risk score capped at 100. This is a risk indicator, not the probability that a message is a scam.</p><p>Online scans may be saved to scan history by the service. Avoid submitting private information. When the service is unavailable, a clearly labeled offline preview uses a smaller set of text rules.</p><button className="scan-button" onClick={() => setModal(null)}>Got it<ArrowRight size={16} /></button></dialog></div>}
    {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
  </div>;
}
