import { createClient } from "../supabase/server";
import { createAdminClient } from "../supabase/admin";
import type { NewsInsert, NewsUpdate } from "../types/database.types";

export async function findAllNews() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function findPublishedNews() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news")
    .select("*, profiles(*)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function findNewsById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function findNewsBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("news")
    .select("*, profiles(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function createNews(newsData: NewsInsert) {
  const supabase = createAdminClient();

  const { data: news, error } = await supabase
    .from("news")
    .insert(newsData)
    .select("*")
    .single();

  if (error) throw error;
  if (!news) throw new Error("News article was created but could not be returned");

  return news;
}

export async function updateNews(id: string, data: NewsUpdate) {
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .update(data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) throw error;

  return news;
}

export async function deleteNews(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) throw error;
}
