// =====================
// supa.jsを読み込み
// =====================
import { supabase } from "./supa.js";

if (location.pathname.includes("post.html")) {
  window.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(location.search);
    const file = params.get("file");
    if (!file) return;

    const likeBtn = document.getElementById("like-btn");
    const likeCountEl = document.getElementById("like-count");
    if (!likeBtn || !likeCountEl) return;

    const postId = file; // 記事のID
    const userId = "test-user"; // 仮のユーザーID

// =====================
// いいね数を更新
// =====================
    async function updateLikeCount() {
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId);

      if (error) {
        console.error("いいね数の取得に失敗:", error);
        return;
      }

      // 件数表示
      likeCountEl.textContent = data.length;

      // このユーザーが押してるか判定
      const isLiked = data.some((row) => row.user_id === userId);
      likeBtn.classList.toggle("liked", isLiked);
    }

// =====================
// いいねトグルの処理
// =====================
    async function toggleLike() {
      // 今の状態を確認
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        console.error("いいね確認に失敗:", error);
        return;
      }

      if (data.length > 0) {
        // すでに押してる → 削除
        const { error: delError } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (delError) {
          console.error("いいね削除失敗:", delError);
        }
      } else {
        // 押してない → 追加
        const { error: insError } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: userId });

        if (insError) {
          console.error("いいね追加失敗:", insError);
        }
      }

      // 状態更新
      updateLikeCount();
    }

// =====================
// 初期化
// =====================
    await updateLikeCount();
    likeBtn.addEventListener("click", toggleLike);
  });
}
