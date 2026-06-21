(() => {
  const CART_KEY = 'insane_cart_v1';

  function getCart() { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function formatPrice(n) { return '$' + n.toLocaleString(); }
  function parsePrice(text) { if (!text) return 0; return Number(text.replace(/[^0-9]/g, '')) || 0; }

  function updateCount() {
    const count = getCart().reduce((s, i) => s + (i.quantity || 0), 0);
    const el = document.getElementById('cart-count');
    if (!el) return;
    if (count > 0) { el.textContent = count; el.style.display = 'inline-block'; } else { el.style.display = 'none'; }
  }

  function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(it => it.name === product.name);
    if (idx > -1) { cart[idx].quantity = (cart[idx].quantity || 0) + 1; } else { cart.push({ ...product, quantity: 1 }); }
    saveCart(cart);
    updateCount();
  }

  function attachAddButtons() {
    document.querySelectorAll('.producto button').forEach(btn => {
      btn.addEventListener('click', () => {
        const prod = btn.closest('.producto');
        if (!prod) return;
        const nameEl = prod.querySelector('h2, h4, h3');
        const priceEl = prod.querySelector('.precio');
        const imgEl = prod.querySelector('img');
        const name = nameEl ? nameEl.textContent.trim() : 'Producto';
        const price = priceEl ? parsePrice(priceEl.textContent) : 0;
        const img = imgEl ? imgEl.getAttribute('src') : '';
        addToCart({ name, price, img });
      });
    });
  }

  function renderCartPage() {
    const cart = getCart();
    const container = document.getElementById('carrito-main');
    if (!container) return;
    container.innerHTML = '';
    const title = document.createElement('h2'); title.textContent = 'Tu carrito';
    container.appendChild(title);
    if (cart.length === 0) {
      const p = document.createElement('p'); p.textContent = 'Tu carrito está vacío por ahora. Cuando agregues productos, los verás aquí.';
      container.appendChild(p);
      const a = document.createElement('a'); a.className = 'boton-volver'; a.href = 'catalogo.html'; a.textContent = 'Seguir comprando';
      container.appendChild(a);
      return;
    }

    const table = document.createElement('table'); table.className = 'cart-table';
    const thead = document.createElement('thead'); thead.innerHTML = '<tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>';
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let total = 0;
    cart.forEach((item, idx) => {
      const subtotal = (item.price || 0) * (item.quantity || 0);
      total += subtotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="prod-cell"><img src="${item.img}" alt="" width="60"> <span>${item.name}</span></td>
        <td>${formatPrice(item.price || 0)}</td>
        <td><button class="qty-decrease" data-idx="${idx}">-</button> <span class="qty">${item.quantity}</span> <button class="qty-increase" data-idx="${idx}">+</button></td>
        <td>${formatPrice(subtotal)}</td>
        <td><button class="remove" data-idx="${idx}">Eliminar</button></td>
      `;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    const summary = document.createElement('div'); summary.className = 'cart-summary'; summary.innerHTML = `<p>Total: <strong>${formatPrice(total)}</strong></p>`;
    container.appendChild(summary);

    const form = document.createElement('form'); form.id = 'checkout-form';
    form.innerHTML = `
      <h3>Finalizar compra</h3>
      <label>Dirección<input type="text" name="direccion" required></label>
      <label>Método de pago
        <select name="metodo" required>
          <option value="tarjeta">Tarjeta</option>
          <option value="transferencia">Transferencia</option>
          <option value="efectivo">Efectivo</option>
        </select>
      </label>
      <label>Email para factura<input type="email" name="email" required></label>
      <button type="submit">Pagar</button>
    `;
    container.appendChild(form);

    // listeners
    container.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.idx);
      cart.splice(i, 1); saveCart(cart); renderCartPage(); updateCount();
    }));
    container.querySelectorAll('.qty-increase').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.idx); cart[i].quantity = (cart[i].quantity || 0) + 1; saveCart(cart); renderCartPage(); updateCount();
    }));
    container.querySelectorAll('.qty-decrease').forEach(btn => btn.addEventListener('click', () => {
      const i = Number(btn.dataset.idx);
      if (cart[i].quantity > 1) { cart[i].quantity--; } else { cart.splice(i, 1); }
      saveCart(cart); renderCartPage(); updateCount();
    }));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const email = data.get('email');
      // Simulate purchase
      alert('Compra realizada. Se enviará la factura a: ' + email);
      localStorage.removeItem(CART_KEY);
      updateCount();
      renderCartPage();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateCount();
    attachAddButtons();
    const path = location.pathname.split('/').pop();
    if (path === 'carrito.html') renderCartPage();
  });

})();
