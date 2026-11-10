document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 60);
  });

  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu  = document.getElementById('closeMenu');

  hamburger?.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeMenu?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu?.addEventListener('click', e => {
    if (e.target.tagName === 'A') mobileMenu.classList.remove('open');
  });

  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObs.observe(el));

  const cards    = document.querySelectorAll('.testi-card');
  const dotBtns  = document.querySelectorAll('.dot-btn');
  let   tIdx     = 0;
  let   testiInterval;

  function showTesti(i) {
    cards.forEach(c => c.classList.remove('active'));
    dotBtns.forEach(d => d.classList.remove('active'));
    cards[i]?.classList.add('active');
    dotBtns[i]?.classList.add('active');
    tIdx = i;
  }
  function nextTesti() { showTesti((tIdx + 1) % cards.length); }
  function startTesti() { testiInterval = setInterval(nextTesti, 4500); }

  dotBtns.forEach(d => {
    d.addEventListener('click', () => {
      clearInterval(testiInterval);
      showTesti(+d.dataset.i);
      startTesti();
    });
  });
  if (cards.length) startTesti();

  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `perspective(800px) rotateY(${x*12}deg) rotateX(${-y*10}deg) translateY(-10px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  const hCanvas = document.getElementById('heroCanvas');
  if (hCanvas) {
    const hCtx = hCanvas.getContext('2d');
    hCanvas.width  = window.innerWidth;
    hCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      hCanvas.width  = window.innerWidth;
      hCanvas.height = window.innerHeight;
    });

    const SPARKS = 80;
    const sparks = Array.from({length: SPARKS}, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 3 + .5,
      vx: (Math.random() - .5) * .6,
      vy: -(Math.random() * 2 + .5),
      life: Math.random(),
      maxLife: Math.random() * 0.7 + 0.3,
      trail: [],
    }));

    function drawSparks() {
      hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
      sparks.forEach(s => {
        // Record trail
        s.trail.push({x: s.x, y: s.y});
        if (s.trail.length > 8) s.trail.shift();

        s.x  += s.vx + Math.sin(s.y * 0.02) * 0.3;
        s.y  += s.vy;
        s.life -= .005;

        if (s.life <= 0) {
          s.x    = Math.random() * hCanvas.width;
          s.y    = hCanvas.height + 10;
          s.life = s.maxLife;
          s.trail = [];
        }

        const alpha = s.life / s.maxLife;
        const hue   = 10 + Math.random() * 30;

        // Draw trail
        for (let i = 0; i < s.trail.length - 1; i++) {
          const ta = (i / s.trail.length) * alpha * 0.4;
          hCtx.beginPath();
          hCtx.moveTo(s.trail[i].x, s.trail[i].y);
          hCtx.lineTo(s.trail[i+1].x, s.trail[i+1].y);
          hCtx.strokeStyle = `hsla(${hue}, 100%, 65%, ${ta})`;
          hCtx.lineWidth = s.r * (i / s.trail.length);
          hCtx.stroke();
        }

        // Draw spark
        const grad = hCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 2);
        grad.addColorStop(0, `hsla(${hue + 20}, 100%, 90%, ${alpha})`);
        grad.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        hCtx.beginPath();
        hCtx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
        hCtx.fillStyle = grad;
        hCtx.fill();
      });
      requestAnimationFrame(drawSparks);
    }
    drawSparks();
  }

  const p3Canvas = document.getElementById('pizza3dCanvas');
  if (p3Canvas && typeof THREE !== 'undefined') {
    const W = p3Canvas.clientWidth  || 500;
    const H = p3Canvas.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({ canvas: p3Canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 100);
    camera.position.set(0, 2.5, 6);
    camera.lookAt(0, 0, 0);

    // ── Lights
    const ambLight   = new THREE.AmbientLight(0xfff0e0, 0.5);
    const fireLight1 = new THREE.PointLight(0xFF4500, 4, 15);
    const fireLight2 = new THREE.PointLight(0xFF8C00, 2.5, 12);
    const topLight   = new THREE.DirectionalLight(0xFFDDAA, 1.8);
    const rimLight   = new THREE.DirectionalLight(0xFF6600, 0.8);

    fireLight1.position.set(3, 4, 4);
    fireLight1.castShadow = true;
    fireLight2.position.set(-3, 2, -3);
    topLight.position.set(0, 8, 5);
    rimLight.position.set(0, 3, -6);

    scene.add(ambLight, fireLight1, fireLight2, topLight, rimLight);

    // ── Pizza Group (all rotates together)
    const pizzaGroup = new THREE.Group();
    scene.add(pizzaGroup);

    // Dough base
    const baseGeo = new THREE.CylinderGeometry(2.0, 2.05, 0.25, 80);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0xC8782A, roughness: 0.88, metalness: 0.02 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.castShadow = true;
    pizzaGroup.add(base);

    // Crust ring
    const crustGeo = new THREE.TorusGeometry(1.95, 0.26, 24, 100);
    const crustMat = new THREE.MeshStandardMaterial({ color: 0xA0521A, roughness: 0.92 });
    const crust = new THREE.Mesh(crustGeo, crustMat);
    crust.rotation.x = Math.PI / 2;
    crust.position.y = 0.125;
    pizzaGroup.add(crust);

    // Sesame seeds on crust (small spheres)
    for (let i = 0; i < 30; i++) {
      const a = (i / 30) * Math.PI * 2;
      const sGeo = new THREE.SphereGeometry(0.035, 6, 6);
      const sMat = new THREE.MeshStandardMaterial({ color: 0xF5E6C8 });
      const seed = new THREE.Mesh(sGeo, sMat);
      seed.position.set(Math.cos(a) * 1.93, 0.28, Math.sin(a) * 1.93);
      pizzaGroup.add(seed);
    }

    // Tomato sauce
    const sauceGeo = new THREE.CylinderGeometry(1.65, 1.65, 0.045, 64);
    const sauceMat = new THREE.MeshStandardMaterial({ color: 0xC01818, roughness: 0.65 });
    const sauce = new THREE.Mesh(sauceGeo, sauceMat);
    sauce.position.y = 0.148;
    pizzaGroup.add(sauce);

    // Cheese
    const cheeseGeo = new THREE.CylinderGeometry(1.58, 1.58, 0.055, 64);
    const cheeseMat = new THREE.MeshStandardMaterial({ color: 0xF5D040, roughness: 0.48, metalness: 0.03 });
    const cheese = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheese.position.y = 0.195;
    pizzaGroup.add(cheese);

    // Cheese bubbles / blisters
    for (let i = 0; i < 18; i++) {
      const r = Math.random() * 1.3;
      const a = Math.random() * Math.PI * 2;
      const bGeo = new THREE.SphereGeometry(Math.random() * 0.09 + 0.04, 8, 8);
      const bMat = new THREE.MeshStandardMaterial({ color: 0xE8C030, roughness: 0.4 });
      const blister = new THREE.Mesh(bGeo, bMat);
      blister.position.set(Math.cos(a) * r, 0.22 + Math.random() * 0.04, Math.sin(a) * r);
      blister.scale.y = 0.5;
      pizzaGroup.add(blister);
    }

    // Pepperoni slices
    const pepPositions = [
      [0.75, 0.3], [-0.55, 0.85], [0, -0.95], [-0.9, -0.4],
      [0.5, -0.65], [-0.3, 0.25], [0.95, -0.55], [-0.7, 0.75],
      [0.2, 0.95], [-0.8, 0.1], [0.6, 0.6]
    ];
    pepPositions.forEach(([px, pz]) => {
      const pGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.065, 32);
      const pMat = new THREE.MeshStandardMaterial({ color: 0xAA1A00, roughness: 0.72 });
      const pep = new THREE.Mesh(pGeo, pMat);
      pep.position.set(px, 0.25, pz);
      pizzaGroup.add(pep);

      // Pepperoni texture dots
      for (let k = 0; k < 5; k++) {
        const dGeo = new THREE.SphereGeometry(0.02, 4, 4);
        const dMat = new THREE.MeshStandardMaterial({ color: 0x880800 });
        const dot = new THREE.Mesh(dGeo, dMat);
        const da = Math.random() * Math.PI * 2;
        const dr = Math.random() * 0.14;
        dot.position.set(px + Math.cos(da) * dr, 0.32, pz + Math.sin(da) * dr);
        pizzaGroup.add(dot);
      }
    });

    // Basil leaves
    const basilPositions = [[0.35, 0.22, -0.6], [-0.65, 0.22, 0.5], [0.85, 0.22, 0.6], [-0.2, 0.22, -0.3]];
    basilPositions.forEach(([bx, by, bz]) => {
      const bGeo = new THREE.SphereGeometry(0.16, 10, 6);
      bGeo.scale(1, 0.12, 0.65);
      const bMat = new THREE.MeshStandardMaterial({ color: 0x1A6E1A, roughness: 0.75, metalness: 0.05 });
      const basil = new THREE.Mesh(bGeo, bMat);
      basil.position.set(bx, by, bz);
      basil.rotation.y = Math.random() * Math.PI;
      pizzaGroup.add(basil);
    });

    // Floating steam particles above pizza
    const steamParticles = [];
    for (let i = 0; i < 20; i++) {
      const sGeo = new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 6, 6);
      const sMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12 + Math.random() * 0.1
      });
      const steam = new THREE.Mesh(sGeo, sMat);
      steam.position.set(
        (Math.random() - .5) * 2.5,
        0.5 + Math.random() * 2,
        (Math.random() - .5) * 2.5
      );
      steam.userData = {
        speed: 0.008 + Math.random() * 0.012,
        drift: (Math.random() - .5) * 0.005,
        startY: steam.position.y,
        phase: Math.random() * Math.PI * 2,
      };
      scene.add(steam);
      steamParticles.push(steam);
    }

    // Mouse interaction
    let mouseX = 0, mouseY = 0;
    const domEl = p3Canvas.parentElement || document.body;
    domEl.addEventListener('mousemove', e => {
      const rect = domEl.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    });

    // Animate
    function animate3D() {
      requestAnimationFrame(animate3D);
      const t = performance.now() * 0.001;

      // Rotate pizza group
      pizzaGroup.rotation.y = t * 0.4;

      // Float up/down + gentle tilt toward mouse
      pizzaGroup.position.y = Math.sin(t * 0.9) * 0.18;
      pizzaGroup.rotation.x = mouseY * 0.12 + Math.sin(t * 0.5) * 0.04;
      pizzaGroup.rotation.z = -mouseX * 0.08;

      // Pulsate fire lights dramatically
      fireLight1.intensity = 3.5 + Math.sin(t * 4.5) * 1.5 + Math.sin(t * 2.3) * 0.8;
      fireLight2.intensity = 2.2 + Math.sin(t * 3.2 + 1) * 1.0;
      fireLight1.position.x = 3 + Math.sin(t * 1.5) * 1.5;
      fireLight1.position.z = 4 + Math.cos(t * 1.2) * 1.5;

      // Animate steam
      steamParticles.forEach(s => {
        s.position.y += s.speed;
        s.position.x += s.drift + Math.sin(t * 2 + s.userData.phase) * 0.003;
        s.material.opacity *= 0.996;
        if (s.position.y > s.userData.startY + 2.5 || s.material.opacity < 0.01) {
          s.position.y = s.userData.startY;
          s.material.opacity = 0.1 + Math.random() * 0.1;
        }
      });

      renderer.render(scene, camera);
    }
    animate3D();

    window.addEventListener('resize', () => {
      const nW = p3Canvas.clientWidth;
      const nH = p3Canvas.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    });
  }

  const tabs = document.querySelectorAll('.tab');
  const menuItems = document.querySelectorAll('.menu-item');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.dataset.cat;

      menuItems.forEach(item => {
        const itemCat = item.dataset.cat || '';
        const matches = cat === 'all' || itemCat.includes(cat);
        if (matches) {
          item.style.display = '';
          item.classList.remove('hidden');
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => {
            item.style.transition = 'opacity .35s ease, transform .35s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 20);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'translateY(20px)';
          setTimeout(() => item.classList.add('hidden'), 350);
        }
      });
    });
  });

  let cart = [];

  const cartFab     = document.getElementById('cartFab');
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCart   = document.getElementById('closeCart');
  const cartCount   = document.getElementById('cartCount');
  const cartItems   = document.getElementById('cartItems');
  const cartTotal   = document.getElementById('cartTotal');
  const cartFooter  = document.getElementById('cartFooter');

  function openCart()   { cartSidebar?.classList.add('open'); cartOverlay?.classList.add('visible'); }
  function closeCartFn(){ cartSidebar?.classList.remove('open'); cartOverlay?.classList.remove('visible'); }

  cartFab?.addEventListener('click', openCart);
  closeCart?.addEventListener('click', closeCartFn);
  cartOverlay?.addEventListener('click', closeCartFn);

  window.addToCart = function(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty++; }
    else { cart.push({ name, price, qty: 1 }); }
    renderCart();
    if (cartFab) { cartFab.classList.add('visible'); cartFab.style.display = 'flex'; }
    openCart();
    cartFab?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 350, easing: 'cubic-bezier(.36,.07,.19,.97)' }
    );
  };

  function removeFromCart(name) {
    cart = cart.filter(i => i.name !== name);
    renderCart();
    if (!cart.length && cartFab) { cartFab.style.display = 'none'; }
  }

  function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(name); return; }
    renderCart();
  }

  function renderCart() {
    if (!cartItems) return;
    if (!cart.length) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty 🍕</p>';
      if (cartFooter) cartFooter.style.display = 'none';
      if (cartCount)  cartCount.textContent = '0';
      return;
    }
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    cartItems.innerHTML = cart.map(i => `
      <div class="cart-item">
        <div style="flex:1">
          <div class="cart-item-name">${i.name}</div>
          <div style="display:flex;align-items:center;gap:.6rem;margin-top:.4rem;">
            <button onclick="changeQty('${i.name}', -1)" style="width:24px;height:24px;border-radius:50%;background:var(--bg-card);border:1px solid var(--border);color:var(--text);font-size:.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">−</button>
            <span style="font-size:.9rem;color:var(--text-light);min-width:18px;text-align:center;">${i.qty}</span>
            <button onclick="changeQty('${i.name}', 1)" style="width:24px;height:24px;border-radius:50%;background:var(--fire);border:none;color:#fff;font-size:.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">+</button>
          </div>
        </div>
        <div class="cart-item-right">
          <span class="cart-item-price">₹${(i.price * i.qty).toLocaleString()}</span>
          <span class="remove-item" onclick="removeFromCart('${i.name}')">✕</span>
        </div>
      </div>
    `).join('');
    if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString()}`;
    if (cartFooter) cartFooter.style.display = 'block';
    const count = cart.reduce((s, i) => s + i.qty, 0);
    if (cartCount) cartCount.textContent = count;
  }

  window.removeFromCart = removeFromCart;
  window.changeQty = changeQty;

  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    contactForm.style.display = 'none';
    if (formSuccess) formSuccess.style.display = 'block';
  });

  const statNums = document.querySelectorAll('.stat-num');
  const statsBar = document.querySelector('.stats-bar');

  if (statsBar) {
    const statsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statNums.forEach(el => {
          const target = +el.dataset.target;
          const dur = 1800;
          const step = target / (dur / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = Math.floor(current).toLocaleString();
            if (current >= target) clearInterval(timer);
          }, 16);
        });
        statsObs.disconnect();
      }
    }, { threshold: 0.3 });
    statsObs.observe(statsBar);
  }

  const menuItemEls = document.querySelectorAll('.menu-item, .combo-card');
  if (menuItemEls.length) {
    const menuObs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => {
            e.target.style.transition = 'opacity .5s ease, transform .5s ease';
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
            menuObs.unobserve(e.target);
          }, i * 60);
        }
      });
    }, { threshold: 0.08 });
    menuItemEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      menuObs.observe(el);
    });
  }

  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity .5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { document.body.style.opacity = '1'; });
  });

});

// Sauce selector
  function selectSauce(el, name, price) {
    document.querySelectorAll('.sauce-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const notice = document.getElementById('sauceNotice');
    const text = document.getElementById('sauceText');
    text.textContent = name + (price > 0 ? ` (+₹${price})` : ' (free)') + ' selected';
    notice.style.display = 'block';
  }

  function showCoupons() {
  document.getElementById('couponOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCoupons() {
  document.getElementById('couponOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function copyCode(code, btn) {
  navigator.clipboard.writeText(code).catch(() => {});
  if (btn && btn.classList) {
    const orig = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = orig; btn.classList.remove('copied'); }, 2200);
  }
  showToast('🎟 Code Copied!', '"' + code + '" copied! Paste at checkout.');
}
function showToast(title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3800);
}

/* IPL countdown – 4h 32m 17s demo */
let iplSecs = 4*3600 + 32*60 + 17;
setInterval(() => {
  if (iplSecs <= 0) return;
  iplSecs--;
  const pad = n => String(n).padStart(2,'0');
  document.getElementById('iplH').textContent = pad(Math.floor(iplSecs/3600));
  document.getElementById('iplM').textContent = pad(Math.floor((iplSecs%3600)/60));
  document.getElementById('iplS').textContent = pad(iplSecs%60);
}, 1000);

/* Flash sale countdown – 2h 47m 33s */
let flashSecs = 2*3600 + 47*60 + 33;
setInterval(() => {
  if (flashSecs <= 0) return;
  flashSecs--;
  const pad = n => String(n).padStart(2,'0');
  document.getElementById('flashH').textContent = pad(Math.floor(flashSecs/3600));
  document.getElementById('flashM').textContent = pad(Math.floor((flashSecs%3600)/60));
  document.getElementById('flashS').textContent = pad(flashSecs%60);
}, 1000);

/* Deal popup after 5s */
setTimeout(() => {
  const p = document.getElementById('dealPopup');
  p.classList.add('show');
  setTimeout(() => p.classList.remove('show'), 8000);
}, 5000);

function showMenuToast(title, msg) {
  var t = document.getElementById('menuToast');
  document.getElementById('menuToastTitle').textContent = title;
  document.getElementById('menuToastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 3500);
}

const TOPPINGS_DATA = {
  "🧀 Extra Cheese": {
    items: [
      { name: "Mozzarella (Extra)", price: 79, img: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=100&q=80" },
      { name: "Cheddar Shredded", price: 69, img: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=100&q=80" },
      { name: "Parmesan Flakes", price: 89, img: "https://images.unsplash.com/photo-1619562631582-5e01b85573c1?w=100&q=80" },
      { name: "Gorgonzola Crumbles", price: 99, img: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=100&q=80" },
      { name: "Feta Cheese", price: 89, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&q=80" },
      { name: "Smoked Gouda", price: 99, img: "https://images.unsplash.com/photo-1518110925492-4568289e8606?w=100&q=80" },
      { name: "Ricotta Dollops", price: 79, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&q=80" },
      { name: "Cheese Burst Layer", price: 149, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&q=80" }
    ]
  },
  "🥩 Non-Veg Toppings": {
    items: [
      { name: "Pepperoni Slices", price: 99, img: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=100&q=80" },
      { name: "Grilled Chicken", price: 99, img: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=100&q=80" },
      { name: "Crispy Bacon Bits", price: 109, img: "https://images.unsplash.com/photo-1528607929212-2636ec44253e?w=100&q=80" },
      { name: "Italian Sausage", price: 109, img: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=100&q=80" },
      { name: "Smoked Ham", price: 99, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&q=80" },
      { name: "Minced Beef", price: 119, img: "https://images.unsplash.com/photo-1558030006-450675393462?w=100&q=80" },
      { name: "Spiced Lamb Keema", price: 129, img: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=100&q=80" },
      { name: "Tandoori Chicken", price: 109, img: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=100&q=80" },
      { name: "Prawns", price: 149, img: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=100&q=80" },
      { name: "Pulled BBQ Chicken", price: 119, img: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&q=80" }
    ]
  },
  "🌿 Veg Toppings": {
    items: [
      { name: "Mushroom Slices", price: 59, img: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=100&q=80" },
      { name: "Jalapeño Peppers", price: 49, img: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=100&q=80" },
      { name: "Red Onion Rings", price: 39, img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=100&q=80" },
      { name: "Bell Pepper Mix", price: 49, img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=100&q=80" },
      { name: "Black Olives", price: 59, img: "https://images.unsplash.com/photo-1599909533601-aa23a47b4a44?w=100&q=80" },
      { name: "Sun-dried Tomatoes", price: 69, img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&q=80" },
      { name: "Cherry Tomatoes", price: 49, img: "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=100&q=80" },
      { name: "Sweet Corn Kernels", price: 49, img: "https://images.unsplash.com/photo-1567375698348-5d9d5ae474f6?w=100&q=80" },
      { name: "Spinach Leaves", price: 49, img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100&q=80" },
      { name: "Artichoke Hearts", price: 79, img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=100&q=80" },
      { name: "Roasted Garlic", price: 39, img: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=100&q=80" },
      { name: "Pineapple Chunks", price: 49, img: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=100&q=80" },
      { name: "Caramelised Onion", price: 59, img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=100&q=80" },
      { name: "Fresh Basil Leaves", price: 29, img: "https://images.unsplash.com/photo-1618164435794-43327b6d1b71?w=100&q=80" },
      { name: "Arugula / Rocket", price: 39, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100&q=80" },
      { name: "Pickled Jalapeños", price: 49, img: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=100&q=80" }
    ]
  },
  "🫓 Indian Fusion": {
    items: [
      { name: "Paneer Tikka Cubes", price: 99, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&q=80" },
      { name: "Tandoori Mushroom", price: 89, img: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=100&q=80" },
      { name: "Spiced Chickpeas", price: 69, img: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=100&q=80" },
      { name: "Aloo Tikka Crispy", price: 79, img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&q=80" },
      { name: "Green Chilli Slit", price: 29, img: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=100&q=80" },
      { name: "Coriander Chutney Swirl", price: 39, img: "https://images.unsplash.com/photo-1618164435794-43327b6d1b71?w=100&q=80" },
      { name: "Mint Yoghurt Drizzle", price: 39, img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&q=80" }
    ]
  },
  "🌶️ Spicy Boosters": {
    items: [
      { name: "Habanero Chilli Flakes", price: 39, img: "https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=100&q=80" },
      { name: "Ghost Pepper Oil Drizzle", price: 59, img: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=100&q=80" },
      { name: "Chilli Garlic Sauce", price: 39, img: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2571?w=100&q=80" },
      { name: "Sriracha Swirl", price: 39, img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=100&q=80" },
      { name: "Guntur Chilli Powder", price: 29, img: "https://images.unsplash.com/photo-1599909533601-aa23a47b4a44?w=100&q=80" },
      { name: "Peri-Peri Seasoning", price: 39, img: "https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=100&q=80" }
    ]
  },
  "🥜 Premium Extras": {
    items: [
      { name: "Truffle Oil Drizzle", price: 129, img: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=100&q=80" },
      { name: "Pine Nuts Toasted", price: 99, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80" },
      { name: "Crushed Hazelnuts", price: 89, img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=100&q=80" },
      { name: "Wildflower Honey Glaze", price: 69, img: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&q=80" },
      { name: "Balsamic Glaze Swirl", price: 69, img: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=100&q=80" },
      { name: "Fresh Fig Slices", price: 99, img: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=100&q=80" },
      { name: "Prosciutto Crisps", price: 149, img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&q=80" },
      { name: "Anchovy Fillets", price: 99, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&q=80" }
    ]
  }
};

// --- SIZE OPTIONS ---
const SIZES = [
  { name: "Small", icon: "🍕", detail: "8 inch · Serves 1", multiplier: 0.75 },
  { name: "Medium", icon: "🍕🍕", detail: "10 inch · Serves 2", multiplier: 1 },
  { name: "Large", icon: "🍕🍕🍕", detail: "12 inch · Serves 3-4", multiplier: 1.4 }
];

// --- CRUST OPTIONS ---
const CRUSTS = [
  { name: "Classic Hand-Tossed", icon: "🫓", desc: "Traditional stretchy dough", extra: 0 },
  { name: "Thin & Crispy", icon: "🫒", desc: "Cracker-thin crunch", extra: 0 },
  { name: "Cheese-Stuffed Crust", icon: "🧀", desc: "Molten cheese ring inside", extra: 99 },
  { name: "Wood-Fired Neapolitan", icon: "🔥", desc: "Charred, puffy cornicione", extra: 49 },
  { name: "Stuffed Garlic Bread Crust", icon: "🧄", desc: "Garlic butter stuffed edge", extra: 79 },
  { name: "Gluten-Free Base", icon: "🌾", desc: "Cauliflower-blend GF dough", extra: 129 }
];

// --- STATE ---
let tmState = {
  basePrice: 0,
  name: '',
  desc: '',
  img: '',
  selectedSize: 1,      // index into SIZES
  selectedCrust: 0,      // index into CRUSTS
  selectedToppings: {},  // { toppingName: { qty, price } }
  maxToppings: 10
};

// --- OPEN MODAL ---
function openToppingModal(menuItem) {
  tmState.basePrice = parseInt(menuItem.dataset.price);
  tmState.name = menuItem.dataset.name;
  tmState.desc = menuItem.dataset.desc;
  tmState.img = menuItem.dataset.img;
  tmState.selectedSize = 1;
  tmState.selectedCrust = 0;
  tmState.selectedToppings = {};

  // Populate header
  document.getElementById('tmImg').src = tmState.img;
  document.getElementById('tmImg').alt = tmState.name;
  document.getElementById('tmName').textContent = tmState.name;
  document.getElementById('tmDesc').textContent = tmState.desc;
  document.getElementById('tmBasePrice').textContent = 'From ₹' + tmState.basePrice;
  document.getElementById('tmInstructions').value = '';

  // Build sizes
  const sizeGrid = document.getElementById('tmSizeGrid');
  sizeGrid.innerHTML = '';
  SIZES.forEach((s, i) => {
    const price = Math.round(tmState.basePrice * s.multiplier);
    const btn = document.createElement('div');
    btn.className = 'tm-size-btn' + (i === tmState.selectedSize ? ' active' : '');
    btn.innerHTML = `<span class="size-icon">${s.icon}</span><span class="size-name">${s.name}</span><span class="size-detail">${s.detail}</span><span class="size-price">₹${price}</span>`;
    btn.onclick = () => {
      tmState.selectedSize = i;
      sizeGrid.querySelectorAll('.tm-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateTmTotal();
    };
    sizeGrid.appendChild(btn);
  });

  // Build crusts
  const crustGrid = document.getElementById('tmCrustGrid');
  crustGrid.innerHTML = '';
  CRUSTS.forEach((c, i) => {
    const btn = document.createElement('div');
    btn.className = 'tm-crust-btn' + (i === tmState.selectedCrust ? ' active' : '');
    btn.innerHTML = `<span class="crust-icon">${c.icon}</span><div class="crust-info"><span class="crust-name">${c.name}</span><span class="crust-desc">${c.desc}</span></div><span class="crust-price-tag">${c.extra === 0 ? 'Free' : '+₹' + c.extra}</span>`;
    btn.onclick = () => {
      tmState.selectedCrust = i;
      crustGrid.querySelectorAll('.tm-crust-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateTmTotal();
    };
    crustGrid.appendChild(btn);
  });

  // Build toppings
  const container = document.getElementById('tmToppingsContainer');
  container.innerHTML = '';
  for (const [catName, catData] of Object.entries(TOPPINGS_DATA)) {
    const catDiv = document.createElement('div');
    catDiv.className = 'tm-topping-cat';
    catDiv.innerHTML = `<div class="tm-topping-cat-title">${catName}<span class="cat-line"></span></div>`;

    const grid = document.createElement('div');
    grid.className = 'tm-topping-grid';

    catData.items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'tm-topping-item';
      el.dataset.tname = item.name;
      el.dataset.tprice = item.price;
      el.innerHTML = `
        <img class="tm-topping-img" src="${item.img}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&q=80'"/>
        <div class="tm-topping-info">
          <span class="tm-topping-name">${item.name}</span>
          <span class="tm-topping-price">+₹${item.price}</span>
        </div>
        <div class="tm-topping-qty">
          <button class="qty-minus" data-tname="${item.name}">−</button>
          <span class="qty-val" id="qty-${item.name.replace(/\s+/g,'-')}">0</span>
          <button class="qty-plus" data-tname="${item.name}" data-tprice="${item.price}">+</button>
        </div>
      `;

      // Click on the item toggles it (add 1 if 0)
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('qty-minus') || e.target.classList.contains('qty-plus')) return;
        if (!tmState.selectedToppings[item.name]) {
          addToppingQty(item.name, item.price);
        }
      });

      grid.appendChild(el);
    });

    catDiv.appendChild(grid);
    container.appendChild(catDiv);
  }

  // Wire qty buttons via delegation
  container.addEventListener('click', handleToppingClick);

  updateTmTotal();

  // Show modal
  const overlay = document.getElementById('toppingModal');
  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('show'));
  document.body.style.overflow = 'hidden';
}

// Remove old listener to avoid duplicates
function handleToppingClick(e) {
  const minus = e.target.closest('.qty-minus');
  const plus = e.target.closest('.qty-plus');
  if (plus) {
    addToppingQty(plus.dataset.tname, parseInt(plus.dataset.tprice));
  } else if (minus) {
    removeToppingQty(minus.dataset.tname);
  }
}

function addToppingQty(name, price) {
  const totalToppings = Object.values(tmState.selectedToppings).reduce((a, b) => a + b.qty, 0);
  if (!tmState.selectedToppings[name] && totalToppings >= tmState.maxToppings) {
    showToast(`🔥 Max ${tmState.maxToppings} toppings allowed!`);
    return;
  }
  if (!tmState.selectedToppings[name]) {
    tmState.selectedToppings[name] = { qty: 0, price };
  }
  tmState.selectedToppings[name].qty++;
  refreshToppingUI(name);
  updateTmTotal();
}

function removeToppingQty(name) {
  if (!tmState.selectedToppings[name]) return;
  tmState.selectedToppings[name].qty--;
  if (tmState.selectedToppings[name].qty <= 0) {
    delete tmState.selectedToppings[name];
  }
  refreshToppingUI(name);
  updateTmTotal();
}

function refreshToppingUI(name) {
  const safeId = name.replace(/\s+/g, '-');
  const valEl = document.getElementById('qty-' + safeId);
  const itemEl = document.querySelector(`.tm-topping-item[data-tname="${name}"]`);
  if (valEl) valEl.textContent = tmState.selectedToppings[name] ? tmState.selectedToppings[name].qty : 0;
  if (itemEl) itemEl.classList.toggle('selected', !!tmState.selectedToppings[name]);
}

function updateTmTotal() {
  const sizePrice = Math.round(tmState.basePrice * SIZES[tmState.selectedSize].multiplier);
  const crustExtra = CRUSTS[tmState.selectedCrust].extra;
  const toppingsTotal = Object.values(tmState.selectedToppings).reduce((sum, t) => sum + (t.qty * t.price), 0);
  const total = sizePrice + crustExtra + toppingsTotal;
  document.getElementById('tmTotal').textContent = total.toLocaleString('en-IN');
}

function closeToppingModal() {
  const overlay = document.getElementById('toppingModal');
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }, 300);
}

function showToast(msg) {
  const toast = document.getElementById('tmToast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// --- ADD TO CART FROM MODAL ---
document.getElementById('tmAddBtn').addEventListener('click', () => {
  const sizeName = SIZES[tmState.selectedSize].name;
  const crustName = CRUSTS[tmState.selectedCrust].name;
  const toppingsArr = Object.entries(tmState.selectedToppings).map(([n, d]) => `${n} x${d.qty}`);
  const instructions = document.getElementById('tmInstructions').value.trim();

  // Build descriptive name
  let cartName = tmState.name + ` (${sizeName}, ${crustName})`;
  if (toppingsArr.length > 0) {
    cartName += ' + ' + toppingsArr.join(', ');
  }
  if (instructions) {
    cartName += ` [${instructions}]`;
  }

  const sizePrice = Math.round(tmState.basePrice * SIZES[tmState.selectedSize].multiplier);
  const crustExtra = CRUSTS[tmState.selectedCrust].extra;
  const toppingsTotal = Object.values(tmState.selectedToppings).reduce((sum, t) => sum + (t.qty * t.price), 0);
  const totalPrice = sizePrice + crustExtra + toppingsTotal;

  addToCart(cartName, totalPrice);

  showToast('✅ Customized ' + tmState.name + ' added to cart!');

  setTimeout(() => closeToppingModal(), 800);
});

// Close modal events
document.getElementById('tmClose').addEventListener('click', closeToppingModal);
document.getElementById('toppingModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('toppingModal')) closeToppingModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeToppingModal();
});

// --- MENU ITEM CLICK HANDLER ---
document.getElementById('menuGrid').addEventListener('click', (e) => {
  // Don't trigger if clicking the "Add to Cart" button directly
  if (e.target.closest('.order-btn')) return;

  const item = e.target.closest('.menu-item');
  if (!item) return;

  const isCustomizable = item.dataset.customizable === 'true';
  if (isCustomizable) {
    openToppingModal(item);
  } else {
    // Non-customizable items go straight to cart
    addToCart(item.dataset.name, parseInt(item.dataset.price));
    showToast('✅ ' + item.dataset.name + ' added to cart!');
  }
});