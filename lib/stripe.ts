import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Reusing the key via environment variables
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';
console.log('[Stripe Debug] Key loaded:', STRIPE_PUBLIC_KEY ? 'Yes (Starts with ' + STRIPE_PUBLIC_KEY.substring(0, 7) + ')' : 'NO (Empty String)');

export async function redirectToCheckout(userId: string, userEmail: string, priceId: string) {
    try {
        const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
        if (!stripe) throw new Error('Stripe failed to load');

        // Chamar a Edge Function do Supabase de forma segura via SDK
        console.log('[Stripe] Invoking create-checkout...');
        const payload = { userId, userEmail, priceId };
        alert(`Enviando para o servidor:\nEmail: ${userEmail}\nPriceID: ${priceId}`);

        const { data, error: funcError } = await supabase.functions.invoke('create-checkout', {
            body: payload
        });

        if (funcError) {
            console.error('[Stripe] Invoke Error Details:', funcError);
            try {
                // Tentar ler a resposta de erro detalhada
                const errorBody = await (funcError.context ? funcError.context.json() : Promise.resolve(null));
                const errorMessage = errorBody?.error || funcError.message || JSON.stringify(funcError);
                console.error('[Stripe] Backend Message:', errorMessage);
                alert(`Erro no servidor: ${errorMessage}`);
            } catch (e) {
                alert(`Erro na chamada: ${funcError.message}`);
            }
            throw funcError;
        }

        const session = data;
        console.log('[Stripe] Session created:', session);

        if (session.url) {
            // Redireciona para o checkout seguro do Stripe
            window.location.href = session.url;
        } else {
            const errorMsg = session.error || 'Erro desconhecido ao criar sessão';
            console.error('Stripe Error Detail:', errorMsg);
            throw new Error(errorMsg);
        }

    } catch (error: any) {
        console.error('Stripe Redirect Error:', error);
        throw error;
    }
}
