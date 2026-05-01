-- Segurança Definitiva para o Quiz
-- Fecha o buraco de leitura pública

-- 1. Removemos a política que deixava tudo aberto para leitura anônima
DROP POLICY IF EXISTS "Leads are viewable by ID (for quiz flow)" ON public.quiz_leads;

-- 2. Criamos uma função segura (Security Definer) para iniciar o quiz
-- Isso permite salvar e retornar o ID gerado sem precisar abrir o banco para leitura
CREATE OR REPLACE FUNCTION public.start_quiz_lead_secure(p_name text, p_email text, p_phone text, p_user_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public' AS $$
DECLARE
  v_record jsonb;
BEGIN
  INSERT INTO public.quiz_leads (name, email, phone, user_id, status)
  VALUES (p_name, p_email, p_phone, p_user_id, 'started')
  RETURNING to_jsonb(quiz_leads.*) INTO v_record;
  
  RETURN v_record;
END;
$$;

GRANT EXECUTE ON FUNCTION public.start_quiz_lead_secure TO anon, authenticated;
