// Sección pública de comentarios: enviar (queda pendiente) y mostrar los aprobados.
(function () {
  const lista = document.getElementById('comentarios-lista');
  if (!lista) return;

  const cfg = window.SUPABASE_CONFIG;
  if (!window.supabase || !cfg || cfg.url.includes('TU-PROYECTO')) {
    lista.textContent = 'Los comentarios estarán disponibles pronto.';
    return;
  }

  const db = window.supabase.createClient(cfg.url, cfg.anonKey);
  const $ = (id) => document.getElementById(id);
  const ESPERA_MS = 5 * 60 * 1000; // 5 min entre comentarios desde el mismo navegador

  const estrellas = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  // ---------- Mostrar comentarios aprobados ----------
  const POR_PAGINA = 6;
  let todos = [];
  let visibles = 0;

  function tarjeta(c) {
    // Se usa textContent (nunca innerHTML) para evitar inyección de código.
    const card = document.createElement('article');
    card.className = 'bg-white rounded-xl shadow-lg border-l-4 border-pink-400 p-5 text-left';

    const top = document.createElement('div');
    top.className = 'flex items-center justify-between gap-2 flex-wrap';

    const nombre = document.createElement('strong');
    nombre.className = 'text-pink-700 text-lg';
    nombre.textContent = c.nombre;

    const stars = document.createElement('span');
    stars.className = 'text-yellow-500 text-xl';
    stars.textContent = estrellas(c.calificacion);
    stars.setAttribute('aria-label', `${c.calificacion} de 5 estrellas`);

    top.append(nombre, stars);

    const meta = document.createElement('p');
    meta.className = 'text-sm text-gray-500 mb-2';
    const fecha = new Date(c.creado).toLocaleDateString('es-MX', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    meta.textContent = c.platillo ? `${c.platillo} · ${fecha}` : fecha;

    const texto = document.createElement('p');
    texto.className = 'text-gray-700';
    texto.textContent = c.comentario;

    card.append(top, meta, texto);

    if (c.respuesta) {
      const r = document.createElement('div');
      r.className = 'mt-3 bg-pink-100 border-l-4 border-pink-500 rounded-lg p-3 text-sm';
      const t = document.createElement('strong');
      t.className = 'text-pink-700';
      t.textContent = 'La Mordida de Bebe 🐾 respondió:';
      const p = document.createElement('p');
      p.className = 'text-gray-700 mt-1';
      p.textContent = c.respuesta;
      r.append(t, p);
      card.append(r);
    }
    return card;
  }

  function pintarPagina() {
    const btnMas = $('comentarios-mas');
    lista.replaceChildren();
    todos.slice(0, visibles).forEach((c) => lista.append(tarjeta(c)));
    btnMas.classList.toggle('hidden', visibles >= todos.length);
  }

  async function cargar() {
    const { data, error } = await db
      .from('comentarios')
      .select('id,nombre,platillo,calificacion,comentario,respuesta,creado')
      .eq('estado', 'aprobado')
      .order('creado', { ascending: false })
      .limit(100);

    if (error) {
      lista.textContent = 'No pudimos cargar los comentarios. Intenta más tarde.';
      return;
    }
    if (!data.length) {
      lista.textContent = 'Sé el primero en dejar tu comentario 🐾';
      $('comentarios-resumen').textContent = '';
      $('comentarios-mas').classList.add('hidden');
      return;
    }

    todos = data;
    visibles = Math.min(POR_PAGINA, todos.length);

    const promedio = data.reduce((s, c) => s + c.calificacion, 0) / data.length;
    $('comentarios-resumen').textContent =
      `★ ${promedio.toFixed(1)} · ${data.length} ${data.length === 1 ? 'opinión' : 'opiniones'}`;

    pintarPagina();
  }

  $('comentarios-mas').addEventListener('click', () => {
    visibles = Math.min(visibles + POR_PAGINA, todos.length);
    pintarPagina();
  });

  // ---------- Estrellas del formulario ----------
  const inputCal = $('cmt-calificacion');
  const botones = document.querySelectorAll('#cmt-estrellas button');
  function pintar(n) {
    botones.forEach((b) => {
      b.textContent = Number(b.dataset.v) <= n ? '★' : '☆';
    });
  }
  botones.forEach((b) =>
    b.addEventListener('click', () => {
      inputCal.value = b.dataset.v;
      pintar(Number(b.dataset.v));
    })
  );

  // ---------- Enviar comentario ----------
  const form = $('comentarios-form');
  const aviso = $('cmt-aviso');

  function mostrar(msg, ok) {
    aviso.textContent = msg;
    aviso.className = 'mt-3 font-semibold text-center ' + (ok ? 'text-green-700' : 'text-red-600');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: los bots suelen llenar este campo oculto
    if ($('cmt-web').value) return;

    const ultimo = Number(localStorage.getItem('cmt_ultimo') || 0);
    if (Date.now() - ultimo < ESPERA_MS) {
      return mostrar('Ya enviaste un comentario hace poco. Intenta de nuevo en unos minutos.', false);
    }

    const nombre = $('cmt-nombre').value.trim();
    const comentario = $('cmt-texto').value.trim();
    const calificacion = Number(inputCal.value);
    const platillo = $('cmt-platillo').value || null;

    if (nombre.length < 2) return mostrar('Escribe tu nombre.', false);
    if (!calificacion) return mostrar('Elige tu calificación con las estrellas.', false);
    if (comentario.length < 5) return mostrar('Cuéntanos un poco más en tu comentario.', false);

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    // Sin .select(): el visitante no puede leer comentarios pendientes
    const { error } = await db.from('comentarios').insert({
      nombre, platillo, calificacion, comentario
    });

    btn.disabled = false;

    if (error) {
      return mostrar('No pudimos enviar tu comentario. Intenta más tarde.', false);
    }

    localStorage.setItem('cmt_ultimo', String(Date.now()));
    form.reset();
    inputCal.value = '';
    pintar(0);
    mostrar('¡Gracias! 🐾 Tu comentario se publicará cuando sea aprobado.', true);
  });

  cargar();
})();
