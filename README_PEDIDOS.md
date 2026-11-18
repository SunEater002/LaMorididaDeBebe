# Sistema de pedidos — La Mordida de Bebe

Se agregó `ordenar.html`, `ordenar.css` y `ordenar.js`. En la portada se añadió **ORDENA AQUÍ** y los botones de productos ahora abren su ficha para agregarlos al carrito. Se mantuvieron el sitio original, los comentarios y la administración.

## Cómo publicarlo

1. Sustituye el contenido del repositorio de GitHub por el contenido de este ZIP (incluyendo los archivos nuevos). No borres tus claves/configuración actuales.
2. Netlify ejecuta `npm run build` y publica `dist` (ya configurado).
3. Entra a `https://lamordidadebebe.netlify.app/ordenar.html` para probar el flujo.

## Ajustes y restricciones

- El número al que se envía el pedido está en `ordenar.js`, constante `PHONE` (`525523430157`), tomado de tu `script.js` original. Confirma que sea el WhatsApp empresarial correcto antes de publicar.
- Los productos, precios, imágenes y complementos se editan en el arreglo `products` de `ordenar.js`.
- Se incorporó la opción de papas extra por $25 para Combo Doble porque así aparece en el menú original. No se inventaron precios para otros adicionales.
- El envío es **gratis en Cuautitlán dentro de 5 km de la zona de operación**, y cuesta **$30 en Joyas de Cuautitlán, Alborada y Galaxia**. Para otras colonias se muestra **por confirmar**. La zona es seleccionada por el cliente: **no se calcula automáticamente la distancia**, pues falta definir el punto exacto de origen. Confirma cobertura/domicilio antes de aceptar el pedido.
- El pago se selecciona entre efectivo, transferencia o tarjeta al recibir; esta versión no cobra en línea ni procesa tarjetas.
- WhatsApp se abre con el mensaje listo; el cliente debe tocar **Enviar**. No hay envío automático de mensajes ni almacenamiento de pedidos en servidor.
- El carrito se conserva en el dispositivo mediante `localStorage`. Los datos personales solo se usan para componer el mensaje, no se guardan en `localStorage`.
- La geolocalización requiere autorización del cliente y HTTPS. El cliente debe comprobar que el mapa sea correcto.
- El sitio mantiene comentarios.js, config.js, admin.html y funcionalidades anteriores.
