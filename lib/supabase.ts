
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
  // Códigos comuns de erro de schema: 42P01 (table missing), 42703 (column missing), 42501 (RLS permission)
  if (error.code === '42P01' || error.code === '42703' || error.message?.includes('Could not find') || error.code === '42501') {
    console.group(`⚠️ Supabase Schema Error (${table})`);
    console.error(error);
    console.warn('As tabelas necessárias não foram encontradas ou permissões RLS estão incorretas.');
    console.groupEnd();

    if (onDatabaseErrorCallback) {
      onDatabaseErrorCallback();
    }
    return;
  }
  console.error(`Supabase ${table} Sync Error:`, error.message);
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

/**
 * Utilitário para salvar o checklist no Supabase
 */
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

export async function updateQuizLeadFinal(id: string, result: string, score: number) {
  const { data, error } = await supabase
    .from('quiz_leads')
    .update({
      result,
      score,
      status: 'completed'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    handleSupabaseError(error, 'quiz_leads (update)');
    return null;
  }
  return data;
}

export async function getQuizLeads() {
  const { data, error } = await supabase
    .from('quiz_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    handleSupabaseError(error, 'quiz_leads (select)');
    return [];
  }
  return data;
}

export async function getQuizStats() {
  const { data: allLeads, error } = await supabase
    .from('quiz_leads')
    .select('status, result');

  if (error) {
    handleSupabaseError(error, 'quiz_leads (stats)');
    return null;
  }

  const started = allLeads.length;
  const completed = allLeads.filter(l => l.status === 'completed').length;
  const conversionRate = started > 0 ? (completed / started) * 100 : 0;

  const results = {
    A: allLeads.filter(l => l.result === 'A').length,
    B: allLeads.filter(l => l.result === 'B').length,
    C: allLeads.filter(l => l.result === 'C').length,
  };

  return { started, completed, conversionRate, results };
}
