import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface ExchangeRate {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    varBid: string;
    pctChange: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
}

const currencies = [
    { code: 'BRL', symbol: 'R$', name: 'Real' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'USD', symbol: '$', name: 'Dólar' },
];

const CurrencyConverter: React.FC = () => {
    const [rates, setRates] = useState<Record<string, ExchangeRate>>({});
    const [amount, setAmount] = useState<number>(1000);
    const [fromCurr, setFromCurr] = useState('EUR');
    const [toCurr, setToCurr] = useState('BRL');
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        try {
            // Fetch relative to BRL (The Pivot)
            const response = await fetch('https://economia.awesomeapi.com.br/last/EUR-BRL,USD-BRL');
            const data = await response.json();
            if (data) {
                setRates(data);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Erro ao buscar cotação:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const getRateToBrl = (code: string) => {
        if (code === 'BRL') return 1;
        const rateObj = rates[`${code}BRL`];
        return rateObj ? parseFloat(rateObj.bid) : 1;
    };

    const convert = () => {
        if (fromCurr === toCurr) return amount;

        const rateFrom = getRateToBrl(fromCurr);
        const rateTo = getRateToBrl(toCurr);

        // Convert From -> BRL -> To
        const inBrl = amount * rateFrom;
        return inBrl / rateTo;
    };

    const formatValue = (val: number, code: string) => {
        return new Intl.NumberFormat(code === 'BRL' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: code
        }).format(val);
    };

    if (loading && Object.keys(rates).length === 0) {
        return (
            <div className="w-full h-24 bg-white/5 rounded-[2.5rem] animate-pulse flex items-center justify-center">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Sincronizando Mercado...</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2.5rem] p-6 border-white/10 flex flex-col items-center gap-6 relative overflow-hidden h-full"
        >
            <div className="w-full flex items-center gap-4 border-b border-white/5 pb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-brand-yellow flex items-center justify-center shadow-[0_0_20px_rgba(255,204,0,0.2)]">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-navy-950" />
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Câmbio Live</h3>
                    <p className="text-white font-bold whitespace-nowrap text-xs">Mercado Realtime</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4 w-full">
                <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 group focus-within:ring-1 ring-brand-yellow/30 transition-all">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">De</label>
                        <select
                            value={fromCurr}
                            onChange={(e) => setFromCurr(e.target.value)}
                            className="bg-transparent text-brand-yellow text-[10px] font-black uppercase tracking-widest cursor-pointer focus:outline-none"
                        >
                            {currencies.map(c => <option key={c.code} value={c.code} className="bg-navy-900 text-white">{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-transparent text-xl font-black text-white focus:outline-none"
                        />
                        <span className="text-xs font-black text-white/40">{fromCurr}</span>
                    </div>
                </div>

                <button
                    onClick={() => {
                        const temp = fromCurr;
                        setFromCurr(toCurr);
                        setToCurr(temp);
                    }}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-brand-yellow hover:bg-brand-yellow hover:text-navy-950 transition-all active:scale-90 shadow-lg mx-auto md:mx-0 rotate-90 md:rotate-0"
                >
                    <ArrowLeftRight className="w-4 h-4" />
                </button>

                <div className="bg-brand-yellow/5 border border-brand-yellow/10 rounded-2xl p-4 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black text-brand-yellow/40 uppercase tracking-widest">Para</label>
                        <select
                            value={toCurr}
                            onChange={(e) => setToCurr(e.target.value)}
                            className="bg-transparent text-brand-yellow text-[10px] font-black uppercase tracking-widest cursor-pointer focus:outline-none"
                        >
                            {currencies.map(c => <option key={c.code} value={c.code} className="bg-navy-900 text-white">{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-full text-xl font-black text-brand-yellow truncate">
                            {formatValue(convert(), toCurr)}
                        </div>
                        <span className="text-xs font-black text-brand-yellow/40">{toCurr}</span>
                    </div>
                </div>
            </div>

            {/* Refresh (Smallest) */}
            <button
                onClick={fetchRates}
                className="p-2 text-white/20 hover:text-white transition-all hidden md:block"
            >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Footer with rates and timestamp */}
            <div className="absolute bottom-3 left-6 right-6 flex flex-col md:flex-row justify-between items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
                <div className="flex gap-x-4 flex-wrap justify-center">
                    {currencies.filter(c => c.code !== 'BRL').map(c => {
                        const bid = rates[`${c.code}BRL`]?.bid;
                        return (
                            <span key={c.code} className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/60">
                                {c.code}/BRL: R$ {bid ? parseFloat(bid).toFixed(2) : '-'}
                            </span>
                        );
                    })}
                </div>
                {lastUpdate && (
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-white/40">
                        Live • {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default CurrencyConverter;
