import { createClient } from "../supabase/server";
import type { Database, MeetingActionItemInsert, MeetingActionItemUpdate } from "../types/database.types";

type MeetingActionItem = Database["public"]["Tables"]["meeting_action_items"]["Row"];

export async function findActionItemsByMeetingId(meetingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_action_items")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}

export async function createActionItem(actionItemData: MeetingActionItemInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_action_items")
    .insert(actionItemData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function updateActionItem(id: string, actionItemData: MeetingActionItemUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_action_items")
    .update(actionItemData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function deleteActionItem(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("meeting_action_items").delete().eq("id", id);

  if (error) throw error;
}
