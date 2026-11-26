import { createClient } from "../supabase/server";
import type { Database, MeetingMinuteInsert, MeetingMinuteUpdate } from "../types/database.types";

type MeetingMinute = Database["public"]["Tables"]["meeting_minutes"]["Row"];

export async function findMinutesByMeetingId(meetingId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_minutes")
    .select("*, profiles(*)")
    .eq("meeting_id", meetingId)
    .order("version", { ascending: false });

  if (error) throw error;

  return data;
}

export async function createMinute(minuteData: MeetingMinuteInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_minutes")
    .insert(minuteData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function updateMinute(id: string, minuteData: MeetingMinuteUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meeting_minutes")
    .update(minuteData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function deleteMinute(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("meeting_minutes").delete().eq("id", id);

  if (error) throw error;
}
