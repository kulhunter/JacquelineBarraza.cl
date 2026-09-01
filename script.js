document.addEventListener('DOMContentLoaded', () => {
  const WA_BASE_URL = "https://wa.link/2xsqzu";
  let cart = [];

  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function formatCLP(val) {
    return '$' + Number(val).toLocaleString('es-CL') + ' CLP';
  }

  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const price = parseInt(btn.getAttribute('data-price'), 10);

      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, price, qty: 1 });
      }

      updateCartUI();
      openCart();
    });
  });

  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="brand-sub">No has seleccionado ningún servicio.</p>';
      if (cartTotalEl) cartTotalEl.textContent = '$0 CLP';
      return;
    }

    let html = '';
    let grandTotal = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      grandTotal += itemTotal;

      html += `
        <div class="cart-item-row">
          <div>
            <strong style="color:var(--white);">${item.title}</strong>
            <div class="brand-sub">${formatCLP(item.price)} x ${item.qty}</div>
          </div>
          <div style="text-align:right;">
            <strong style="color:var(--rose-light);">${formatCLP(itemTotal)}</strong>
            <button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:var(--rose);cursor:pointer;display:block;font-size:0.7rem;margin-top:2px;">Eliminar</button>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    if (cartTotalEl) cartTotalEl.textContent = formatCLP(grandTotal);
  }

  window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
      }

      let message = "Hola Jacqueline, quiero consultar y agendar los siguientes servicios desde tu web jacquelinebarraza.cl:\n\n";
      let total = 0;

      cart.forEach((item, index) => {
        message += `${index + 1}. *${item.title}* (x${item.qty}) - ${formatCLP(item.price * item.qty)}\n`;
        total += item.price * item.qty;
      });

      message += `\n*Total Estimado:* ${formatCLP(total)}`;
      message += `\n\n¿Tienes disponibilidad para coordinar fecha y hora?`;

      window.open(`${WA_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
    });
  }
});
