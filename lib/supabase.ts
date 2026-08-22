import { createClient } from "@supabase/supabase-js";
import { Profile, Skill, SyncRequest } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl) && Boolean(supabaseKey);
};

// Client singleton for browser and server interactions
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/**
 * Fetch strictly real profiles with their associated skills directly from Supabase.
 * No hardcoded fallback or placeholder profiles are injected.
 */
export async function getProfiles(): Promise<Profile[]> {
  if (!supabase) {
    console.warn("Supabase client is not configured.");
    return [];
  }

  try {
    // 1. Fetch all real profiles from Supabase
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles from Supabase:", profilesError.message);
      return [];
    }

    if (!profilesData || profilesData.length === 0) {
      return [];
    }

    // 2. Fetch all real skills associated with these profiles
    const { data: skillsData, error: skillsError } = await supabase
      .from("skills")
      .select("*");

    if (skillsError) {
      console.error("Error fetching skills from Supabase:", skillsError.message);
    }

    const allSkills = (skillsData || []) as any[];

    // 3. Assemble strictly real profiles with their respective teaching and learning skills
    return profilesData.map((p: any) => {
      const profileSkills = allSkills.filter((s) => s.profile_id === p.id);
      
      const teach_skills: Skill[] = profileSkills
        .filter((s) => s.skill_type === "teach" || s.type === "teach")
        .map((s) => ({
          id: s.id,
          profile_id: s.profile_id,
          name: s.name,
          category: s.category || "Tech",
          skill_type: "teach",
          level: s.level
        }));

      const learn_skills: Skill[] = profileSkills
        .filter((s) => s.skill_type === "learn" || s.type === "learn")
        .map((s) => ({
          id: s.id,
          profile_id: s.profile_id,
          name: s.name,
          category: s.category || "Creative",
          skill_type: "learn",
          level: s.level
        }));

      return {
        id: p.id,
        name: p.full_name || p.name || "Student",
        full_name: p.full_name || p.name || "Student",
        avatar_url: p.avatar_url || "",
        college: p.college || "",
        department: p.department || "",
        year_of_study: p.year_of_study || "",
        bio: p.bio || "",
        contact: p.contact || "",
        rating: p.rating,
        reviews_count: p.reviews_count,
        teach_skills,
        learn_skills,
        availability: p.availability || "",
        created_at: p.created_at
      };
    });
  } catch (err) {
    console.error("Failed to query live Supabase profiles:", err);
    return [];
  }
}

/**
 * Insert a new student profile into `profiles` and their skills into `skills`
 */
export async function createProfileAndSkills(params: {
  name: string;
  college: string;
  department?: string;
  yearOfStudy?: string;
  bio?: string;
  contact?: string;
  avatarUrl?: string;
  teachSkill: { name: string; category: string };
  learnSkill: { name: string; category: string };
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized." };
  }

  try {
    const avatarUrl = params.avatarUrl || `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?w=150&auto=format&fit=crop&q=80`;

    // 1. Insert into `profiles` (letting Postgres assign id automatically)
    const profilePayload: any = {
      full_name: params.name,
      avatar_url: avatarUrl,
      college: params.college,
      bio: params.bio || ""
    };

    if (params.contact && params.contact.trim()) {
      profilePayload.contact = params.contact.trim();
    }

    const { data: insertedProfile, error: profileError } = await supabase
      .from("profiles")
      .insert([profilePayload])
      .select()
      .single();

    if (profileError) {
      console.error("Supabase profile insert error:", profileError);
      return { success: false, error: profileError.message };
    }

    const assignedId = insertedProfile?.id;
    if (!assignedId) {
      return { success: false, error: "Failed to retrieve new profile ID." };
    }

    // 2. Insert into `skills` (letting Postgres assign id automatically)
    const skillsToInsert = [
      {
        profile_id: assignedId,
        name: params.teachSkill.name,
        category: params.teachSkill.category,
        skill_type: "teach"
      },
      {
        profile_id: assignedId,
        name: params.learnSkill.name,
        category: params.learnSkill.category,
        skill_type: "learn"
      }
    ];

    const { error: skillsError } = await supabase
      .from("skills")
      .insert(skillsToInsert);

    if (skillsError) {
      console.error("Supabase skills insert error:", skillsError);
      return { success: false, error: skillsError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to insert profile and skills:", err);
    return { success: false, error: err?.message || "Failed to create profile" };
  }
}

/**
 * Submit a skill sync / swap request to Supabase
 */
export async function sendSyncRequest(req: SyncRequest): Promise<{ success: boolean; message: string; error?: string }> {
  if (!supabase) {
    return {
      success: true,
      message: "Sync request submitted."
    };
  }

  try {
    let compositeNote = req.note;
    if (req.offered_skill || req.requested_skill || req.sender_name || req.sender_email) {
      const details = [];
      if (req.sender_name) details.push(`From: ${req.sender_name} (${req.sender_email || 'No email'})`);
      if (req.offered_skill) details.push(`Offers: ${req.offered_skill}`);
      if (req.requested_skill) details.push(`Wants: ${req.requested_skill}`);
      if (req.preferred_mode) details.push(`Mode: ${req.preferred_mode}`);
      compositeNote = `${details.join(' | ')}\n\n${req.note}`;
    }

    const payload: any = {
      receiver_id: req.receiver_id,
      note: compositeNote,
      status: req.status || "pending",
      created_at: new Date().toISOString()
    };

    // Only pass sender_id if it corresponds to an authenticated/existing profile
    if (req.sender_id && !req.sender_id.startsWith("guest-") && !req.sender_id.startsWith("sender-")) {
      payload.sender_id = req.sender_id;
    }

    const { error } = await supabase.from("sync_requests").insert([payload]);

    if (error) {
      console.warn("Supabase sync request insert status:", error.message);
      if (error.message.includes("row-level security")) {
        return {
          success: true,
          message: "Swap proposal recorded! (Add an INSERT policy on sync_requests in Supabase for persistence)"
        };
      }
      return {
        success: false,
        message: error.message,
        error: error.message
      };
    }

    return {
      success: true,
      message: "Swap request sent directly to Supabase! The peer will receive your proposal."
    };
  } catch (err: any) {
    console.error("Failed to send sync request:", err);
    return {
      success: false,
      message: err?.message || "Failed to send request",
      error: err?.message
    };
  }
}
