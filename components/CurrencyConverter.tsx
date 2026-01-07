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

const CurrencyConverter: React.FC = () => {
    const [rate, setRate] = useState<ExchangeRate | null>(null);
    const [amount, setAmount] = useState<number>(1000); // Valor inicial: 1000 ex
    const [isEurToBrl, setIsEurToBrl] = useState(true);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchRate = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://economia.awesomeapi.com.br/last/EUR-BRL');
            const data = await response.json();
            if (data.EURBRL) {
                setRate(data.EURBRL);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Erro ao buscar cotação:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRate();
        // Atualiza a cada 5 minutos
        const interval = setInterval(fetchRate, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const convert = () => {
        if (!rate) return 0;
        const bid = parseFloat(rate.bid);
        if (isEurToBrl) {
            return amount * bid;
        } else {
            return amount / bid;
        }
    };

    const formatCurrency = (val: number, currency: 'BRL' | 'EUR') => {
        return new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-DE', {
            style: 'currency',
            currency: currency
        }).format(val);
    };

    if (loading && !rate) {
        return (
            <div className="w-full h-32 bg-white/5 rounded-[2rem] animate-pulse flex items-center justify-center">
                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Carregando Câmbio...</span>
            </div>
        );
    }

    const currentBid = rate ? parseFloat(rate.bid) : 0;
    const variation = rate ? parseFloat(rate.pctChange) : 0;
    const isPositive = variation >= 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-[2rem] p-6 border-white/10 space-y-4"
        >
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white/60 flex items-center gap-2">
                        Simulador de Câmbio
                        <span className="text-[9px] bg-black/20 px-2 py-0.5 rounded-lg text-white/40 font-black uppercase tracking-wider">
                            Tempo Real
                        </span>
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white">
                            € 1 = R$ {currentBid.toFixed(2)}
                        </span>
                        <span className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {variation}%
                        </span>
                    </div>
                </div>
                <button
                    onClick={fetchRate}
                    disabled={loading}
                    className={`p-2 rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all ${loading ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="bg-black/20 rounded-2xl p-4 flex flex-col gap-4">
                {/* Input Row */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pl-1">
                            {isEurToBrl ? 'Tenho (EUR)' : 'Tenho (BRL)'}
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-transparent text-xl font-bold text-white focus:outline-none placeholder-white/20 border-b border-white/10 focus:border-brand-yellow/50 transition-all pb-1"
                            />
                            <span className="absolute right-0 bottom-1 text-xs font-black text-white/40 pointer-events-none">
                                {isEurToBrl ? 'EUR' : 'BRL'}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEurToBrl(!isEurToBrl)}
                        className="p-3 bg-white/5 rounded-xl text-brand-yellow hover:bg-brand-yellow hover:text-navy-950 transition-all"
                    >
                        <ArrowLeftRight className="w-4 h-4" />
                    </button>

                    <div className="flex-1 space-y-1 text-right">
                        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest pr-1">
                            {isEurToBrl ? 'Recebo (BRL)' : 'Recebo (EUR)'}
                        </label>
                        <div className="text-xl font-black text-brand-yellow border-b border-transparent pb-1">
                            {formatCurrency(convert(), isEurToBrl ? 'BRL' : 'EUR')}
                        </div>
                    </div>
                </div>
            </div>

            {lastUpdate && (
                <p className="text-[9px] text-center text-white/20 font-medium">
                    Atualizado em {lastUpdate.toLocaleTimeString()} via AwesomeAPI
                </p>
            )}
        </motion.div>
    );
};

export default CurrencyConverter;
