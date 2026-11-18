/* Menú editable. Precios en pesos mexicanos. */
const PHONE = '525523430157';

const products = [
    {
        id: 'aullido',
        name: 'Aullido Infernal',
        price: 109,
        category: 'boneless',
        image: '/img/fondo2.png',
        description: '10 boneless Buffalo, aderezo Ranch y zanahoria.',
        sauce: false
    },
    {
        id: 'ladrido',
        name: 'Ladrido BBQ',
        price: 109,
        category: 'boneless',
        image: '/img/fondo3.png',
        description: '10 boneless BBQ, aderezo Ranch y zanahoria.',
        sauce: false
    },
    {
        id: 'nieve',
        name: 'Nieve Siberiana',
        price: 109,
        category: 'boneless',
        image: '/img/bonelessnaturales.png',
        description: '10 boneless naturales, aderezo Ranch y zanahoria.',
        sauce: false
    },
    {
        id: 'alfa',
        name: 'Combo Alfa',
        price: 120,
        category: 'combos',
        image: '/img/fondo4papas.png',
        description: '10 boneless a elegir, papas a la francesa y Ranch.',
        sauce: true
    },
    {
        id: 'doble',
        name: 'Combo Doble',
        price: 169,
        category: 'combos',
        image: '/img/combo2bbq.png',
        description: '20 boneless a elegir, Ranch y zanahoria. +25 una porcion de papas a la francesa.',
        sauce: true,
        fries: true
    },
    {
        id: 'manada',
        name: 'Combo Manada',
        price: 320,
        category: 'combos',
        image: '/img/combo1buffalo.png',
        description: '30 boneless a elegir, papas a la francesa y Ranch.',
        sauce: true
    },
    {
        id: 'papas',
        name: 'Papas a la francesa',
        price: 49,
        category: 'extras',
        image: '/img/papas.png',
        description: 'Una orden de papas a la francesa.'
    },
    {
        id: 'refresco',
        name: 'Refresco',
        price: 29,
        category: 'extras',
        image: '/img/refresco.png',
        description: 'Elige Pepsi, Manzanita o 7up.',
        drink: true
    }
];

// Tarifas: las colonias indicadas tienen prioridad sobre la zona gratuita.
// La opción de 5 km requiere confirmar la cobertura; la ubicación GPS no determina automáticamente el radio.
const deliveryZones = {
    cuautitlan: { name: 'Cuautitlán (hasta 5 km)', fee: 0 },
    joyas: { name: 'Joyas de Cuautitlán', fee: 30 },
    alborada: { name: 'Alborada', fee: 30 },
    galaxia: { name: 'Galaxia', fee: 30 },
    otra: { name: 'Otra colonia (tarifa por confirmar)', fee: null }
};

function getShipping() {
    return deliveryZones[$('delivery-zone').value] || null;
}

function getSubtotal() {
    return cart.reduce((sum, item) => {
        const p = products.find(x => x.id === item.id);
        return sum + (p ? (p.price + item.extra) * item.qty : 0);
    }, 0);
}

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0
}).format(n);
const escapeHTML = str => String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[ch]));

let cart = [];

try {
    const value = JSON.parse(localStorage.getItem('bebe_cart_v1') || '[]');

    if (Array.isArray(value)) {
        cart = value
            .filter(x =>
                products.some(p => p.id === x.id) &&
                Number.isInteger(x.qty) &&
                x.qty > 0 &&
                x.qty <= 30 &&
                Array.isArray(x.options) &&
                typeof x.note === 'string'
            )
            .map(x => ({
                ...x,
                options: x.options.filter(o => typeof o === 'string').slice(0, 5),
                note: x.note.slice(0, 300),
                extra: x.id === 'doble' && x.options.includes('Papas extra +$25') ? 25 : 0
            }));
    }
} catch {}

const save = () => {
    try {
        localStorage.setItem('bebe_cart_v1', JSON.stringify(cart));
    } catch {}
};

const buildCards = filter => {
    $('products').innerHTML = products
        .filter(p => filter === 'todos' || p.category === filter)
        .map(p => `
            <article class="product">
                <img src="${p.image}" alt="${escapeHTML(p.name)}" loading="lazy">
                <div class="details">
                    <h3>${escapeHTML(p.name)}</h3>
                    <p>${escapeHTML(p.description)}</p>
                    <div class="bottom">
                        <strong class="price">${money(p.price)}</strong>
                        <button type="button" data-product="${p.id}">Elegir +</button>
                    </div>
                </div>
            </article>
        `)
        .join('');
};

buildCards('todos');

document.querySelectorAll('[data-filter]').forEach(b => {
    b.addEventListener('click', () => {
        document.querySelectorAll('[data-filter]').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        buildCards(b.dataset.filter);
    });
});

let current = null;

$('products').addEventListener('click', e => {
    const b = e.target.closest('[data-product]');

    if (b) {
        openProduct(b.dataset.product);
    }
});

function openProduct(id) {
    current = products.find(p => p.id === id);

    if (!current) {
        return;
    }

    $('dialog-img').src = current.image;
    $('dialog-title').textContent = current.name;
    $('dialog-desc').textContent = current.description;
    $('dialog-price').textContent = money(current.price);
    $('quantity').value = 1;
    $('note').value = '';

    const opt = [];

    if (current.sauce) {
        opt.push(
            '<fieldset><legend><strong>Elige el sabor</strong></legend>' +
            ['BBQ', 'Buffalo', 'Naturales', 'Mixtos (especificar en comentarios)']
                .map((s, i) => `
                    <label class="choice">
                        <input type="radio" name="sabor" value="${s}" ${i === 0 ? 'checked' : ''}>
                        <span>${s}</span>
                    </label>
                `)
                .join('') +
            '</fieldset>'
        );
    }

    if (current.drink) {
        opt.push(
            '<fieldset><legend><strong>Elige tu refresco</strong></legend>' +
            ['Pepsi', 'Manzanita', '7up']
                .map((s, i) => `
                    <label class="choice">
                        <input type="radio" name="bebida" value="${s}" ${i === 0 ? 'checked' : ''}>
                        <span>${s}</span>
                    </label>
                `)
                .join('') +
            '</fieldset>'
        );
    }

    if (current.fries) {
        opt.push(
            '<label class="choice">' +
            '<input type="checkbox" name="papasextra">' +
            '<span>Agregar porcion de papas (+$25)</span>' +
            '</label>'
        );
    }

    $('options').innerHTML = opt.join('');
    $('customize').showModal();
}

$('close-dialog').addEventListener('click', () => $('customize').close());

$('dialog-form').addEventListener('submit', e => {
    e.preventDefault();

    if (!current) {
        return;
    }

    const qty = Number($('quantity').value);

    if (!Number.isInteger(qty) || qty < 1 || qty > 30) {
        return;
    }

    const f = new FormData(e.currentTarget);
    let options = [];

    if (current.sauce) {
        options.push('Sabor: ' + f.get('sabor'));
    }

    if (current.drink) {
        options.push('Refresco: ' + f.get('bebida'));
    }

    if (f.get('papasextra')) {
        options.push('Papas extra +$25');
    }

    cart.push({
        id: current.id,
        qty,
        options,
        note: String(f.get('nota') || '').trim().slice(0, 300),
        extra: f.get('papasextra') ? 25 : 0
    });

    save();
    renderCart();
    $('customize').close();
    $('carrito').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

function renderCart() {
    let subtotal = 0;
    let count = 0;

    $('cart-lines').innerHTML = cart.length
        ? cart.map((item, i) => {
            const p = products.find(x => x.id === item.id);

            if (!p) {
                return '';
            }

            const line = (p.price + item.extra) * item.qty;
            subtotal += line;
            count += item.qty;

            return `
                <div class="cart-line">
                    <div class="cart-line-head">
                        <span>${escapeHTML(p.name)}</span>
                        <span>${money(line)}</span>
                    </div>
                    <small>
                        ${escapeHTML(item.options.join(' · '))}
                        ${item.note ? '\nNota: ' + escapeHTML(item.note) : ''}
                    </small>
                    <div class="cart-controls">
                        <button type="button" data-minus="${i}" aria-label="Restar ${escapeHTML(p.name)}">−</button>
                        ${item.qty}
                        <button type="button" data-plus="${i}" aria-label="Sumar ${escapeHTML(p.name)}">+</button>
                        <button type="button" class="remove" data-remove="${i}">Quitar</button>
                    </div>
                </div>
            `;
        }).join('')
        : '<div class="empty">Tu carrito está vacío 🐾<br>¡Elige algo delicioso!</div>';

    $('subtotal').textContent = money(subtotal);

    const shipping = getShipping();
    $('shipping-price').textContent = shipping
        ? (shipping.fee === null
            ? 'Por confirmar'
            : shipping.fee === 0
                ? 'GRATIS'
                : money(shipping.fee))
        : 'Selecciona zona';
    $('total').textContent = shipping && shipping.fee !== null
        ? money(subtotal + shipping.fee)
        : money(subtotal) + ' + envío por confirmar';
    $('count').textContent = count;
    $('checkout').querySelector('[type=submit]').disabled = !cart.length;
}

$('delivery-zone').addEventListener('change', () => {
    const z = getShipping();

    $('zone-note').textContent = z
        ? (z.fee === null
            ? 'Te confirmaremos cobertura y tarifa de envío por WhatsApp.'
            : 'Zona seleccionada: ' + z.name +
              '. Envío ' + (z.fee === 0 ? 'GRATIS' : money(z.fee)) +
              '. Cobertura sujeta a verificación del domicilio.')
        : 'Selecciona tu zona de entrega para calcular el envío.';

    renderCart();
});

$('cart-lines').addEventListener('click', e => {
    const b = e.target.closest('button');

    if (!b) {
        return;
    }

    for (const action of ['minus', 'plus', 'remove']) {
        if (b.dataset[action] !== undefined) {
            const i = Number(b.dataset[action]);

            if (!cart[i]) {
                return;
            }

            if (action === 'remove') {
                cart.splice(i, 1);
            }

            if (action === 'minus') {
                cart[i].qty--;

                if (!cart[i].qty) {
                    cart.splice(i, 1);
                }
            }

            if (action === 'plus') {
                cart[i].qty = Math.min(30, cart[i].qty + 1);
            }

            save();
            renderCart();
            return;
        }
    }
});

renderCart();

$('locate').addEventListener('click', () => {
    if (!navigator.geolocation) {
        $('geo-status').textContent =
            'Tu navegador no permite obtener la ubicación. Pega un enlace de Maps.';
        return;
    }

    $('geo-status').textContent = 'Solicitando permiso de ubicación…';

    navigator.geolocation.getCurrentPosition(
        pos => {
            const { latitude, longitude } = pos.coords;
            const url =
                `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;

            $('checkout').elements.mapa.value = url;
            $('geo-status').textContent =
                'Ubicación agregada. Verifica que el marcador corresponda a tu domicilio.';
        },
        () => {
            $('geo-status').textContent =
                'No se obtuvo la ubicación. Puedes escribir tu dirección y pegar un enlace de Maps.';
        },
        {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 0
        }
    );
});

$('checkout').addEventListener('submit', e => {
    e.preventDefault();

    if (!cart.length) {
        $('form-status').textContent = 'Agrega al menos un producto.';
        return;
    }

    const f = new FormData(e.currentTarget);
    const name = String(f.get('nombre')).trim();
    const phone = String(f.get('telefono')).trim();
    const address = String(f.get('direccion')).trim();
    const payment = String(f.get('pago')).trim();

    if (
        !name ||
        !address ||
        !payment ||
        phone.replace(/\D/g, '').length < 10
    ) {
        $('form-status').textContent =
            'Completa tu nombre, teléfono de al menos 10 dígitos, domicilio y forma de pago.';
        return;
    }

    const zone = getShipping();

    if (!zone) {
        $('form-status').textContent = 'Selecciona tu zona de entrega.';
        return;
    }

    const map = String(f.get('mapa') || '').trim();

    if (map) {
        try {
            const u = new URL(map);

            if (u.protocol !== 'https:' && u.protocol !== 'http:') {
                throw Error('URL inválida');
            }
        } catch {
            $('form-status').textContent = 'El enlace de Maps debe ser una URL válida.';
            return;
        }
    }

    let total = 0;

    const lines = cart.map(item => {
        const p = products.find(x => x.id === item.id);
        const sum = (p.price + item.extra) * item.qty;
        total += sum;

        return `${item.qty} x ${p.name} — ${money(sum)}` +
            `${item.options.length ? '\n  ' + item.options.join(', ') : ''}` +
            `${item.note ? '\n  Nota: ' + item.note : ''}`;
    });

    const msg = [
        '🐾 *LA MORDIDA DE BEBE*',
        '*NUEVO PEDIDO A DOMICILIO*',
        '',
        '*Cliente:* ' + name,
        '*Teléfono:* ' + phone,
        '',
        '*PEDIDO:*',
        ...lines,
        '',
        '*Subtotal:* ' + money(total),
        '*Zona:* ' + zone.name,
        '*Costo de envío:* ' +
            (zone.fee === null
                ? 'Por confirmar'
                : zone.fee === 0
                    ? 'GRATIS'
                    : money(zone.fee)),
        '*Total' +
            (zone.fee === null
                ? ' de productos (sin envío)'
                : ' estimado') +
            ':* ' +
            money(total + (zone.fee ?? 0)),
        '',
        '*DOMICILIO:* ' + address,
        String(f.get('referencias') || '').trim()
            ? '*Referencias:* ' + String(f.get('referencias')).trim()
            : '',
        map ? '*Ubicación:* ' + map : '',
        '',
        '*Pago:* ' + payment,
        String(f.get('comentarios') || '').trim()
            ? '*Comentarios:* ' + String(f.get('comentarios')).trim()
            : '',
        'Favor de confirmar cobertura, disponibilidad y total final antes de preparar el pedido.'
    ].filter(x => x !== '').join('\n');

    $('form-status').textContent =
        'Se abrirá WhatsApp con tu pedido. Pulsa Enviar en el chat para solicitarlo.';

    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.location.href = url;
});

const selected = new URLSearchParams(location.search).get('producto');

if (products.some(p => p.id === selected)) {
    openProduct(selected);
}
