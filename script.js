// 1. Logika Jam Real-time
function updateClock() {
  const now = new Date();
  
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  document.getElementById('clockTime').textContent = timeStr.replace(/\./g, ':');
  document.getElementById('clockDate').textContent = dateStr;
}

setInterval(updateClock, 1000);
updateClock();

// 2. Logika Tema (Local Storage)
const themeBtn = document.getElementById('themeBtn');
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// 3. Logika Kutipan Inspirasi Harian (Fetch API Dinamis)
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const refreshQuoteBtn = document.getElementById('refreshQuoteBtn');

// Kutipan cadangan (fallback) jika koneksi internet terputus atau API bermasalah
const fallbackQuotes = [
  {
    text: "Keberhasilan bukanlah milik orang pintar, tetapi milik mereka yang senantiasa berusaha.",
    author: "B.J. Habibie"
  },
  {
    text: "Bermimpilah setinggi langit. Jika engkau jatuh, engkau akan jatuh di antara bintang-bintang.",
    author: "Ir. Soekarno"
  },
  {
    text: "Jadikan setiap tempat sebagai sekolah dan jadikan setiap orang sebagai guru.",
    author: "Ki Hajar Dewantara"
  }
];

async function fetchQuote() {
  // Status pemuatan (loading state): beri teks sementara & nonaktifkan tombol
  quoteText.textContent = "Mengambil inspirasi...";
  quoteAuthor.textContent = "...";
  refreshQuoteBtn.disabled = true;
  refreshQuoteBtn.classList.add('spin');

  try {
    // Ambil kutipan dari API publik AdviceSlip dengan parameter acak/timestamp untuk mencegah cache browser
    const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.slip && data.slip.advice) {
      quoteText.textContent = data.slip.advice;
      quoteAuthor.textContent = `Advice Slip #${data.slip.id}`;
    } else {
      throw new Error("Format respon API tidak valid");
    }
  } catch (error) {
    console.error("Gagal mengambil kutipan dari API:", error);
    // Fallback sederhana saat offline atau terjadi galat
    const randomFallback = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    quoteText.textContent = randomFallback.text;
    quoteAuthor.textContent = randomFallback.author;
  } finally {
    // Kembalikan status tombol ke keadaan aktif dan hentikan animasi putar
    refreshQuoteBtn.disabled = false;
    refreshQuoteBtn.classList.remove('spin');
  }
}

// Hubungkan tombol refresh kutipan ke fungsi fetchQuote
refreshQuoteBtn.addEventListener('click', fetchQuote);

// Ambil kutipan saat halaman pertama kali dimuat
fetchQuote();

// 4. Logika To-Do List (Local Storage)
const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [
  { text: 'Merapikan kode HTML dasar', completed: true },
  { text: 'Menyiapkan repositori Git', completed: false }
];

function saveAndRender() {
  localStorage.setItem('dashboard_tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="empty-state">Belum ada tugas. Yuk tambah satu!</li>';
    return;
  }

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
      <span>${task.text}</span>
      <button class="btn-del" onclick="deleteTask(${index})" title="Hapus">✕</button>
    `;
    taskList.appendChild(li);
  });
}

addBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  if (text !== '') {
    tasks.push({ text: text, completed: false });
    taskInput.value = '';
    saveAndRender();
  }
});

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

window.toggleTask = function(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
};

window.deleteTask = function(index) {
  tasks.splice(index, 1);
  saveAndRender();
};

renderTasks();
