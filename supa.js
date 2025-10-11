// =========================
// supabase.jsのよみこみ
// =========================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://あなたのURL.supabase.co";
const supabaseKey = "public-anon-key";
export const supabase = createClient(supabaseUrl, supabaseKey);
// =========================
// 匿名ユーザーIDをlocalStorageで管理
// =========================
export function getUserId() {
  let uid = localStorage.getItem("user_id");
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem("user_id", uid);
  }
  return uid;
}
const urlParams = new URLSearchParams(location.search);
const postId = urlParams.get('file'); // file パラメータを記事IDに利用
// =========================
// 記事のいいねを読み込む
// =========================
export async function loadLikeCount(postId) {
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  return count || 0;
}

// =========================
// ユーザーがいいねしてるか確認
// =========================
export async function hasLiked(postId, userId) {
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// =========================
// いいね or 取り消し
// =========================
export async function toggleLike(postId, userId) {
  const liked = await hasLiked(postId, userId);
  if (liked) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", userId);
    return false; // 取り消し
  } else {
    await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: userId });
    return true; // 新規いいね
  }
}

console.log("postId:", postId, "userId:", uid);