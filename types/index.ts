export type SkillCategory = 
  | 'All'
  | 'Tech' 
  | 'Creative' 
  | 'Business'
  | 'Language'
  | 'Languages' 
  | 'Academics' 
  | 'Music' 
  | 'Other';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface Skill {
  id?: string;
  profile_id?: string;
  name: string;
  category: Exclude<SkillCategory, 'All'>;
  skill_type?: 'teach' | 'learn';
  level?: SkillLevel | string;
  description?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  full_name?: string;
  avatar_url: string;
  department?: string;
  college: string;
  year_of_study?: string;
  bio?: string;
  rating?: number;
  reviews_count?: number;
  contact?: string; // e.g. WhatsApp, Instagram @handle, Discord, or campus email
  teach_skills: Skill[];
  learn_skills: Skill[];
  availability?: string;
  contact_email?: string;
  github_url?: string;
  linkedin_url?: string;
  created_at?: string;
}

export interface SyncRequest {
  id?: string;
  sender_id?: string;
  sender_name?: string;
  sender_email?: string;
  receiver_id: string;
  receiver_name?: string;
  offered_skill?: string;
  requested_skill?: string;
  preferred_mode?: string;
  note: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: SkillCategory;
  selectedDepartment: string;
  skillTypeFilter: 'all' | 'teach' | 'learn';
}
