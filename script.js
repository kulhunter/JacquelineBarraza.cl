/* ==========================================================================
   JACQUELINEBARRAZA.CL — INTERACTIVE APP & WHATSAPP CART ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const WA_BASE_URL = "https://wa.link/2xsqzu";

  // State Management
  let cart = [];

  // DOM Elements
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const catalogGrid = document.getElementById('catalogGrid');
  const tabBtns = document.querySelectorAll('.tab-btn');

  // Format CLP
  function formatCLP(val) {
    return '$' + Number(val).toLocaleString('es-CL') + ' CLP';
  }

  // Toggle Cart Drawer
  function openCart() { cartDrawer.classList.add('open'); }
  function closeCart() { cartDrawer.classList.remove('open'); }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Filter Catalog Items
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      const products = catalogGrid.querySelectorAll('.product-card');
      products.forEach(prod => {
        if (filter === 'all' || prod.getAttribute('data-category') === filter) {
          prod.style.display = 'flex';
        } else {
          prod.style.display = 'none';
        }
      });
    });
  });

  // Add Item to Cart
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const price = parseInt(btn.getAttribute('data-price'), 10);
      const abono = parseInt(btn.getAttribute('data-abono'), 10);

      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, price, abono, qty: 1 });
      }

      updateCartUI();
      openCart();
    });
  });

  // Render Cart UI
  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalQty;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">No has agregado ningún servicio todavía.</p>';
      cartTotalEl.textContent = '$0 CLP';
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
            <strong>${item.title}</strong>
            <p class="body-sm text-dim">${formatCLP(item.price)} x ${item.qty}</p>
          </div>
          <div>
            <span class="price-val" style="font-size:0.9rem;">${formatCLP(itemTotal)}</span>
            <button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:#C27B75;cursor:pointer;display:block;font-size:0.7rem;margin-top:4px;">Eliminar</button>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    cartTotalEl.textContent = formatCLP(grandTotal);
  }

  // Remove Item
  window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  // WhatsApp Checkout Trigger
  checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
      alert("El carrito está vacío. Agrega un servicio primero.");
      return;
    }

    let message = "Hola Jacqueline, quiero consultar y agendar los siguientes servicios de tu web jacquelinebarraza.cl:\n\n";
    let total = 0;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.title}* (x${item.qty}) - ${formatCLP(item.price * item.qty)}\n`;
      total += item.price * item.qty;
    });

    message += `\n*Total Estimado:* ${formatCLP(total)}`;
    message += `\n\n¿Tienes disponibilidad para coordinar la cita/reserva?`;

    // Encode text and merge with base WhatsApp Link
    const finalWaUrl = `${WA_BASE_URL}?text=${encodeURIComponent(message)}`;
    window.open(finalWaUrl, '_blank');
  });
});
