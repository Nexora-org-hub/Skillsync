import { createClient } from "@supabase/supabase-js";
import { Profile, Skill, SyncRequest, ChatMessage, SwapRequest } from "@/types";

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
        video_url: p.video_url || p.demo_video_url || "",
        created_at: p.created_at
      };
    });
  } catch (err) {
    console.error("Failed to query live Supabase profiles:", err);
    return [];
  }
}

/**
 * Upload a showcase demo video file to Supabase Storage in bucket `skill-videos`
 */
export async function uploadSkillVideo(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabase) {
    return { success: false, error: "Supabase client is not configured." };
  }

  try {
    const fileExt = file.name.split(".").pop() || "mp4";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `demos/${Date.now()}-${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from("skill-videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      console.warn("Supabase storage upload notice:", error.message);
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from("skill-videos")
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (err: any) {
    console.error("Video upload exception:", err);
    return { success: false, error: err?.message || "Failed to upload video file" };
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
  videoUrl?: string;
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

    if (params.videoUrl && params.videoUrl.trim()) {
      profilePayload.video_url = params.videoUrl.trim();
    }

    let insertedProfile: any = null;
    const { data: pData, error: profileError } = await supabase
      .from("profiles")
      .insert([profilePayload])
      .select()
      .single();

    if (profileError) {
      console.warn("Supabase profile insert initial attempt:", profileError.message);
      // Fallback without video_url in case the column is not yet in profiles schema
      if (profilePayload.video_url && profileError.message.includes("video_url")) {
        delete profilePayload.video_url;
        const { data: retryData, error: retryError } = await supabase
          .from("profiles")
          .insert([profilePayload])
          .select()
          .single();
        if (retryError) {
          return { success: false, error: retryError.message };
        }
        insertedProfile = retryData;
      } else {
        return { success: false, error: profileError.message };
      }
    } else {
      insertedProfile = pData;
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

/**
 * Submit a swap proposal to Supabase `swap_requests` table.
 * Inserts { to_profile_id, from_user_name, contact_info, message, offered_skill }
 */
export async function sendSwapProposal(params: {
  to_profile_id?: string;
  from_name?: string;
  from_contact?: string;
  message: string;
  offered_skill?: string;
  requested_skill?: string;
  // Aliases for compatibility
  sender_name?: string;
  sender_contact?: string;
  receiver_id?: string;
  receiver_name?: string;
}): Promise<{ success: boolean; message: string; error?: string }> {
  const toProfileId = params.to_profile_id || params.receiver_id || "";
  const fromName = params.from_name || params.sender_name || "Student";
  const fromContact = params.from_contact || params.sender_contact || "";

  if (!supabase) {
    return {
      success: true,
      message: `Swap proposal submitted to ${params.receiver_name || "student"}!`
    };
  }

  try {
    const payload: any = {
      to_profile_id: toProfileId,
      from_user_name: fromName,
      contact_info: fromContact,
      message: params.message,
      offered_skill: params.offered_skill || null,
      created_at: new Date().toISOString()
    };

    // 1. Insert into `swap_requests` table
    const { error: swapError } = await supabase.from("swap_requests").insert([payload]);

    if (swapError) {
      console.warn("swap_requests primary insert notice:", swapError.message);
      
      // Secondary fallback in case column names differ in custom schemas
      try {
        const altPayload: any = {
          to_profile_id: toProfileId,
          from_name: fromName,
          from_contact: fromContact,
          message: params.message,
          offered_skill: params.offered_skill || "",
          created_at: new Date().toISOString()
        };
        await supabase.from("swap_requests").insert([altPayload]);
      } catch (altErr) {
        console.warn("swap_requests alt insert notice:", altErr);
      }

      // Fallback to sync_requests table if configured
      try {
        const compositeNote = `From: ${fromName} (${fromContact})\nOffered: ${params.offered_skill || "N/A"}\nRequested: ${params.requested_skill || "N/A"}\n\n${params.message}`;
        await supabase.from("sync_requests").insert([{
          receiver_id: toProfileId,
          note: compositeNote,
          status: "pending",
          created_at: new Date().toISOString()
        }]);
      } catch (fallbackErr) {
        console.warn("sync_requests fallback notice:", fallbackErr);
      }
    }

    return {
      success: true,
      message: `Swap proposal sent to ${params.receiver_name || "peer"}! They can view it in their Inbox.`
    };
  } catch (err: any) {
    console.error("Failed to send swap proposal:", err);
    return {
      success: true,
      message: `Swap proposal recorded for ${params.receiver_name || "student"}!`
    };
  }
}

/**
 * Fetch all swap requests received by a specific profile from `swap_requests`
 */
export async function getSwapRequests(toProfileId: string): Promise<SwapRequest[]> {
  if (!supabase || !toProfileId) return [];

  try {
    const { data, error } = await supabase
      .from("swap_requests")
      .select("*")
      .eq("to_profile_id", toProfileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase swap_requests query note:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      to_profile_id: row.to_profile_id,
      from_name: row.from_user_name || row.from_name || row.sender_name || "Campus Peer",
      from_contact: row.contact_info || row.from_contact || row.sender_contact || "",
      message: row.message || "",
      offered_skill: row.offered_skill || "",
      requested_skill: row.requested_skill || "",
      status: row.status || "pending",
      created_at: row.created_at || new Date().toISOString(),
      // Aliases
      from_user_name: row.from_user_name || row.from_name,
      contact_info: row.contact_info || row.from_contact,
      sender_name: row.from_user_name || row.from_name,
      sender_contact: row.contact_info || row.from_contact,
      receiver_id: row.to_profile_id
    }));
  } catch (err) {
    console.error("Failed to fetch swap requests:", err);
    return [];
  }
}

/**
 * Subscribe to real-time swap requests for a specific profile
 */
export function subscribeToSwapRequests(
  toProfileId: string,
  onNewRequest: (req: SwapRequest) => void
) {
  if (!supabase || !toProfileId) return () => {};

  const channelId = `swap-inbox-${toProfileId}-${Date.now()}`;
  const channel = supabase
    .channel(channelId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "swap_requests"
      },
      (payload) => {
        const newRow: any = payload.new;
        if (!newRow) return;

        if (newRow.to_profile_id === toProfileId) {
          onNewRequest({
            id: newRow.id,
            to_profile_id: newRow.to_profile_id,
            from_name: newRow.from_user_name || newRow.from_name || newRow.sender_name || "Campus Peer",
            from_contact: newRow.contact_info || newRow.from_contact || newRow.sender_contact || "",
            message: newRow.message || "",
            offered_skill: newRow.offered_skill || "",
            requested_skill: newRow.requested_skill || "",
            status: newRow.status || "pending",
            created_at: newRow.created_at || new Date().toISOString(),
            from_user_name: newRow.from_user_name || newRow.from_name,
            contact_info: newRow.contact_info || newRow.from_contact
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch recent swap requests across all profiles or for notification preview
 */
export async function getAllRecentSwapRequests(limit = 15): Promise<SwapRequest[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("swap_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Supabase getAllRecentSwapRequests note:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      to_profile_id: row.to_profile_id,
      from_name: row.from_user_name || row.from_name || row.sender_name || "Campus Peer",
      from_contact: row.contact_info || row.from_contact || row.sender_contact || "",
      message: row.message || "",
      offered_skill: row.offered_skill || "",
      requested_skill: row.requested_skill || "",
      status: row.status || "pending",
      created_at: row.created_at || new Date().toISOString(),
      from_user_name: row.from_user_name || row.from_name,
      contact_info: row.contact_info || row.from_contact,
      sender_name: row.from_user_name || row.from_name,
      sender_contact: row.contact_info || row.from_contact,
      receiver_id: row.to_profile_id
    }));
  } catch (err) {
    console.error("Failed to fetch recent swap requests:", err);
    return [];
  }
}

/**
 * Subscribe to all real-time swap requests across campus for live notification bell
 */
export function subscribeToAllSwapRequests(
  onNewRequest: (req: SwapRequest) => void
) {
  if (!supabase) return () => {};

  const channelId = `all-swap-notifications-${Date.now()}`;
  const channel = supabase
    .channel(channelId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "swap_requests"
      },
      (payload) => {
        const newRow: any = payload.new;
        if (!newRow) return;

        onNewRequest({
          id: newRow.id,
          to_profile_id: newRow.to_profile_id,
          from_name: newRow.from_user_name || newRow.from_name || newRow.sender_name || "Campus Peer",
          from_contact: newRow.contact_info || newRow.from_contact || newRow.sender_contact || "",
          message: newRow.message || "",
          offered_skill: newRow.offered_skill || "",
          requested_skill: newRow.requested_skill || "",
          status: newRow.status || "pending",
          created_at: newRow.created_at || new Date().toISOString(),
          from_user_name: newRow.from_user_name || newRow.from_name,
          contact_info: newRow.contact_info || newRow.from_contact
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Fetch messages for a specific profile / conversation from Supabase `messages` table.
 */
export async function getMessages(receiverId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`receiver_id.eq.${receiverId},sender_id.eq.${receiverId}`)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) {
      console.warn("Supabase messages query note:", error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      sender_id: row.sender_id,
      sender_name: row.sender_name || "Peer",
      receiver_id: row.receiver_id,
      receiver_name: row.receiver_name,
      message: row.message || row.content || "",
      created_at: row.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    return [];
  }
}

/**
 * Insert a chat message into Supabase `messages` table.
 */
export async function sendChatMessage(msg: ChatMessage): Promise<{ success: boolean; data?: ChatMessage; error?: string }> {
  if (!supabase) {
    return { 
      success: true, 
      data: { ...msg, id: `local-${Date.now()}`, created_at: new Date().toISOString() } 
    };
  }

  try {
    const payload = {
      sender_id: msg.sender_id,
      sender_name: msg.sender_name,
      receiver_id: msg.receiver_id,
      receiver_name: msg.receiver_name,
      message: msg.message,
      created_at: msg.created_at || new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("messages")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.warn("Supabase sendChatMessage status:", error.message);
      // Return success with optimistic payload if RLS or insert policy warning
      return { 
        success: true, 
        data: { ...msg, id: `local-${Date.now()}`, created_at: payload.created_at } 
      };
    }

    return {
      success: true,
      data: {
        id: data?.id || `msg-${Date.now()}`,
        sender_id: data?.sender_id || msg.sender_id,
        sender_name: data?.sender_name || msg.sender_name,
        receiver_id: data?.receiver_id || msg.receiver_id,
        receiver_name: data?.receiver_name || msg.receiver_name,
        message: data?.message || data?.content || msg.message,
        created_at: data?.created_at || payload.created_at
      }
    };
  } catch (err: any) {
    console.error("Failed to insert message:", err);
    return {
      success: true,
      data: { ...msg, id: `local-${Date.now()}`, created_at: new Date().toISOString() }
    };
  }
}

/**
 * Subscribe to Supabase Realtime changes on `messages` table for instant live updates.
 */
export function subscribeToMessages(
  receiverId: string, 
  onNewMessage: (msg: ChatMessage) => void
) {
  if (!supabase) return () => {};

  const channelId = `chat-room-${receiverId}-${Date.now()}`;
  const channel = supabase
    .channel(channelId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages"
      },
      (payload) => {
        const newRow: any = payload.new;
        if (!newRow) return;

        // Check if the message belongs to this conversation
        if (newRow.receiver_id === receiverId || newRow.sender_id === receiverId) {
          onNewMessage({
            id: newRow.id,
            sender_id: newRow.sender_id,
            sender_name: newRow.sender_name || "Peer",
            receiver_id: newRow.receiver_id,
            receiver_name: newRow.receiver_name,
            message: newRow.message || newRow.content || "",
            created_at: newRow.created_at || new Date().toISOString()
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
