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

// 4. Logika To-Do List (Supabase Cloud Database)
const SUPABASE_URL = 'https://efmuahycndthebsipgbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmbXVhaHljbmR0aGVic2lwZ2J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMzkxODIsImV4cCI6MjEwODkxNTE4Mn0.XaD7NNimWpV-k4lOvsNwPXGZZ5_l89ZdFlZpM1OvX0g';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const addBtn = document.getElementById('addBtn');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

let tasks = [];

// Helper untuk mencegah injeksi HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 1. Ambil daftar tugas dari tabel 'todos'
async function loadTasks() {
  taskList.innerHTML = '<li class="empty-state">Memuat tugas...</li>';

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    tasks = data || [];
    renderTasks();
  } catch (error) {
    console.error('Gagal memuat tugas dari Supabase:', error);
    taskList.innerHTML = '<li class="empty-state">Gagal memuat tugas dari server.</li>';
  }
}

// 2. Render tampilan daftar tugas
function renderTasks() {
  taskList.innerHTML = '';

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="empty-state">Belum ada tugas. Yuk tambah satu!</li>';
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement('li');
    if (task.is_completed) li.classList.add('completed');

    li.innerHTML = `
      <input type="checkbox" ${task.is_completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
      <span>${escapeHtml(task.text)}</span>
      <button class="btn-del" onclick="deleteTask(${task.id})" title="Hapus">✕</button>
    `;
    taskList.appendChild(li);
  });
}

// 3. Tambah tugas baru ke tabel 'todos'
addBtn.addEventListener('click', async () => {
  const taskText = taskInput.value.trim();
  if (taskText === '') return;

  addBtn.disabled = true;
  try {
    const { error } = await supabase
      .from('todos')
      .insert([{ text: taskText, is_completed: false }]);

    if (error) {
      throw error;
    }

    taskInput.value = '';
    await loadTasks();
  } catch (error) {
    console.error('Gagal menambahkan tugas:', error);
    alert('Gagal menambahkan tugas: ' + error.message);
  } finally {
    addBtn.disabled = false;
  }
});

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addBtn.click();
});

// 4. Perbarui status selesai (is_completed)
window.toggleTask = async function(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const updatedStatus = !task.is_completed;
  task.is_completed = updatedStatus;
  renderTasks(); // Optimistic update

  try {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: updatedStatus })
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Gagal memperbarui status tugas:', error);
    // Kembalikan ke status semula jika gagal
    task.is_completed = !updatedStatus;
    renderTasks();
  }
};

// 5. Hapus tugas dari tabel 'todos' berdasarkan id
window.deleteTask = async function(id) {
  const previousTasks = [...tasks];
  tasks = tasks.filter((t) => t.id !== id);
  renderTasks(); // Optimistic update

  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Gagal menghapus tugas:', error);
    // Kembalikan daftar tugas jika gagal
    tasks = previousTasks;
    renderTasks();
  }
};

// Muat data awal dari Supabase
loadTasks();
