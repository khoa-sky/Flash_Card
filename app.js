// Dữ liệu mẫu chuẩn theo tài liệu specification
const DEFAULT_CARDS = [
  { id: "1", word: "beautiful", meaning: "xinh đẹp" },
  { id: "2", word: "journey", meaning: "hành trình" },
  { id: "3", word: "improve", meaning: "cải thiện" },
  { id: "4", word: "curious", meaning: "tò mò" },
  { id: "5", word: "peaceful", meaning: "bình yên" },
  { id: "6", word: "discover", meaning: "khám phá" },
];

const STORAGE_KEY = "easycards_items_v1";

// Lấy danh sách thẻ từ LocalStorage hoặc khởi tạo dữ liệu mẫu
function loadCards() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data !== null) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Lỗi đọc LocalStorage:", e);
    }
  }
  // Mặc định lưu dữ liệu mẫu lần đầu
  saveCards(DEFAULT_CARDS);
  return [...DEFAULT_CARDS];
}

// Lưu danh sách thẻ vào LocalStorage
function saveCards(cards) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

// Khởi tạo state
let cards = loadCards();

// DOM Elements
const form = document.getElementById("createCardForm");
const wordInput = document.getElementById("englishWord");
const meaningInput = document.getElementById("vietnameseMeaning");
const groupWord = document.getElementById("groupWord");
const groupMeaning = document.getElementById("groupMeaning");
const cardGrid = document.getElementById("cardGrid");
const emptyState = document.getElementById("emptyState");
const btnResetDefault = document.getElementById("btnResetDefault");

// Render toàn bộ danh sách thẻ
function renderCards() {
  cardGrid.innerHTML = "";

  if (cards.length === 0) {
    emptyState.classList.add("is-visible");
    return;
  }

  emptyState.classList.remove("is-visible");

  cards.forEach((card) => {
    const cardEl = createCardElement(card);
    cardGrid.appendChild(cardEl);
  });
}

// Tạo phần tử DOM cho 1 Flashcard (với hiệu ứng 3D flip)
function createCardElement(card) {
  const container = document.createElement("div");
  container.className = "flip-card";
  container.setAttribute("role", "button");
  container.setAttribute("tabindex", "0");
  container.setAttribute("aria-label", `Flashcard: ${card.word}`);

  container.innerHTML = `
    <div class="flip-card-inner">
      <!-- Mặt trước: Từ tiếng Anh -->
      <div class="flip-card-front">
        <button type="button" class="btn-delete-card" title="Xóa thẻ" aria-label="Xóa thẻ">&times;</button>
        <span class="card-word">${escapeHtml(card.word)}</span>
        <span class="card-hint">Nhấn để xem nghĩa</span>
      </div>
      <!-- Mặt sau: Nghĩa tiếng Việt -->
      <div class="flip-card-back">
        <button type="button" class="btn-delete-card" title="Xóa thẻ" aria-label="Xóa thẻ">&times;</button>
        <span class="card-meaning">${escapeHtml(card.meaning)}</span>
        <span class="card-hint">Nhấn để xem từ</span>
      </div>
    </div>
  `;

  // Xử lý sự kiện lật thẻ khi click hoặc nhấn phím Space / Enter
  const toggleFlip = () => {
    container.classList.toggle("is-flipped");
  };

  container.addEventListener("click", toggleFlip);
  container.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFlip();
    }
  });

  // Xử lý nút xóa thẻ (ngăn chặn sự kiện lật)
  const deleteBtns = container.querySelectorAll(".btn-delete-card");
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteCard(card.id);
    });
  });

  return container;
}

// Xóa một thẻ
function deleteCard(id) {
  cards = cards.filter((c) => c.id !== id);
  saveCards(cards);
  renderCards();
}

// Xử lý nộp form tạo Flashcard
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const word = wordInput.value.trim();
  const meaning = meaningInput.value.trim();

  let hasError = false;

  if (!word) {
    groupWord.classList.add("has-error");
    hasError = true;
  } else {
    groupWord.classList.remove("has-error");
  }

  if (!meaning) {
    groupMeaning.classList.add("has-error");
    hasError = true;
  } else {
    groupMeaning.classList.remove("has-error");
  }

  if (hasError) {
    form.classList.add("is-invalid");
    if (!word) wordInput.focus();
    else meaningInput.focus();
    return;
  }

  // Hợp lệ -> Xóa trạng thái lỗi
  clearFormErrors();

  // Thêm thẻ mới vào đầu danh sách
  const newCard = {
    id: Date.now().toString(),
    word: word,
    meaning: meaning,
  };

  cards.unshift(newCard);
  saveCards(cards);
  renderCards();

  // Reset input
  wordInput.value = "";
  meaningInput.value = "";
  wordInput.focus();
});

// Xóa lỗi khi người dùng bắt đầu nhập
wordInput.addEventListener("input", () => {
  if (wordInput.value.trim()) {
    groupWord.classList.remove("has-error");
    if (meaningInput.value.trim()) {
      form.classList.remove("is-invalid");
    }
  }
});

meaningInput.addEventListener("input", () => {
  if (meaningInput.value.trim()) {
    groupMeaning.classList.remove("has-error");
    if (wordInput.value.trim()) {
      form.classList.remove("is-invalid");
    }
  }
});

function clearFormErrors() {
  form.classList.remove("is-invalid");
  groupWord.classList.remove("has-error");
  groupMeaning.classList.remove("has-error");
}

// Khôi phục dữ liệu mẫu
btnResetDefault.addEventListener("click", () => {
  if (confirm("Khôi phục danh sách thẻ về 6 từ mẫu ban đầu?")) {
    cards = [...DEFAULT_CARDS];
    saveCards(cards);
    renderCards();
  }
});

// Hàm escape HTML để bảo vệ XSS
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Khởi chạy ban đầu
renderCards();
