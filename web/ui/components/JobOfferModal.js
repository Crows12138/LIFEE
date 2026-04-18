const { useState, useEffect, useRef } = React;

const JOB_DIMENSIONS = [
    { id: 1, label: 'Money (short-term income)' },
    { id: 2, label: 'Growth potential' },
    { id: 3, label: 'Industry outlook' },
    { id: 4, label: 'Job stability' },
    { id: 5, label: 'Life experience' },
];

const STAGES      = ['Seed', 'Angel', 'Series A', 'Series B', 'Series C', 'Public', 'Big Tech'];
const ROLES       = ['Product', 'BD', 'Engineering', 'Operations', 'Mgmt Trainee'];
const EQUITY_OPTS = ['Yes', 'No', 'Unclear'];
const CLARITY_OPTS = ['Clear', 'Vague'];
const REPORTS_OPTS = ['Founder', 'Mid-level', 'Unknown'];

const PillSelect = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
        {options.map(opt => (
            <button
                key={opt}
                type="button"
                onClick={() => onChange(value === opt ? '' : opt)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    value === opt
                        ? 'bg-blue-brand text-white shadow-sm'
                        : 'bg-[#F0EDEA] text-[#5D576B]/60 hover:bg-[#E8E5E0]'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

const newOffer = () => ({
    id: Math.random().toString(36).slice(2),
    company: '', stage: '', role: '', cash: '', equity: '', clarity: '', reportsTo: '', notes: ''
});

const JobOfferModal = ({ isOpen, onClose, onConfirm }) => {
    const [step, setStep] = useState(1);
    const [items, setItems] = useState([...JOB_DIMENSIONS]);
    const [offers, setOffers] = useState([newOffer(), newOffer()]);
    const dragIndexRef = useRef(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const touchDragIndex = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setItems([...JOB_DIMENSIONS]);
            setOffers([newOffer(), newOffer()]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // ── Step 1 drag handlers ──
    const onDragStart = (i) => { dragIndexRef.current = i; };
    const onDragOver = (e, i) => {
        e.preventDefault();
        if (dragIndexRef.current === null || dragIndexRef.current === i) return;
        setDragOverIndex(i);
        setItems(prev => {
            const next = [...prev];
            const [moved] = next.splice(dragIndexRef.current, 1);
            next.splice(i, 0, moved);
            dragIndexRef.current = i;
            return next;
        });
    };
    const onDragEnd = () => { dragIndexRef.current = null; setDragOverIndex(null); };
    const onTouchStart = (e, i) => { touchDragIndex.current = i; };
    const onTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!el) return;
        const item = el.closest('[data-drag-index]');
        if (!item) return;
        const overIndex = parseInt(item.dataset.dragIndex, 10);
        if (isNaN(overIndex) || touchDragIndex.current === null || touchDragIndex.current === overIndex) return;
        setDragOverIndex(overIndex);
        setItems(prev => {
            const next = [...prev];
            const [moved] = next.splice(touchDragIndex.current, 1);
            next.splice(overIndex, 0, moved);
            touchDragIndex.current = overIndex;
            return next;
        });
    };
    const onTouchEnd = () => { touchDragIndex.current = null; setDragOverIndex(null); };

    // ── Step 2 helpers ──
    const updateOffer = (id, field, val) =>
        setOffers(prev => prev.map(o => o.id === id ? { ...o, [field]: val } : o));

    const removeOffer = (id) =>
        setOffers(prev => prev.filter(o => o.id !== id));

    const handleFinalConfirm = () => {
        const ranked = items.map((item, i) => `${i + 1}. ${item.label}`).join('\n');
        const offerTexts = offers.map((o, i) => {
            const name = `Offer ${String.fromCharCode(65 + i)}${o.company ? ` — ${o.company}` : ''}`;
            const fields = [
                o.stage      && `Stage: ${o.stage}`,
                o.role       && `Role: ${o.role}`,
                o.cash       && `Cash comp: ${o.cash}`,
                o.equity     && `Equity: ${o.equity}`,
                o.clarity    && `Role clarity: ${o.clarity}`,
                o.reportsTo  && `Reports to: ${o.reportsTo}`,
            ].filter(Boolean).map(f => `  • ${f}`).join('\n');
            const notesLine = o.notes ? `\n  Notes: ${o.notes}` : '';
            return `${name}${fields ? '\n' + fields : ''}${notesLine}`;
        }).join('\n\n');
        onConfirm(`I'm not sure which job offer to choose.\n\nMy priorities (most → least important):\n${ranked}\n\n${offerTexts}`);
        onClose();
    };

    const labelCls = "text-[9px] uppercase tracking-[0.2em] font-black text-[#5D576B]/40 mb-1";
    const inputCls = "w-full bg-[#F8F6F2] border border-[#E8E6E0] rounded-[12px] px-3 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#5D576B]/30 focus:outline-none focus:border-blue-brand transition-colors";

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
                className="relative bg-[#FDFBF7] rounded-t-[40px] md:rounded-[40px] shadow-2xl w-full md:max-w-lg flex flex-col"
                style={{ maxHeight: '90vh' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-10 h-1 bg-[#E0DDD8] rounded-full mx-auto mt-4 md:hidden flex-shrink-0" />
                <button
                    onClick={onClose}
                    className="absolute top-5 right-6 w-8 h-8 rounded-full bg-[#F0EDEA] flex items-center justify-center text-[#5D576B]/60 hover:text-[#5D576B] transition-colors z-10"
                >
                    <Icon name="X" size={16} />
                </button>

                {step === 1 ? (
                    /* ── Step 1: Priority ranking ── */
                    <div className="flex flex-col gap-5 p-8 md:p-10 overflow-y-auto no-scrollbar">
                        <div className="text-center space-y-1.5 pr-4">
                            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-blue-brand/40">Step 1 of 2</p>
                            <h2 className="text-2xl font-serif italic tracking-tight text-[#1A1A1A] leading-snug">What matters most to you?</h2>
                            <p className="text-[9px] uppercase tracking-[0.25em] font-black text-[#5D576B]/40">Drag to rank · most → least important</p>
                        </div>
                        <div className="flex flex-col gap-2.5">
                            {items.map((item, i) => (
                                <div
                                    key={item.id}
                                    data-drag-index={String(i)}
                                    draggable
                                    onDragStart={() => onDragStart(i)}
                                    onDragOver={e => onDragOver(e, i)}
                                    onDragEnd={onDragEnd}
                                    onTouchStart={e => onTouchStart(e, i)}
                                    onTouchMove={onTouchMove}
                                    onTouchEnd={onTouchEnd}
                                    style={{ touchAction: 'none' }}
                                    className={`flex items-center gap-3 bg-white border-2 rounded-[18px] px-4 py-3.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${dragOverIndex === i ? 'border-blue-brand shadow-md scale-[1.02]' : 'border-[#F0EDEA] hover:border-blue-brand/30 hover:shadow-sm'}`}
                                >
                                    <span className="text-[11px] font-black text-blue-brand/40 w-4 text-center tabular-nums">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[#1A1A1A] text-sm leading-tight">{item.label}</p>
                                    </div>
                                    <Icon name="GripVertical" size={15} className="text-[#5D576B]/25 flex-shrink-0" />
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-4 bg-blue-brand text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all active:scale-95 mt-1"
                        >
                            Next — Add Your Offers
                        </button>
                    </div>
                ) : (
                    /* ── Step 2: Offer details ── */
                    <>
                        <div className="flex-shrink-0 px-8 pt-8 md:px-10 md:pt-10 pb-4">
                            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] font-black text-[#5D576B]/40 hover:text-blue-brand transition-colors mb-3">
                                <Icon name="ChevronLeft" size={12} /> Back
                            </button>
                            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-blue-brand/40">Step 2 of 2</p>
                            <h2 className="text-2xl font-serif italic tracking-tight text-[#1A1A1A] mt-1">Tell me about the offers</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar px-8 md:px-10 pb-4 space-y-4">
                            {offers.map((offer, idx) => (
                                <div key={offer.id} className="bg-white border border-[#F0EDEA] rounded-[24px] p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-brand/50">Offer {String.fromCharCode(65 + idx)}</span>
                                        {offers.length > 1 && (
                                            <button onClick={() => removeOffer(offer.id)} className="w-6 h-6 rounded-full bg-[#F0EDEA] flex items-center justify-center text-[#5D576B]/40 hover:text-red-400 transition-colors">
                                                <Icon name="X" size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div>
                                        <p className={labelCls}>Company name</p>
                                        <input type="text" className={inputCls} placeholder="e.g. Acme Corp" value={offer.company} onChange={e => updateOffer(offer.id, 'company', e.target.value)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Stage</p>
                                        <PillSelect options={STAGES} value={offer.stage} onChange={v => updateOffer(offer.id, 'stage', v)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Role type</p>
                                        <PillSelect options={ROLES} value={offer.role} onChange={v => updateOffer(offer.id, 'role', v)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Total cash comp</p>
                                        <input type="text" className={inputCls} placeholder="e.g. ¥500k / year" value={offer.cash} onChange={e => updateOffer(offer.id, 'cash', e.target.value)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Equity</p>
                                        <PillSelect options={EQUITY_OPTS} value={offer.equity} onChange={v => updateOffer(offer.id, 'equity', v)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Role clarity</p>
                                        <PillSelect options={CLARITY_OPTS} value={offer.clarity} onChange={v => updateOffer(offer.id, 'clarity', v)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Reports to</p>
                                        <PillSelect options={REPORTS_OPTS} value={offer.reportsTo} onChange={v => updateOffer(offer.id, 'reportsTo', v)} />
                                    </div>
                                    <div>
                                        <p className={labelCls}>Anything else worth noting?</p>
                                        <textarea
                                            className={`${inputCls} resize-none h-20 leading-relaxed`}
                                            placeholder="Culture, commute, gut feeling, red flags..."
                                            value={offer.notes}
                                            onChange={e => updateOffer(offer.id, 'notes', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => setOffers(prev => [...prev, newOffer()])}
                                className="w-full py-3 border-2 border-dashed border-[#E0DDD8] rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] text-[#5D576B]/40 hover:border-blue-brand/40 hover:text-blue-brand/60 transition-all flex items-center justify-center gap-2"
                            >
                                <Icon name="Plus" size={14} /> Add another offer
                            </button>
                        </div>

                        <div className="flex-shrink-0 px-8 pb-8 md:px-10 md:pb-10 pt-4 border-t border-[#F0EDEA]">
                            <button
                                onClick={handleFinalConfirm}
                                className="w-full py-4 bg-blue-brand text-white rounded-full font-black uppercase tracking-[0.2em] text-[11px] shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all active:scale-95"
                            >
                                Let Them Debate This
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

window.JobOfferModal = JobOfferModal;
