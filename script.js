// URLでどのページか判定
const isPostPage = location.pathname.includes("post.html");

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


// 記事を読み込む
async function loadPost() {
  const params = new URLSearchParams(location.search);
  const file = params.get("file");
  if (!file) return;

  try {
    const res = await fetch(`./posts/${file}`);
    const text = await res.text();
    const html = marked.parse(text);
    document.getElementById("post-container").innerHTML = html;
  } catch (err) {
    document.getElementById("post-container").textContent = "記事を読み込めませんでした。";
  }
}

if (isPostPage) {
  loadPost();
} else {
  loadPosts();
}

// 記事読み込みが終わったあとに実行
function setupShareButton(file, title) {
  const shareBtn = document.getElementById("share-btn");
  const pageUrl = location.href;
  const text = `「${title}」を読んだよ！`;

  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`;

  shareBtn.href = shareUrl;
}

async function loadPost() {
  const params = new URLSearchParams(location.search);
  const file = params.get("file");
  if (!file) return;

  try {
    const res = await fetch(`./posts/${file}`);
    const text = await res.text();
    const html = marked.parse(text);
    document.getElementById("post-container").innerHTML = html;

    // タイトルをMarkdownの1行目から取る例
    const titleMatch = text.match(/^#\s*(.+)/);
    const title = titleMatch ? titleMatch[1] : "ブログ記事";
    setupShareButton(file, title);

  } catch (err) {
    document.getElementById("post-container").textContent = "記事を読み込めませんでした。";
  }
}


const themeButton = document.querySelector('#theme');

// テーマ適用関数
function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    themeButton.textContent = 'light_mode';
  } else {
    document.body.classList.remove('dark-mode');
    themeButton.textContent = 'dark_mode';
  }
}

// 初期化（localStorage → OS設定）
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }
});

// クリックでテーマ切り替え＋保存＋再読み込み
themeButton.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark-mode');
  const newTheme = isDark ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);

  // コメント欄含めて再読み込み（確実にutterancesも反映）
  location.reload();
});


// ページ読み込み時にテーマを復元
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark-mode');
});