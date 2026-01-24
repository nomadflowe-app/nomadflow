import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Reusing the key via environment variables
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
console.log('[Stripe Debug] Key loaded:', STRIPE_PUBLIC_KEY ? 'Yes (Starts with ' + STRIPE_PUBLIC_KEY.substring(0, 7) + ')' : 'NO (Empty String)');

export async function redirectToCheckout(userId: string, userEmail: string, priceId: string) {
    try {
        const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
        if (!stripe) throw new Error('Stripe failed to load');

        // Chamar a Edge Function do Supabase
        const { data, error: funcError } = await supabase.functions.invoke('create-checkout', {
            body: { userId, userEmail, priceId }
        });

        if (funcError) {
            console.error('[Stripe] Erro na função:', funcError);
            throw funcError;
        }

        const session = data;

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
