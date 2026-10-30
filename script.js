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

// 3. Logika Kutipan Inspirasi Harian
const quotes = [
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
  },
  {
    text: "Tiada awan di langit yang tetap selamanya. Sehabis malam gelap gulita, lahir pagi membawa keindahan.",
    author: "R.A. Kartini"
  },
  {
    text: "Hidup itu seperti sepeda. Agar tetap seimbang, kamu harus terus bergerak maju.",
    author: "Albert Einstein"
  },
  {
    text: "Kebaikan yang paling utama adalah saat kita mampu memberi manfaat bagi sesama.",
    author: "Gus Dur"
  }
];

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const refreshQuoteBtn = document.getElementById('refreshQuoteBtn');
let currentQuoteIndex = -1;

function displayRandomQuote() {
  let randomIndex;
  if (quotes.length > 1) {
    do {
      randomIndex = Math.floor(Math.random() * quotes.length);
    } while (randomIndex === currentQuoteIndex);
  } else {
    randomIndex = 0;
  }
  currentQuoteIndex = randomIndex;
  quoteText.textContent = quotes[randomIndex].text;
  quoteAuthor.textContent = quotes[randomIndex].author;
}

refreshQuoteBtn.addEventListener('click', () => {
  refreshQuoteBtn.classList.remove('spin');
  void refreshQuoteBtn.offsetWidth; // Memicu reflow browser agar animasi putar bisa diulang
  refreshQuoteBtn.classList.add('spin');
  displayRandomQuote();
});

// Tampilkan kutipan acak saat halaman dimuat
displayRandomQuote();

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
