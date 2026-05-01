-- Criação da tabela coupons
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_percent NUMERIC NOT NULL,
    max_uses INTEGER NOT NULL,
    used_count INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Leituras são permitidas para usuários autenticados (para checar se o cupom existe no frontend se quisermos, embora a edge function fará isso via service_role)
CREATE POLICY "Coupons são visíveis para todos os usuários autenticados" ON public.coupons
    FOR SELECT USING (auth.role() = 'authenticated');

-- Atualizações só pela service_role (Edge Functions)
-- Não precisamos criar política pra service_role pois ela bypassa RLS,
-- mas criamos para garantir.

-- Inserir o cupom NOMAD10
INSERT INTO public.coupons (code, discount_percent, max_uses, used_count, active)
VALUES ('NOMAD10', 10, 10, 0, true)
ON CONFLICT (code) DO NOTHING;
