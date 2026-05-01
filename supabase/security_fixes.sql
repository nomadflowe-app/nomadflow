-- 1. Revogar o acesso 'PUBLIC' (que é o padrão do PostgreSQL) de todas as funções afetadas
REVOKE EXECUTE ON FUNCTION public.complete_quiz_lead(uuid, text, integer, jsonb) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.complete_quiz_lead_v2(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.complete_quiz_lead_v2(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.complete_quiz_lead_v3(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.complete_quiz_lead_v4(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text, text, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.increment_comments(uuid) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.protect_admin_column() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.start_quiz_lead_secure(text, text, text, uuid) FROM PUBLIC;


-- 2. Conceder (GRANT) explicitamente o acesso APENAS para os papéis (roles) necessários.
-- As funções do Quiz são usadas por usuários anônimos (anon) antes de fazer o login.
GRANT EXECUTE ON FUNCTION public.complete_quiz_lead(uuid, text, integer, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_quiz_lead_v2(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_quiz_lead_v2(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_quiz_lead_v3(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_quiz_lead_v4(uuid, text, integer, jsonb, text, text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_quiz_lead_secure(text, text, text, uuid) TO anon, authenticated;

-- A função de comentários só deve ser usada por usuários logados (authenticated).
GRANT EXECUTE ON FUNCTION public.increment_comments(uuid) TO authenticated;

-- As funções is_admin() e protect_admin_column() são apenas internas do banco (Triggers e RLS).
-- NÃO damos grant nelas para anon ou authenticated. Assim ninguém consegue chamá-las pela API.
