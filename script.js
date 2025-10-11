// =========================
// ページ判定
// =========================
const isPostPage = location.pathname.includes("post.html");

// =========================
// 投稿一覧ページの処理
// =========================
async function loadPosts() {
  const res = await fetch("posts.json");
  const posts = await res.json();
  const listEl = document.getElementById("post-list");

  listEl.innerHTML = posts.map(p => `
    <div class="post-item">
      <img src="${p.thumbnail}" alt="${p.title}" class="thumb">
      <div class="post-info">
        <h2><a href="post.html?file=${p.file}">${p.title}</a></h2>
        <p class="date">${p.date}</p>
        <div class="tags">
          ${p.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}
        </div>
      </div>
    </div>
  `).join("");
}

// =========================
// 個別記事ページの処理
// =========================
async function loadPost() {
  const params = new URLSearchParams(location.search);
  const file = params.get("file");
  if (!file) return;

  try {
    const res = await fetch(`./posts/${file}`);
    const text = await res.text();
    const html = marked.parse(text);
    document.getElementById("post-container").innerHTML = html;

    // タイトルをMarkdownの1行目から取得
    const titleMatch = text.match(/^#\s*(.+)/m);
    const title = titleMatch ? titleMatch[1] : "ブログ記事";

    setupShareButton(file, title);
    reloadUtterances(localStorage.getItem("theme") || getPreferredTheme());

  } catch (err) {
    document.getElementById("post-container").textContent = "記事を読み込めませんでした。";
  }
}

// =========================
// 共有ボタン設定
// =========================
function setupShareButton(file, title) {
  const shareBtn = document.getElementById("share-btn");
  if (!shareBtn) return;

  const pageUrl = location.href;
  const text = `「${title}」を読んだよ！`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;
  shareBtn.href = shareUrl;
}

// =========================
// テーマ関連処理
// =========================
const themeButton = document.querySelector("#theme");

function getPreferredTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.body.classList.toggle("dark-mode", theme === "dark");
  if (themeButton) themeButton.textContent = theme === "dark" ? "light_mode" : "dark_mode";
  localStorage.setItem("theme", theme);
  reloadUtterances(theme); // コメントもテーマ更新
}

function toggleTheme() {
  const current = localStorage.getItem("theme") === "dark" ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
}

if (themeButton) {
  themeButton.addEventListener("click", toggleTheme);
}

// =========================
// utterances（コメント）再読み込み
// =========================
function reloadUtterances(theme) {
  const comments = document.getElementById("comments");
  if (!comments) return;

  // 既存を削除
  comments.innerHTML = "";

  const params = new URLSearchParams(location.search);
  const file = params.get("file") || location.pathname;

  // スクリプトを生成
  const script = document.createElement("script");
  script.src = "https://utteranc.es/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("repo", "5l3ep/sl3ep.site");
  script.setAttribute("issue-term", file);
  script.setAttribute("label", "💬 Comment");
  script.setAttribute("theme", theme === "dark" ? "dark-blue" : "github-light");
  comments.appendChild(script);
}

// =========================
// ページ初期化処理
// =========================
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("theme");
  const theme = saved || getPreferredTheme();
  applyTheme(theme);

  if (isPostPage) {
    loadPost();
  } else {
    loadPosts();
  }
});

// =========================
// ブログを検索
// =========================
let allPosts = [];

async function loadPosts() {
  const res = await fetch("posts.json");
  allPosts = await res.json();
  renderPosts(allPosts);
}

function renderPosts(posts) {
  const list = document.getElementById("post-list");
  list.innerHTML = posts.map(p => `
    <div class="post-item">
      <img src="${p.thumbnail}" alt="${p.title}" class="thumb">
      <div class="post-info">
        <h2><a href="post.html?file=${p.file}">${p.title}</a></h2>
        <p class="date">${p.date}</p>
        <div class="tags">
          ${p.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}
        </div>
      </div>
    </div>
  `).join("");
}

document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  const filtered = allPosts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.tags.some(tag => tag.toLowerCase().includes(q))
  );
  renderPosts(filtered);
});

loadPosts();