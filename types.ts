
export type Category = 'Trabalho' | 'Pessoal' | 'Financeiro' | 'Formulários';

export interface ChecklistItem {
  id: string;
  title: string;
  category: Category;
  description: string;
  isCompleted: boolean;
  needsTranslation: boolean;
  isTranslated: boolean;
  needsApostille: boolean;
  isApostilled: boolean;
  isPersonal?: boolean; // Indica se foi criada pelo usuário
}

export interface UserGoal {
  targetCountry: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  monthlyRequiredIncome: number;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  avatarUrl?: string;
  isOnboarded?: boolean;
  familyContext: 'solo' | 'couple' | 'family';
  childrenCount: number;
  workType: 'employee' | 'freelancer';
  yearsOfExperience: number;
  tier?: 'free' | 'elite' | 'mensal' | 'anual' | 'pro';
  isAdmin?: boolean;
}

export interface ContentArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  isPremium: boolean;
  readTime: string;
  thumbnail: string;
}

/**
 * Interface representing a post in the community area.
 * Added to fix the missing export error in MembersArea.tsx.
 */
export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  category: string;
  timestamp: string;
  likes: number;
  comments: number;
  isElite: boolean;
}
