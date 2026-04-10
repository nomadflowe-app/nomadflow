
import { createClient } from '@supabase/supabase-js';
import { UserProfile } from '../types';

/* 
  ⚠️ COMANDO SQL DE SEGURANÇA (RLS) ⚠️
  
  O script completo está disponível no componente DatabaseSetup.tsx
  e será exibido na tela caso as tabelas não existam.
*/

// Carrega variáveis com fallback seguro para não quebrar a compilação
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://your-project.supabase.co') {
  console.error(
    "🚨 CRITICAL ERROR: Supabase environment variables are missing! \n" +
    "Please create a .env file based on .env.example and restart the server."
  );
  // Fallback to prevent crash, but app won't work
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

console.log('[Supabase Debug] Client initialized with:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  keyStart: supabaseAnonKey?.substring(0, 5)
});

// --- ERROR HANDLING SYSTEM ---
let onDatabaseErrorCallback: (() => void) | null = null;

export const setOnDatabaseError = (callback: () => void) => {
  onDatabaseErrorCallback = callback;
};

function handleSupabaseError(error: any, table: string) {
  // Códigos comuns de erro de schema: 42P01 (table missing), 42703 (column missing)
  // O código 42501 é RLS (permissão), não deve disparar o setup se o usuário apenas não for admin
  const isSchemaError = error.code === '42P01' || error.code === '42703' || error.message?.includes('Could not find');

  if (isSchemaError) {
    console.group(`⚠️ Supabase Schema Error (${table})`);
    console.error(error);
    console.warn('As tabelas necessárias não foram encontradas ou colunas estão faltando.');
    console.groupEnd();

    if (onDatabaseErrorCallback) {
      onDatabaseErrorCallback();
    }
    return;
  }

  // Apenas loga para erros de permissão ou outros
  console.error(`Supabase ${table} Sync Error:`, error.message, error.code === '42501' ? '(Possível falta de permissão Admin)' : '');
}

// --- AUTHENTICATION FUNCTIONS ---

export async function signInUser(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signUpUser(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName } // Salva no metadata do Auth
    }
  });
  return { data, error };
}

export async function signInWithGoogle() {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin // Redireciona de volta para o app
    }
  });
}

export async function signOutUser() {
  return await supabase.auth.signOut();
}

/**
 * Busca o perfil do usuário atual no banco de dados
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // Se o erro for de tabela inexistente, dispara o setup
      if (error.code === '42P01') handleSupabaseError(error, 'profiles');
      return null;
    }

    // Mapeia do formato do banco (snake_case) para o formato do app (camelCase)
    if (data) {
      return {
        fullName: data.full_name,
        email: data.email,
        familyContext: data.family_context || 'solo',
        childrenCount: data.children_count || 0,
        workType: data.work_type || 'employee',
        yearsOfExperience: data.years_of_experience || 0,
        phone: data.phone || '',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        avatarUrl: data.avatar_url || '',
        tier: data.tier || 'free',
        isAdmin: data.is_admin || false,
        hasSpanishAccess: data.tier === 'anual' || data.tier === 'elite' || data.tier === 'pro',
        subscribedAt: data.subscribed_at,
        isOnboarded: true // Se existe no banco, já fez onboarding
      } as UserProfile;
    }
    return null;
  } catch (error: any) {
    handleSupabaseError(error, 'profiles');
    return null;
  }
}


// --- DATA SYNC FUNCTIONS ---

/**
 * Garante que o usuário tenha uma sessão antes de salvar dados.
 */
async function ensureAuth() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) return session.user.id;
  } catch (e) {
    console.error("Erro ao verificar sessão:", e);
  }
  return null;
}

/**
 * Utilitário para salvar o perfil completo do usuário no Supabase
 */
export async function syncProfile(profile: any) {
  if (!profile?.email) return;

  try {
    const userId = await ensureAuth();
    if (!userId) return; // Aborta se a autenticação falhar

    const { error } = await supabase
      .from('profiles')
      .upsert({
        email: profile.email,
        user_id: userId, // Vincula ao ID seguro
        full_name: profile.fullName || '',
        family_context: profile.familyContext || 'solo',
        children_count: profile.childrenCount || 0,
        work_type: profile.workType || 'employee',
        years_of_experience: profile.yearsOfExperience || 0,
        phone: profile.phone || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        avatar_url: profile.avatarUrl || '',
        tier: profile.tier || 'free',
        is_admin: profile.isAdmin === true ? true : undefined, // Apenas define se for true para evitar sobrescrever admin manual
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      handleSupabaseError(error, 'profiles');
      return;
    }
  } catch (err: any) {
    handleSupabaseError(err, 'profiles');
  }
}

/**
 * Utilitário para salvar a meta financeira do usuário
 */
export async function syncGoal(email: string, goal: any) {
  if (!email || !goal) return;

  try {
    const userId = await ensureAuth();
    if (!userId) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        target_amount: goal.targetAmount || 0,
        current_amount: goal.currentAmount || 0,
        monthly_required_income: goal.monthlyRequiredIncome || 0,
        currency: goal.currency || '€',
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .eq('user_id', userId);

    if (error) {
      handleSupabaseError(error, 'profiles (goals)');
      return;
    }
  } catch (err: any) {
    handleSupabaseError(err, 'profiles (goals)');
  }
}

export async function getGoal(email: string) {
  if (!email) return null;

  try {
    const userId = await ensureAuth();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('target_amount, current_amount, monthly_required_income, currency')
      .eq('email', email)
      .eq('user_id', userId)
      .single();

    if (error) {
      // If no goal set found, returns null without erroring aggressively
      if (error.code !== 'PGRST116') {
        handleSupabaseError(error, 'profiles (get goal)');
      }
      return null;
    }

    if (data) {
      return {
        targetAmount: data.target_amount || 0,
        currentAmount: data.current_amount || 0,
        monthlyRequiredIncome: data.monthly_required_income || 0,
        currency: data.currency || '€'
      };
    }
    return null;
  } catch (err: any) {
    handleSupabaseError(err, 'profiles (get goal)');
    return null;
  }
}

/**
 * Utilitário para salvar o checklist no Supabase
 */
// ... (previous content)
export async function syncChecklist(email: string, checklist: any[]) {
  if (!email || !checklist) return;

  try {
    const userId = await ensureAuth();
    if (!userId) return;

    const { error } = await supabase
      .from('checklists')
      .upsert({
        email: email,
        user_id: userId,
        items: checklist,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      handleSupabaseError(error, 'checklists');
      return;
    }
  } catch (err: any) {
    handleSupabaseError(err, 'checklists');
  }
}


export async function getChecklist(email: string) {
  console.log('[Supabase.ts] getChecklist called for:', email);
  if (!email) return [];

  // FORCE FRESH SESSION CHECK
  const userId = await ensureAuth();
  console.log('[Supabase.ts] ensureAuth returned:', userId);

  if (!userId) {
    console.warn('[Supabase.ts] No user ID found for checklist retrieval.');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('checklists')
      .select('items')
      .eq('email', email)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, 'checklists (get)');
      return [];
    }

    console.log('[Supabase.ts] Checklist items found:', data?.items?.length || 0);
    return data?.items || [];
  } catch (err: any) {
    handleSupabaseError(err, 'checklists (get)');
    return [];
  }
}

// --- CONTENT MANAGEMENT FUNCTIONS ---

export async function getGuides() {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    handleSupabaseError(error, 'guides');
    return [];
  }
  return data;
}

export async function getTutorials() {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    handleSupabaseError(error, 'tutorials');
    return [];
  }
  return data;
}

export async function getCommunityPosts() {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'community_posts');
    return [];
  }
  return data;
}

export async function createCommunityPost(post: {
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  category: string;
  isElite: boolean;
}) {
  const { data, error } = await supabase
    .from('community_posts')
    .insert([{
      user_id: post.userId,
      user_name: post.userName,
      user_avatar: post.userAvatar,
      content: post.content,
      category: post.category,
      is_elite: post.isElite
    }])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'community_posts (insert)');
    return null;
  }
  return data;
}

// --- ADMIN FUNCTIONS ---

export async function deleteGuide(id: string) {
  const { error } = await supabase
    .from('guides')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, 'guides (delete)');
    return false;
  }
  return true;
}

export async function createGuide(guide: any) {
  const { data, error } = await supabase
    .from('guides')
    .insert([guide])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'guides (create)');
    return null;
  }
  return data;
}

export async function updateGuide(id: string, updates: any) {
  const { data, error } = await supabase
    .from('guides')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'guides (update)');
    return null;
  }
  return data;
}

export async function deleteTutorial(id: string) {
  const { error } = await supabase
    .from('tutorials')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, 'tutorials (delete)');
    return false;
  }
  return true;
}

export async function createTutorial(tutorial: any) {
  // Converte camelCase para snake_case se necessário para o banco
  const dataToInsert = {
    title: tutorial.title,
    instructor: tutorial.instructor,
    duration: tutorial.duration,
    thumbnail: tutorial.thumbnail,
    youtube_id: tutorial.video_url || tutorial.youtube_id, // Aceita ambos para compatibilidade
    playlist: tutorial.playlist || 'Geral',
    is_dripped: tutorial.isDripped || false
  };

  const { data, error } = await supabase
    .from('tutorials')
    .insert([dataToInsert])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'tutorials (create)');
    return null;
  }
  return data;
}

export async function updateTutorial(id: string, updates: any) {
  // Converte camelCase para snake_case se necessário para o banco
  const dataToUpdate: any = {};
  if (updates.title) dataToUpdate.title = updates.title;
  if (updates.instructor) dataToUpdate.instructor = updates.instructor;
  if (updates.duration) dataToUpdate.duration = updates.duration;
  if (updates.thumbnail) dataToUpdate.thumbnail = updates.thumbnail;
  if (updates.video_url || updates.youtube_id) dataToUpdate.youtube_id = updates.video_url || updates.youtube_id;
  if (updates.playlist) dataToUpdate.playlist = updates.playlist;
  if (updates.isDripped !== undefined) dataToUpdate.is_dripped = updates.isDripped;

  const { data, error } = await supabase
    .from('tutorials')
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'tutorials (update)');
    return null;
  }
  return data;
}

export async function deleteCommunityPost(id: string) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, 'community_posts (delete)');
    return false;
  }
  return true;
}

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    handleSupabaseError(error, 'community_comments (select)');
    return [];
  }
  return data;
}

export async function createComment(comment: { post_id: string; user_id: string; user_name: string; user_avatar: string; content: string }) {
  const { data, error } = await supabase
    .from('community_comments')
    .insert([comment])
    .select()
    .single();

  if (!error) {
    // Increment comment count on post
    await supabase.rpc('increment_comments', { post_id: comment.post_id }); // Note: You might need to create this RPC or do a manual update
    // Simple manual update fallback if RPC doesn't exist
    const { data: post } = await supabase.from('community_posts').select('comments').eq('id', comment.post_id).single();
    if (post) {
      await supabase.from('community_posts').update({ comments: (post.comments || 0) + 1 }).eq('id', comment.post_id);
    }
  }

  return { data, error };
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('community_posts')
    .delete()
    .eq('id', postId);
  return { error };
}


export async function deleteComment(commentId: string, postId: string) {
  const { error } = await supabase
    .from('community_comments')
    .delete()
    .eq('id', commentId);

  if (!error) {
    // Decrement comment count
    const { data: post } = await supabase.from('community_posts').select('comments').eq('id', postId).single();
    if (post && post.comments > 0) {
      await supabase.from('community_posts').update({ comments: post.comments - 1 }).eq('id', postId);
    }
  }

  return { error };
}

export async function updateCommunityPost(id: string, updates: { content: string; category?: string }) {
  const { data, error } = await supabase
    .from('community_posts')
    .update({
      content: updates.content,
      category: updates.category
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'community_posts (update)');
    return null;
  }
  return data;
}

export async function getLikeStatus(postId: string, userId: string) {
  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  return !!data;
}

export async function toggleLike(postId: string, userId: string): Promise<{ liked: boolean, count: number } | null> {
  if (!userId) return null;

  // 1. Check if liked
  const { data: existingLike } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  let isLiked = false;

  if (existingLike) {
    // UNLIKE
    await supabase.from('post_likes').delete().eq('id', existingLike.id);
    isLiked = false;
  } else {
    // LIKE
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    isLiked = true;
  }

  // 2. Get fresh count (reliable source of truth)
  const { count } = await supabase
    .from('post_likes')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', postId);

  // 3. Update denormalized count in community_posts for easier reading elsewhere
  await supabase
    .from('community_posts')
    .update({ likes: count || 0 })
    .eq('id', postId);

  return { liked: isLiked, count: count || 0 };
}

// --- PARTNERS FUNCTIONS ---

export async function getPartners() {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    handleSupabaseError(error, 'partners (select)');
    return [];
  }
  return data;
}

export async function createPartner(partner: any) {
  const { data, error } = await supabase
    .from('partners')
    .insert([partner])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'partners (create)');
    return null;
  }
  return data;
}

export async function updatePartner(id: string, updates: any) {
  const { data, error } = await supabase
    .from('partners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'partners (update)');
    return null;
  }
  return data;
}

export async function deletePartner(id: string) {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, 'partners (delete)');
    return false;
  }
  return true;
}

export async function createNotification(notification: { title: string; message: string; type: string; action_url?: string }) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'notifications (create)');
    return null;
  }
  return data;
}
// --- QUIZ LEADS FUNCTIONS ---

export async function saveQuizLeadInitial(lead: { name: string; email: string; phone: string; user_id?: string }) {
  const { data, error } = await supabase
    .from('quiz_leads')
    .insert([{
      ...lead,
      status: 'started'
    }])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'quiz_leads (insert)');
    return null;
  }
  return data;
}

export async function updateQuizLeadFinal(id: string, result: string, score: number, answers?: any[]) {
  try {
    console.log('[Supabase] Calling RPC complete_quiz_lead_v4 for:', id, 'Result:', result);
    const { data, error } = await supabase.rpc('complete_quiz_lead_v4', {
      p_lead_id: id,
      p_result: result,
      p_score: score,
      p_answers: answers || [],
      p_remote_work: answers?.find((a: any) => a.id === 'remote_work')?.value || null,
      p_income_source: answers?.find((a: any) => a.id === 'income_source')?.value || null,
      p_job_tenure: answers?.find((a: any) => a.id === 'job_tenure')?.value || null,
      p_company_age: answers?.find((a: any) => a.id === 'company_age')?.value || null,
      p_family_config: answers?.find((a: any) => a.id === 'family_config')?.value || null,
      p_kids_count: answers?.find((a: any) => a.id === 'kids_count')?.value || null,
      p_salary: answers?.find((a: any) => a.id === 'salary')?.value || null,
      p_income_proof: answers?.find((a: any) => a.id === 'income_proof')?.value || null,
      p_qualification: answers?.find((a: any) => a.id === 'qualification')?.value || null,
      p_criminal_record: answers?.find((a: any) => a.id === 'criminal_record')?.value || null,
      p_time_spain: answers?.find((a: any) => a.id === 'time_spain')?.value || null
    });

    if (error) {
      console.error('[Supabase] RPC V3 Error:', error);
      handleSupabaseError(error, 'quiz_leads (rpc)');
      // Fallback to regular update if RPC fails
      const fallbackData = await fallbackUpdate(id, result, score, answers);
      return fallbackData;
    }

    if (!data) {
      console.warn('[Supabase] RPC V3 returned null (ID not found?)');
      return null;
    }

    console.log('[Supabase] RPC V3 success:', data.id);
    return data;
  } catch (err: any) {
    console.error('[Supabase] Critical RPC V3 Error:', err);
    handleSupabaseError(err, 'quiz_leads (final)');
    return null;
  }
}

async function fallbackUpdate(id: string, result: string, score: number, answers?: any[]) {
  const updateData: any = {
    result,
    score,
    status: 'completed'
  };

  if (answers) {
    updateData.answers = answers;
    // Populate columns manually for fallback
    updateData.remote_work = answers.find((a: any) => a.id === 'remote_work')?.value;
    updateData.income_source = answers.find((a: any) => a.id === 'income_source')?.value;
    updateData.job_tenure = answers.find((a: any) => a.id === 'job_tenure')?.value;
    updateData.company_age = answers.find((a: any) => a.id === 'company_age')?.value;
    updateData.family_config = answers.find((a: any) => a.id === 'family_config')?.value;
    updateData.kids_count = answers.find((a: any) => a.id === 'kids_count')?.value;
    updateData.salary = answers.find((a: any) => a.id === 'salary')?.value;
    updateData.income_proof = answers.find((a: any) => a.id === 'income_proof')?.value;
    updateData.qualification = answers.find((a: any) => a.id === 'qualification')?.value;
    updateData.criminal_record = answers.find((a: any) => a.id === 'criminal_record')?.value;
    updateData.time_spain = answers.find((a: any) => a.id === 'time_spain')?.value;
  }

  const { data, error } = await supabase
    .from('quiz_leads')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Fallback update error:', error);
    // If it's an RLS error, we can't do much from here, but logging helps debug
    return null;
  }
  return data || null;
}

export async function updateQuizLeadProgress(id: string, answers: any[]) {
  const { error } = await supabase
    .from('quiz_leads')
    .update({
      answers: answers
    })
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, 'quiz_leads (progress)');
  }
}

export async function getQuizLeads() {
  console.log('[Supabase] Fetching quiz leads...');
  let allLeads: any[] = [];
  let from = 0;
  const step = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('quiz_leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + step - 1);

    if (error) {
      handleSupabaseError(error, 'quiz_leads (select)');
      break;
    }

    if (!data || data.length === 0) break;
    allLeads = [...allLeads, ...data];
    if (data.length < step) break;
    from += step;

    // Safety break to avoid infinite loop if something goes wrong
    if (allLeads.length > 10000) break;
  }

  console.log('[Supabase] Total leads fetched:', allLeads.length);
  return allLeads;
}

export async function getQuizStats() {
  const [allRes, compRes, aRes, bRes, cRes] = await Promise.all([
    supabase.from('quiz_leads').select('id', { count: 'exact', head: true }),
    supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('result', 'A'),
    supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('result', 'B'),
    supabase.from('quiz_leads').select('id', { count: 'exact', head: true }).eq('result', 'C'),
  ]);

  if (allRes.error) {
    handleSupabaseError(allRes.error, 'quiz_leads (stats)');
    return null;
  }

  const started = allRes.count || 0;
  const completed = compRes.count || 0;
  const conversionRate = started > 0 ? (completed / started) * 100 : 0;

  const results = {
    A: aRes.count || 0,
    B: bRes.count || 0,
    C: cRes.count || 0,
  };

  return { started, completed, conversionRate, results };
}

// --- SCHEDULING FUNCTIONS ---

/**
 * Busca slots de consulta disponíveis (não reservados ou com reserva expirada)
 */
export async function getConsultationSlots() {
  console.log('[Supabase Debug] Iniciando busca absoluta de slots...');
  try {
    // Busca SEM FILTROS para testar conectividade total
    const { data: slots, error } = await supabase
      .from('consultation_slots')
      .select('*, consultation_bookings(id, payment_status, created_at)')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[Supabase Error] Erro na busca raw:', error);
      return [];
    }

    console.log('>>>> DADOS RECEBIDOS DO BANCO:', slots);

    if (!slots || slots.length === 0) {
      console.warn('[Supabase Warning] O banco retornou ARRAY VAZIO []. Verifique RLS.');
      return [];
    }

    const now = new Date();
    const EXPIRATION_MS = 20 * 60 * 1000;

    const availableSlots = slots.filter(slot => {
      // 1. Apenas slots futuros (ou de hoje)
      const slotTime = new Date(slot.start_time);
      if (slotTime < now && !isToday(slotTime)) return false;

      const bookings = Array.isArray(slot.consultation_bookings) ? slot.consultation_bookings : [];
      
      const isPaid = bookings.some((b: any) => b.payment_status === 'paid');
      if (isPaid) return false;

      const hasRecentPending = bookings.some((b: any) => 
        b.payment_status === 'pending' && 
        b.created_at &&
        (now.getTime() - new Date(b.created_at).getTime()) < EXPIRATION_MS
      );
      if (hasRecentPending) return false;

      return true;
    });

    console.log('[Supabase Debug] Slots após filtragem local:', availableSlots.length);
    return availableSlots;

  } catch (err) {
    console.error('[Supabase Critical Error]:', err);
    return [];
  }
}

function isToday(date: Date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Cria um novo agendamento (inicialmente pendente)
 */
export async function createConsultationBooking(booking: {
  slot_id: string;
  name: string;
  email: string;
  whatsapp: string;
}) {
  const { data, error } = await supabase
    .from('consultation_bookings')
    .insert([booking])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'consultation_bookings (insert)');
    return null;
  }
  return data;
}

/**
 * Atualiza o status de pagamento de um agendamento
 */
export async function updateBookingPaymentStatus(id: string, status: 'paid' | 'cancelled', paymentId: string) {
  const { data, error } = await supabase
    .from('consultation_bookings')
    .update({ 
      payment_status: status,
      payment_id: paymentId 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'consultation_bookings (update)');
    return null;
  }

  // Se o pagamento foi confirmado, marcamos o slot como reservado
  if (status === 'paid' && data.slot_id) {
    await supabase
      .from('consultation_slots')
      .update({ is_booked: true })
      .eq('id', data.slot_id);
  }

  return data;
}

// --- ADMIN SCHEDULING FUNCTIONS ---

export async function adminGetBookings() {
  const { data, error } = await supabase
    .from('consultation_bookings')
    .select('*, consultation_slots(*)')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'consultation_bookings (admin select)');
    return [];
  }
  return data || [];
}

export async function adminGetAllSlots() {
  const { data, error } = await supabase
    .from('consultation_slots')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    handleSupabaseError(error, 'consultation_slots (admin select)');
    return [];
  }
  return data || [];
}

export async function adminCreateSlot(slot: { start_time: string; end_time: string; price: number }) {
  const { data, error } = await supabase
    .from('consultation_slots')
    .insert([slot])
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'consultation_slots (insert)');
    return null;
  }
  return data;
}

export async function adminCreateBulkSlots(slots: { start_time: string; end_time: string; price: number }[]) {
  const { data, error } = await supabase
    .from('consultation_slots')
    .insert(slots)
    .select();

  if (error) {
    handleSupabaseError(error, 'consultation_slots (bulk insert)');
    return null;
  }
  return data;
}

export async function adminDeleteSlot(id: string) {
  const { error } = await supabase
    .from('consultation_slots')
    .delete()
    .eq('id', id);

  if (error) {
    handleSupabaseError(error, 'consultation_slots (delete)');
    return false;
  }
  return true;
}

export async function adminDeleteAllUnbookedSlots() {
  const { error } = await supabase
    .from('consultation_slots')
    .delete()
    .eq('is_booked', false);

  if (error) {
    handleSupabaseError(error, 'consultation_slots (delete all unbooked)');
    return false;
  }
  return true;
}

export async function adminRescheduleBooking(bookingId: string, oldSlotId: string | null, newSlotId: string) {
  // 1. Free the old slot if it exists
  if (oldSlotId) {
    await supabase.from('consultation_slots').update({ is_booked: false }).eq('id', oldSlotId);
  }
  
  // 2. Mark the new slot as booked
  await supabase.from('consultation_slots').update({ is_booked: true }).eq('id', newSlotId);

  // 3. Update the booking with the new slot
  const { data, error } = await supabase
    .from('consultation_bookings')
    .update({ slot_id: newSlotId })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'consultation_bookings (reschedule)');
    return false;
  }
  return true;
}
