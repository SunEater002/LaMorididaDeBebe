function toggleLista(id) {
    document.querySelectorAll('section ul[id^="servicio"]').forEach(ul => {
      if (ul.id !== id) ul.classList.remove('open');
    });
    const lista = document.getElementById(id);
    lista.classList.toggle('open');
  }

function ordenarProducto(nombre, precio) {
    const mensaje = `Buenas Huellitas 🐾💙, me gustaría ordenar el siguiente producto: ${nombre} por un precio de $${precio}.`;
    const numeroWhatsApp = '5523430157'; // Tu número
    const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(enlaceWhatsApp, '_blank'); // Abre en nueva pestaña
}