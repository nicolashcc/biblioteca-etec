// Dados no LocalStorage
let livros = JSON.parse(localStorage.getItem('etec_livros')) || [];
let usuarios = JSON.parse(localStorage.getItem('etec_usuarios')) || [];
let emprestimos = JSON.parse(localStorage.getItem('etec_emprestimos')) || [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderLivros();
  renderUsuarios();
  renderEmprestimos();
  popularSelects();
  atualizarEstatisticas();
});

// Troca de Abas
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tabId}`).classList.add('active');
  event.currentTarget.classList.add('active');
}

// Persistência
function salvarDados() {
  localStorage.setItem('etec_livros', JSON.stringify(livros));
  localStorage.setItem('etec_usuarios', JSON.stringify(usuarios));
  localStorage.setItem('etec_emprestimos', JSON.stringify(emprestimos));
  atualizarEstatisticas();
}

// Estatísticas Rápidas
function atualizarEstatisticas() {
  document.getElementById('stat-livros').textContent = livros.length;
  document.getElementById('stat-usuarios').textContent = usuarios.length;
  
  const abertos = emprestimos.filter(e => e.status === 'Em aberto').length;
  document.getElementById('stat-abertos').textContent = abertos;
}

// ------------------- LIVROS -------------------
document.getElementById('form-livro').addEventListener('submit', (e) => {
  e.preventDefault();
  const titulo = document.getElementById('livro-titulo').value.trim();
  const autor = document.getElementById('livro-autor').value.trim();

  if (titulo && autor) {
    livros.push({ id: Date.now(), titulo, autor });
    salvarDados();
    renderLivros();
    popularSelects();
    e.target.reset();
  }
});

function renderLivros() {
  const tbody = document.getElementById('lista-livros');
  tbody.innerHTML = '';

  if (livros.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="empty-msg"><i class="fa-solid fa-inbox"></i> Nenhum livro cadastrado.</td></tr>';
    return;
  }

  livros.forEach(livro => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${livro.titulo}</strong></td>
      <td>${livro.autor}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------------- USUÁRIOS -------------------
document.getElementById('form-usuario').addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = document.getElementById('usuario-nome').value.trim();
  const email = document.getElementById('usuario-email').value.trim();

  if (nome && email) {
    usuarios.push({ id: Date.now(), nome, email });
    salvarDados();
    renderUsuarios();
    popularSelects();
    e.target.reset();
  }
});

function renderUsuarios() {
  const tbody = document.getElementById('lista-usuarios');
  tbody.innerHTML = '';

  if (usuarios.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="empty-msg"><i class="fa-solid fa-inbox"></i> Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  usuarios.forEach(usr => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${usr.nome}</strong></td>
      <td>${usr.email}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ------------------- SELECTS DE EMPRÉSTIMO -------------------
function popularSelects() {
  const selectLivro = document.getElementById('emp-livro');
  const selectUsuario = document.getElementById('emp-usuario');

  selectLivro.innerHTML = '<option value="">Selecione um livro...</option>';
  selectUsuario.innerHTML = '<option value="">Selecione um usuário...</option>';

  livros.forEach(livro => {
    const opt = document.createElement('option');
    opt.value = livro.id;
    opt.textContent = `${livro.titulo} (${livro.autor})`;
    selectLivro.appendChild(opt);
  });

  usuarios.forEach(usr => {
    const opt = document.createElement('option');
    opt.value = usr.id;
    opt.textContent = `${usr.nome}`;
    selectUsuario.appendChild(opt);
  });
}

// ------------------- EMPRÉSTIMOS -------------------
document.getElementById('form-emprestimo').addEventListener('submit', (e) => {
  e.preventDefault();

  const livroId = Number(document.getElementById('emp-livro').value);
  const usuarioId = Number(document.getElementById('emp-usuario').value);
  const dataEmprestimo = document.getElementById('emp-data').value;
  const dataDevolucao = document.getElementById('emp-devolucao').value;

  const livroObj = livros.find(l => l.id === livroId);
  const usuarioObj = usuarios.find(u => u.id === usuarioId);

  if (livroObj && usuarioObj && dataEmprestimo && dataDevolucao) {
    emprestimos.push({
      id: Date.now(),
      livroTitulo: livroObj.titulo,
      autor: livroObj.autor,
      usuarioNome: usuarioObj.nome,
      dataEmprestimo,
      dataDevolucao,
      status: 'Em aberto'
    });

    salvarDados();
    renderEmprestimos();
    e.target.reset();
  }
});

function renderEmprestimos() {
  const tbody = document.getElementById('lista-emprestimos');
  tbody.innerHTML = '';

  if (emprestimos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-msg"><i class="fa-solid fa-inbox"></i> Nenhum empréstimo registrado.</td></tr>';
    return;
  }

  emprestimos.forEach(emp => {
    const tr = document.createElement('tr');
    const isAberto = emp.status === 'Em aberto';

    tr.innerHTML = `
      <td><strong>${emp.livroTitulo}</strong></td>
      <td>${emp.autor}</td>
      <td>${emp.usuarioNome}</td>
      <td>${formatarData(emp.dataEmprestimo)}</td>
      <td>${formatarData(emp.dataDevolucao)}</td>
      <td>
        <span class="badge ${isAberto ? 'badge-aberto' : 'badge-devolvido'}">
          <i class="fa-solid ${isAberto ? 'fa-clock' : 'fa-circle-check'}"></i>
          ${emp.status}
        </span>
      </td>
      <td>
        ${isAberto 
          ? `<button class="btn btn-sm btn-success" onclick="devolverLivro(${emp.id})"><i class="fa-solid fa-rotate-left"></i> Devolver</button>` 
          : '-'
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function devolverLivro(id) {
  const emp = emprestimos.find(e => e.id === id);
  if (emp) {
    emp.status = 'Devolvido';
    salvarDados();
    renderEmprestimos();
  }
}

function formatarData(dataISO) {
  if (!dataISO) return '-';
  const partes = dataISO.split('-');
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}