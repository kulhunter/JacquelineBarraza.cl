document.addEventListener('DOMContentLoaded', () => {
  const WA_BASE_URL = "https://wa.link/2xsqzu";
  let cart = [];
  let pendingBookingItems = [];

  // Inyectar HTML del Modal de Captura de Datos y Selector de 3 Días si no existe
  if (!document.getElementById('leadModal')) {
    const modalHTML = `
      <div id="leadModal" class="lead-modal-backdrop">
        <div class="lead-modal-card">
          <button id="closeLeadModal" class="modal-close-btn">&times;</button>
          
          <span class="tag-luxury">Coincidencia de Agenda Privada</span>
          <h3 class="font-serif modal-title">Datos para tu Cita</h3>
          <p class="modal-subtitle">Jacqueline evaluará tus días preferidos para hacer match con su disponibilidad.</p>
          
          <form id="leadForm" class="lead-form">
            <div class="form-row-2">
              <div class="form-group">
                <label for="leadNombre">Nombre *</label>
                <input type="text" id="leadNombre" required placeholder="Ej. Valentina">
              </div>
              <div class="form-group">
                <label for="leadApellido">Apellido *</label>
                <input type="text" id="leadApellido" required placeholder="Ej. Silva">
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label for="leadPhone">WhatsApp *</label>
                <input type="tel" id="leadPhone" required placeholder="+56 9 1234 5678">
              </div>
              <div class="form-group">
                <label for="leadEmail">Correo Electrónico *</label>
                <input type="email" id="leadEmail" required placeholder="tu@email.com">
              </div>
            </div>

            <div class="dates-section">
              <label class="dates-label">Selecciona 3 días candidatas (para buscar match de agenda): *</label>
              <div class="dates-grid">
                <div class="form-group">
                  <span class="date-option-tag">Opción 1</span>
                  <input type="date" id="dateOption1" required>
                </div>
                <div class="form-group">
                  <span class="date-option-tag">Opción 2</span>
                  <input type="date" id="dateOption2" required>
                </div>
                <div class="form-group">
                  <span class="date-option-tag">Opción 3</span>
                  <input type="date" id="dateOption3" required>
                </div>
              </div>
              <small class="disclaimer-text">
                ℹ️ La selección de fechas sirve como preferencia de atención. La fecha y hora final serán confirmadas directamente por WhatsApp según disponibilidad.
              </small>
            </div>

            <div class="modal-summary-box">
              <span class="summary-label">Servicio(s) a Solicitar:</span>
              <div id="modalItemsSummary" class="summary-items-list"></div>
            </div>

            <button type="submit" class="btn-gold btn-block modal-submit-btn">
              Enviar Solicitud a WhatsApp
            </button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  // Elementos DOM
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const leadModal = document.getElementById('leadModal');
  const closeLeadModal = document.getElementById('closeLeadModal');
  const leadForm = document.getElementById('leadForm');
  const modalItemsSummary = document.getElementById('modalItemsSummary');

  // Asignar fecha mínima desde hoy en los selectores
  const todayStr = new Date().toISOString().split('T')[0];
  ['dateOption1', 'dateOption2', 'dateOption3'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.min = todayStr;
  });

  // Funciones de Carrito
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('open');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  // Agregar al carrito
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');

      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, qty: 1 });
      }

      updateCartUI();
      openCart();
    });
  });

  // Evento "Agendar Directo / Reservar por WhatsApp"
  document.querySelectorAll('.direct-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const title = btn.getAttribute('data-title') || "Consulta de Servicio Facial";
      pendingBookingItems = [{ title, qty: 1 }];
      openLeadModal(pendingBookingItems);
    });
  });

  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="font-size:0.8rem; color:var(--white-60);">No has seleccionado ningún servicio.</p>';
      if (cartTotalEl) cartTotalEl.textContent = '$000.000 CLP';
      return;
    }

    let html = '';
    cart.forEach(item => {
      html += `
        <div class="cart-item-row">
          <div>
            <strong style="color:var(--white-pure);">${item.title}</strong>
            <div style="font-size:0.7rem; color:var(--white-60);">$000.000 CLP (Cotización) x ${item.qty}</div>
          </div>
          <div style="text-align:right;">
            <button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:var(--rose-gold);cursor:pointer;font-size:0.7rem;">Eliminar</button>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;
    if (cartTotalEl) cartTotalEl.textContent = '$000.000 CLP';
  }

  window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  // Checkout desde Carrito
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("El carrito está vacío. Agrega un servicio primero.");
        return;
      }
      pendingBookingItems = [...cart];
      closeCart();
      openLeadModal(pendingBookingItems);
    });
  }

  // Modal de Captura de Leads
  function openLeadModal(items) {
    modalItemsSummary.innerHTML = items.map(i => `<div>• <strong>${i.title}</strong> ${i.qty > 1 ? '(x' + i.qty + ')' : ''}</div>`).join('');
    leadModal.classList.add('active');
  }

  function hideLeadModal() {
    leadModal.classList.remove('active');
  }

  if (closeLeadModal) closeLeadModal.addEventListener('click', hideLeadModal);

  // Envío del Formulario e Integración con WhatsApp
  if (leadForm) {
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('leadNombre').value.trim();
      const apellido = document.getElementById('leadApellido').value.trim();
      const phone = document.getElementById('leadPhone').value.trim();
      const email = document.getElementById('leadEmail').value.trim();

      const d1 = document.getElementById('dateOption1').value;
      const d2 = document.getElementById('dateOption2').value;
      const d3 = document.getElementById('dateOption3').value;

      // Formatear fechas a legible (DD/MM/AAAA)
      function formatDate(dStr) {
        if (!dStr) return 'Sin especificar';
        const parts = dStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      let msg = `✨ *NUEVA SOLICITUD DE RESERVA — JACQUELINEBARRAZA.CL* ✨\n\n`;
      msg += `👤 *DATOS DE LA CLIENTA:*\n`;
      msg += `• *Nombre:* ${nombre} ${apellido}\n`;
      msg += `• *WhatsApp:* ${phone}\n`;
      msg += `• *Correo:* ${email}\n\n`;

      msg += `📅 *DÍAS PREFERIDOS PARA CITA (COINCIDENCIA DE AGENDA):*\n`;
      msg += `1. ${formatDate(d1)}\n`;
      msg += `2. ${formatDate(d2)}\n`;
      msg += `3. ${formatDate(d3)}\n\n`;

      msg += `💅 *SERVICIO(S) SOLICITADO(S):*\n`;
      pendingBookingItems.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.title} ${item.qty > 1 ? '(x' + item.qty + ')' : ''}\n`;
      });

      msg += `\nℹ️ *Nota:* Formulario enviado para coordinar match de disponibilidad en Providencia / Antofagasta.`;

      hideLeadModal();
      leadForm.reset();

      // Vaciar carrito si la solicitud vino del checkout del carrito
      if (cart.length > 0 && pendingBookingItems === cart) {
        cart = [];
        updateCartUI();
      }

      window.open(`${WA_BASE_URL}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
});
