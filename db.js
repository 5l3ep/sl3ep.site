// =========================
// supabase
// =========================
import { supabase } from './supa.js';

// =========================
// post.htmlのみ実行
// =========================
if (location.pathname.includes("post.html")) {
  window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(location.search);
    const file = params.get("file");
    if (!file) return;

    const likeBtn = document.getElementById("like-btn");
    const likeCountEl = document.getElementById("like-count");
    if (!likeBtn || !likeCountEl) return;

    const postId = file;

    // ブラウザごとに一意のuserIdを生成
    let userId = localStorage.getItem("user-id");
    if (!userId) {
      userId = "user-" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("user-id", userId);
    }

    // =========================
    // 現在のいいね数＋状態を取得
    // =========================
    async function updateLikeCount() {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId);

      if (error) {
        console.error("Failed to fetch like count:", error);
        return;
      }

      likeCountEl.textContent = data.length;

      // 自分がいいね済みか確認してボタンの色を更新
      const { data: liked } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId);

      const isLiked = liked.length > 0;
      likeBtn.classList.toggle("liked", isLiked);
    }

    // =========================
    // いいねボタン押下
    // =========================
    async function toggleLike() {
      const { data } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (data.length > 0) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId });
      }

      await updateLikeCount();
    }

    // =========================
    // リアルタイム反映
    // =========================
    supabase
      .channel("likes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        async (payload) => {
          if (payload.new?.post_id === postId || payload.old?.post_id === postId) {
            await updateLikeCount();
          }
        }
      )
      .subscribe();

    // =========================
    // 初期処理
    // =========================
    await updateLikeCount();
    likeBtn.addEventListener("click", toggleLike);
  });
}