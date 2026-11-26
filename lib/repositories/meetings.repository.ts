import { createClient } from "../supabase/server";
import type { Database, MeetingInsert, MeetingUpdate } from "../types/database.types";

type Meeting = Database["public"]["Tables"]["meetings"]["Row"];

export async function findAllMeetings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles(*)")
    .order("meeting_date", { ascending: false });

  if (error) throw error;

  return data;
}

export async function findMeetingById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meetings")
    .select("*, profiles(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function createMeeting(meetingData: MeetingInsert) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meetings")
    .insert(meetingData)
    .select("*");

  if (error) throw error;

  return data?.[0] || null;
}

export async function updateMeeting(id: string, meetingData: MeetingUpdate) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meetings")
    .update(meetingData)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function deleteMeeting(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("meetings").delete().eq("id", id);

  if (error) throw error;
}
