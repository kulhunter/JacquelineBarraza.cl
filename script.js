/* ==========================================================================
   JACQUELINE BARRAZA — SCRIPT DE INTERACTIVIDAD & WIZARD DE AGENDA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const WA_BASE_URL = "https://wa.link/2xsqzu";

  /* ------------------------------------------------------------------------
     1. GESTIÓN DEL CARRITO DE RESERVAS
     ------------------------------------------------------------------------ */
  let cart = [];
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartClose = document.getElementById('cartClose');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartCountEl = document.getElementById('cartCount');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function openCart() { if (cartDrawer) cartDrawer.classList.add('open'); }
  function closeCart() { if (cartDrawer) cartDrawer.classList.remove('open'); }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);

  // Agregar al Carrito
  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const title = btn.getAttribute('data-title');
      const price = btn.getAttribute('data-price') || "0";

      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, price: parseInt(price, 10), qty: 1 });
      }

      updateCartUI();
      openCart();
    });
  });

  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p style="font-size:0.8rem; color:var(--white-60);">No has seleccionado ningún servicio.</p>';
      if (cartTotalEl) cartTotalEl.textContent = '$000.000 CLP';
      return;
    }

    let html = '';
    let numericTotal = 0;
    let hasCustomQuote = false;

    cart.forEach(item => {
      if (item.price > 0) {
        numericTotal += item.price * item.qty;
      } else {
        hasCustomQuote = true;
      }

      const priceDisplay = item.price > 0 
        ? '$' + Number(item.price * item.qty).toLocaleString('es-CL') + ' CLP' 
        : '$000.000 CLP (Cotización)';

      html += `
        <div class="cart-item-row">
          <div>
            <strong style="color:var(--white-pure);">${item.title}</strong>
            <div style="font-size:0.7rem; color:var(--rose-light);">${priceDisplay} x ${item.qty}</div>
          </div>
          <div style="text-align:right;">
            <button onclick="removeFromCart('${item.id}')" style="background:none;border:none;color:var(--rose-gold);cursor:pointer;font-size:0.7rem;">Eliminar</button>
          </div>
        </div>
      `;
    });

    cartItemsContainer.innerHTML = html;

    if (cartTotalEl) {
      if (numericTotal > 0 && !hasCustomQuote) {
        cartTotalEl.textContent = '$' + Number(numericTotal).toLocaleString('es-CL') + ' CLP';
      } else if (numericTotal > 0 && hasCustomQuote) {
        cartTotalEl.textContent = '$' + Number(numericTotal).toLocaleString('es-CL') + ' CLP + Cotización';
      } else {
        cartTotalEl.textContent = '$000.000 CLP';
      }
    }
  }

  window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  };

  // Checkout desde el Carrito -> Abre el Wizard en el Paso 2/3
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      closeCart();
      const cartSummaryTitle = cart.map(i => `${i.title} (${i.qty > 1 ? 'x' + i.qty : '1'})`).join(', ');
      openBookingWizard(cartSummaryTitle);
    });
  }


  /* ------------------------------------------------------------------------
     2. LÓGICA DEL WIZARD DE AGENDAMIENTO POR PASOS (1 AL 4)
     ------------------------------------------------------------------------ */
  const wizardModal = document.getElementById('bookingWizardModal');
  const closeWizardBtn = document.getElementById('closeWizardModalBtn');
  const wizardForm = document.getElementById('wizardBookingForm');
  const wizardProgressFill = document.getElementById('wizardProgressFill');
  const wizardStepTitle = document.getElementById('wizardStepTitle');

  let currentWizardStep = 1;

  const stepTitles = {
    1: "Paso 1 de 4: Confirmar Servicio",
    2: "Paso 2 de 4: Seleccionar Sede",
    3: "Paso 3 de 4: Fechas Preferidas (3 Opciones)",
    4: "Paso 4 de 4: Tus Datos de Contacto"
  };

  // Restringir selectores de fecha desde el día actual
  const todayISO = new Date().toISOString().split('T')[0];
  ['wizDate1', 'wizDate2', 'wizDate3'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.min = todayISO;
  });

  // Abrir Wizard
  function openBookingWizard(defaultServiceTitle = null) {
    currentWizardStep = 1;
    updateWizardStepView();

    if (defaultServiceTitle) {
      const select = document.getElementById('wizServiceSelect');
      if (select) {
        let matchFound = false;
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value.toLowerCase().includes(defaultServiceTitle.toLowerCase())) {
            select.selectedIndex = i;
            matchFound = true;
            break;
          }
        }
        if (!matchFound) {
          // Si no está en las opciones base, asignar al primer elemento
          select.selectedIndex = 0;
        }
      }
    }

    if (wizardModal) wizardModal.classList.add('active');
  }

  function closeBookingWizard() {
    if (wizardModal) wizardModal.classList.remove('active');
  }

  // Triggers para abrir el wizard desde cualquier botón
  document.querySelectorAll('.wizard-trigger-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service');
      openBookingWizard(service);
    });
  });

  const navBookingBtn = document.getElementById('startBookingBtnNav');
  if (navBookingBtn) {
    navBookingBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingWizard();
    });
  }

  if (closeWizardBtn) closeWizardBtn.addEventListener('click', closeBookingWizard);

  // Navegación entre pasos
  document.querySelectorAll('.next-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateCurrentStep(currentWizardStep)) {
        currentWizardStep++;
        updateWizardStepView();
      }
    });
  });

  document.querySelectorAll('.prev-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentWizardStep > 1) {
        currentWizardStep--;
        updateWizardStepView();
      }
    });
  });

  // Selección visual de radio cards (Sede)
  document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
    });
  });

  // Validaciones por paso
  function validateCurrentStep(step) {
    if (step === 1) {
      const select = document.getElementById('wizServiceSelect');
      if (!select.value) {
        alert("Por favor selecciona un servicio.");
        return false;
      }
    } else if (step === 3) {
      const d1 = document.getElementById('wizDate1').value;
      const d2 = document.getElementById('wizDate2').value;
      const d3 = document.getElementById('wizDate3').value;

      if (!d1 || !d2 || !d3) {
        alert("Por favor selecciona las 3 fechas de preferencia para coordinar la coincidencia de agenda.");
        return false;
      }
    }
    return true;
  }

  // Actualizar la vista del wizard
  function updateWizardStepView() {
    document.querySelectorAll('.wizard-step').forEach(stepEl => {
      const stepNum = parseInt(stepEl.getAttribute('data-step'), 10);
      if (stepNum === currentWizardStep) {
        stepEl.classList.add('active');
      } else {
        stepEl.classList.remove('active');
      }
    });

    if (wizardStepTitle) wizardStepTitle.textContent = stepTitles[currentWizardStep] || "";
    if (wizardProgressFill) {
      wizardProgressFill.style.width = (currentWizardStep * 25) + '%';
    }
  }

  // Envío del Formulario Final -> Redirección a WhatsApp
  if (wizardForm) {
    wizardForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateCurrentStep(3)) return;

      const servicio = document.getElementById('wizServiceSelect').value;
      const sede = document.querySelector('input[name="wizSede"]:checked')?.value || "Providencia, Santiago";

      const d1 = document.getElementById('wizDate1').value;
      const d2 = document.getElementById('wizDate2').value;
      const d3 = document.getElementById('wizDate3').value;

      const nombre = document.getElementById('wizNombre').value.trim();
      const apellido = document.getElementById('wizApellido').value.trim();
      const phone = document.getElementById('wizPhone').value.trim();
      const email = document.getElementById('wizEmail').value.trim();
      const notes = document.getElementById('wizNotes').value.trim();

      function formatFecha(fStr) {
        if (!fStr) return "Sin especificar";
        const parts = fStr.split('-');
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }

      let msg = `✨ *SOLICITUD DE RESERVA Y COINCIDENCIA DE AGENDA* ✨\n`;
      msg += `*Página Oficial:* jacquelinebarraza.cl\n\n`;
      msg += `👤 *DATOS DE LA CLIENTA:*\n`;
      msg += `• *Nombre:* ${nombre} ${apellido}\n`;
      msg += `• *WhatsApp:* ${phone}\n`;
      msg += `• *Correo:* ${email}\n\n`;

      msg += `📍 *SEDE SELECCIONADA:*\n`;
      msg += `• ${sede}\n\n`;

      msg += `💅 *SERVICIO DENEGADO / SOLICITADO:*\n`;
      msg += `• ${servicio}\n\n`;

      msg += `📅 *3 FECHAS PREFERIDAS DE ATENCIÓN:*\n`;
      msg += `1️⃣ Opción 1: ${formatFecha(d1)}\n`;
      msg += `2️⃣ Opción 2: ${formatFecha(d2)}\n`;
      msg += `3️⃣ Opción 3: ${formatFecha(d3)}\n\n`;

      if (notes) {
        msg += `📝 *COMENTARIOS / ANTECEDENTES:*\n`;
        msg += `"${notes}"\n\n`;
      }

      msg += `ℹ️ *Nota:* Solicitud enviada para confirmar disponibilidad y match de agenda.`;

      closeBookingWizard();
      wizardForm.reset();

      window.open(`${WA_BASE_URL}?text=${encodeURIComponent(msg)}`, '_blank');
    });
  }
});


/* ------------------------------------------------------------------------
   3. MODAL DETALLE DE CERTIFICACIONES
   ------------------------------------------------------------------------ */
const certDetails = {
  phibrows: {
    title: "PhiBrows Royal Artist",
    code: "CM1637191961JB21734W",
    date: "17 de Noviembre de 2021",
    image: "566639218_18071938880233590_6565109749655810072_n.jpg",
    whatIs: "Es el estándar máximo global en Microblading hiperrealista pelo a pelo. Exige superar 12 niveles estrictos de simetría facial con compás áureo.",
    whyPro: "Garantiza a la clienta trazos hiperfinos que siguen exactamente el patrón de crecimiento del pelo natural, sin riesgo de migración de pigmento ni cicatrices."
  },
  boldbrows: {
    title: "BoldBrows Royal Artist",
    code: "CM1666009510JB34747W",
    date: "17 de Octubre de 2022",
    image: "571491049_18342428419207969_8986666842886361263_n.jpg",
    whatIs: "Técnica avanzada de trazo voluminoso y curvo que simula cejas despeinadas, hiper-naturales y con efecto multidimensional.",
    whyPro: "Permite trabajar rostros modernos que buscan alejarse de la ceja plana tradicional, adaptando cada trazo a la estructura del hueso frontal."
  },
  latinbrows: {
    title: "LatinBrows Royal Artist",
    code: "CH1680628206JB40011W",
    date: "04 de Abril de 2023",
    image: "574268951_18324528610245441_3167207847751632046_n.jpg",
    whatIs: "La fusión maestra entre el Microblading pelo a pelo y el sombreado sutil con dermógrafo (Powder Brows).",
    whyPro: "Es la solución definitiva para pieles mixtas o grasas donde el microblading puro no retiene con facilidad. Otorga cuerpo sin perder naturalidad."
  }
};

window.openCertModal = function(key) {
  const data = certDetails[key];
  if (!data) return;

  const modalBody = document.getElementById('certModalBody');
  const modalContainer = document.getElementById('certModal');

  if (modalBody && modalContainer) {
    modalBody.innerHTML = `
      <span class="tag-luxury">Ficha de Verificación Técnica</span>
      <h2 class="font-serif" style="font-size:1.4rem; color:#FFF; margin-bottom:0.3rem;">${data.title}</h2>
      <p style="font-size:0.75rem; color:var(--rose-gold); margin-bottom:1rem;">Código de Autenticidad: ${data.code} · ${data.date}</p>
      <img src="${data.image}" style="width:100%; border-radius:0.5rem; border:1px solid var(--rose-border); margin-bottom:1.2rem;">
      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:1rem; border-radius:0.5rem; margin-bottom:0.8rem;">
        <strong style="font-size:0.78rem; color:var(--rose-gold); display:block; margin-bottom:0.2rem;">¿QUÉ REPRESENTA ESTA CERTIFICACIÓN?</strong>
        <p style="font-size:0.82rem; color:var(--white-90);">${data.whatIs}</p>
      </div>
      <div style="background:var(--rose-gold-subtle); border:1px solid var(--rose-border); padding:1rem; border-radius:0.5rem;">
        <strong style="font-size:0.78rem; color:var(--rose-gold); display:block; margin-bottom:0.2rem;">¿CÓMO HACE A JACQUELINE MÁS MÁSTER?</strong>
        <p style="font-size:0.82rem; color:var(--white-90);">${data.whyPro}</p>
      </div>
    `;
    modalContainer.classList.add('active');
  }
};

window.closeCertModal = function() {
  const modalContainer = document.getElementById('certModal');
  if (modalContainer) modalContainer.classList.remove('active');
};
