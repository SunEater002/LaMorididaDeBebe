function toggleLista(id) {
    document.querySelectorAll('section ul[id^="servicio"]').forEach(ul => {
      if (ul.id !== id) ul.classList.remove('open');
    });
    const lista = document.getElementById(id);
    lista.classList.toggle('open');
  }