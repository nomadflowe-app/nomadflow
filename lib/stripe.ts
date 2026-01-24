import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Reusing the key via environment variables
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
console.log('[Stripe Debug] Key loaded:', STRIPE_PUBLIC_KEY ? 'Yes (Starts with ' + STRIPE_PUBLIC_KEY.substring(0, 7) + ')' : 'NO (Empty String)');

export async function redirectToCheckout(userId: string, userEmail: string, priceId: string) {
    try {
        const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
        if (!stripe) throw new Error('Stripe failed to load');

        // IDENTIFICADOR DE VERSÃO
        console.log('%c [VERSÃO STRIPE 2.0 - FETCH DIRETO]', 'background: blue; color: white; font-size: 20px;');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseAnonKey) {
            alert("ERRO CRÍTICO: Chave VITE_SUPABASE_ANON_KEY não encontrada no site!");
        }
        const functionUrl = `${supabaseUrl}/functions/v1/create-checkout`;

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({ userId, userEmail, priceId })
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(errorBody.error || `Erro no servidor: ${response.status}`);
        }

        const session = await response.json();

        if (session.url) {
            // Redireciona para o checkout seguro do Stripe
            window.location.href = session.url;
        } else {
            throw new Error(session.error || 'Erro ao criar sessão de checkout');
        }

    } catch (error: any) {
        console.error('Stripe Redirect Error:', error);
        throw error;
    }
}
