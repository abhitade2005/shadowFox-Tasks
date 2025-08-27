
    // ======= Demo Product Data =======
    const PRODUCTS = [
      {id:1, name:'Quantum Keyboard K1', category:'Electronics', price:3999, mrp:4999, rating:4.6, stock:18, img:'https://picsum.photos/seed/kb1/600/400', new:true, popular:9},
      {id:2, name:'Comfort Running Shoes', category:'Footwear', price:2499, mrp:2999, rating:4.2, stock:0, img:'https://picsum.photos/seed/shoe1/600/400', new:false, popular:7},
      {id:3, name:'Aurora Wireless Mouse', category:'Electronics', price:1299, mrp:1799, rating:4.4, stock:35, img:'https://picsum.photos/seed/mouse/600/400', new:true, popular:8},
      {id:4, name:'Explorer Backpack 28L', category:'Bags', price:1899, mrp:2499, rating:4.1, stock:12, img:'https://picsum.photos/seed/bag1/600/400', new:false, popular:6},
      {id:5, name:'Ceramic Coffee Mug', category:'Home', price:399, mrp:599, rating:4.0, stock:120, img:'https://picsum.photos/seed/mug/600/400', new:true, popular:5},
      {id:6, name:'Denim Jacket Classic', category:'Apparel', price:2299, mrp:2999, rating:4.3, stock:9, img:'https://picsum.photos/seed/denim/600/400', new:false, popular:7},
      {id:7, name:'Noise Cancelling Headphones', category:'Electronics', price:6499, mrp:7999, rating:4.7, stock:6, img:'https://picsum.photos/seed/cans/600/400', new:true, popular:10},
      {id:8, name:'Yoga Mat Pro', category:'Fitness', price:999, mrp:1499, rating:4.2, stock:44, img:'https://picsum.photos/seed/yoga/600/400', new:false, popular:4},
      {id:9, name:'Minimal Wallet', category:'Accessories', price:699, mrp:999, rating:3.9, stock:60, img:'https://picsum.photos/seed/wallet/600/400', new:false, popular:3},
      {id:10, name:'Trail Sneakers', category:'Footwear', price:2899, mrp:3599, rating:4.5, stock:14, img:'https://picsum.photos/seed/shoe2/600/400', new:true, popular:8},
      {id:11, name:'Graphic Tee “Code”', category:'Apparel', price:799, mrp:999, rating:4.1, stock:50, img:'https://picsum.photos/seed/tee/600/400', new:true, popular:6},
      {id:12, name:'Stainless Water Bottle 1L', category:'Home', price:899, mrp:1299, rating:4.4, stock:30, img:'https://picsum.photos/seed/bottle/600/400', new:false, popular:7},
    ];

    // ======= State =======
    const state = {
      q:'',
      categories:new Set(),
      minPrice:0,
      maxPrice:100000,
      rating:0,
      inStock:false,
      sort:'pop',
      cart: load('cart',[]),
      step:0,
      address: load('address', {name:'', phone:'', email:'', line1:'', line2:'', city:'', state:'', zip:''}),
      payment: load('payment', {method:'card', card:'', upi:''})
    };

    // ======= Utilities =======
    function save(key,val){localStorage.setItem(key,JSON.stringify(val))}
    function load(key,fb){try{return JSON.parse(localStorage.getItem(key)) ?? fb}catch{ return fb }}
    function money(n){return '₹'+ n.toLocaleString('en-IN')}
    function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600)}

    // ======= Init Filters =======
    const CATS = [...new Set(PRODUCTS.map(p=>p.category))].sort();
    const fCat = document.getElementById('fCat');
    CATS.forEach(c=>{
      const el = document.createElement('label');
      el.className='chip';
      el.innerHTML=`<input type="checkbox" value="${c}"> ${c}`;
      el.querySelector('input').addEventListener('change', (e)=>{
        e.target.checked? state.categories.add(c) : state.categories.delete(c);
        render();
      });
      fCat.appendChild(el);
    })

    // ======= UI Elements =======
    const q = document.getElementById('q');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const priceLabel = document.getElementById('priceLabel');
    const fRating = document.getElementById('fRating');
    const fInStock = document.getElementById('fInStock');
    const sort = document.getElementById('sort');
    const grid = document.getElementById('grid');
    const resultsCount = document.getElementById('resultsCount');

    q.addEventListener('input', ()=>{state.q=q.value.trim().toLowerCase(); render();});
    minPrice.addEventListener('input', ()=>{state.minPrice=+minPrice.value;syncPrice();render();});
    maxPrice.addEventListener('input', ()=>{state.maxPrice=+maxPrice.value;syncPrice();render();});
    fRating.addEventListener('change', ()=>{state.rating=+fRating.value; render();});
    fInStock.addEventListener('change', ()=>{state.inStock=fInStock.checked; render();});
    sort.addEventListener('change', ()=>{state.sort=sort.value; render();});
    document.getElementById('resetFilters').addEventListener('click', ()=>{
      state.q=''; q.value='';
      state.categories.clear(); fCat.querySelectorAll('input').forEach(i=>i.checked=false);
      state.minPrice=0; state.maxPrice=100000; minPrice.value=0; maxPrice.value=100000; syncPrice();
      state.rating=0; fRating.value='0';
      state.inStock=false; fInStock.checked=false;
      state.sort='pop'; sort.value='pop';
      render();
    });

    function syncPrice(){
      if(state.minPrice>state.maxPrice){[state.minPrice,state.maxPrice]=[state.maxPrice,state.minPrice];minPrice.value=state.minPrice;maxPrice.value=state.maxPrice}
      priceLabel.textContent = `${state.minPrice} – ${state.maxPrice}`;
    }

    // ======= Filtering & Sorting =======
    function getFiltered(){
      return PRODUCTS.filter(p=>{
        if(state.q && !p.name.toLowerCase().includes(state.q)) return false;
        if(state.categories.size && !state.categories.has(p.category)) return false;
        if(p.price<state.minPrice || p.price>state.maxPrice) return false;
        if(p.rating < state.rating) return false;
        if(state.inStock && p.stock<=0) return false;
        return true;
      }).sort((a,b)=>{
        switch(state.sort){
          case 'plh': return a.price-b.price;
          case 'phl': return b.price-a.price;
          case 'new': return (b.new?-1:1) - (a.new?-1:1);
          case 'rtg': return b.rating - a.rating;
          default: return b.popular - a.popular;
        }
      });
    }

    // ======= Render Products =======
    function render(){
      const items = getFiltered();
      resultsCount.textContent = `${items.length} result${items.length!==1?'s':''}`;
      grid.innerHTML = '';
      if(!items.length){
        grid.innerHTML = `<div class="empty">No products found. Try adjusting filters.</div>`;
        return;
      }
      items.forEach(p=>{
        const el = document.createElement('article');
        el.className='card';
        el.innerHTML = `
          <div class="thumb">
            <img alt="${p.name}" src="${p.img}">
            ${p.new?'<span class="badge">New</span>':''}
          </div>
          <div class="content">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
              <strong>${p.name}</strong>
              <span class="rating">${'★'.repeat(Math.round(p.rating))}</span>
            </div>
            <div class="meta">${p.category} · ${p.stock>0?'<span style="color: var(--ok)">In Stock</span>':'<span style="color: var(--err)">Out of Stock</span>'}</div>
            <div class="price"><strong>${money(p.price)}</strong> <span class="cut">${money(p.mrp)}</span></div>
            <div class="actions">
              <button class="btn" data-quick="${p.id}">Quick View</button>
              <button class="btn primary" data-add="${p.id}" ${p.stock?'':'disabled'}>Add to Cart</button>
            </div>
          </div>`;
        grid.appendChild(el);
      });
    }

    // ======= Cart Logic =======
    function syncCartBadge(){
      document.getElementById('cartCount').textContent = state.cart.reduce((s,i)=>s+i.qty,0);
    }
    function addToCart(id){
      const p = PRODUCTS.find(p=>p.id===id);
      if(!p || p.stock<=0) return toast('Out of stock');
      const found = state.cart.find(i=>i.id===id);
      if(found){found.qty = Math.min(found.qty+1, p.stock)} else {state.cart.push({id, qty:1});}
      save('cart',state.cart); syncCartBadge(); renderCart(); toast('Added to cart');
    }
    function removeFromCart(id){
      state.cart = state.cart.filter(i=>i.id!==id); save('cart',state.cart); syncCartBadge(); renderCart();
    }
    function updateQty(id,delta){
      const item = state.cart.find(i=>i.id===id); if(!item) return;
      const p = PRODUCTS.find(p=>p.id===id);
      item.qty = Math.max(1, Math.min((item.qty||1)+delta, p.stock));
      save('cart',state.cart); renderCart(); syncCartBadge();
    }
    function totals(){
      const sub = state.cart.reduce((s,i)=>{
        const p=PRODUCTS.find(p=>p.id===i.id); return s + (p.price*(i.qty||1));
      },0);
      const shipping = sub>5000?0:199;
      const tax = Math.round(sub*0.18);
      const total = sub+shipping+tax;
      return {sub, shipping, tax, total};
    }

    const cartDrawer = document.getElementById('cartDrawer');
    function renderCart(){
      const wrap = document.getElementById('cartItems');
      wrap.innerHTML='';
      if(!state.cart.length){
        wrap.innerHTML = '<div class="empty">Your cart is empty.</div>';
      } else {
        state.cart.forEach(i=>{
          const p=PRODUCTS.find(p=>p.id===i.id);
          const el=document.createElement('div');
          el.className='cart-item';
          el.innerHTML=`
            <img src="${p.img}" alt="${p.name}" style="width:64px;height:64px;border-radius:10px;object-fit:cover">
            <div>
              <div style="display:flex;justify-content:space-between;gap:8px">
                <strong>${p.name}</strong>
                <button class="btn" data-remove="${p.id}">Remove</button>
              </div>
              <div class="meta">${money(p.price)} · ${p.category}</div>
              <div class="qty" style="margin-top:8px">
                <button data-dec="${p.id}">−</button>
                <span aria-live="polite">${i.qty||1}</span>
                <button data-inc="${p.id}">+</button>
              </div>
            </div>
            <div style="display:grid;place-items:center"><strong>${money(p.price*(i.qty||1))}</strong></div>`;
          wrap.appendChild(el);
        })
      }
      const t = totals();
      document.getElementById('subtotal').textContent = money(t.sub);
      document.getElementById('shipping').textContent = money(t.shipping);
      document.getElementById('tax').textContent = money(t.tax);
      document.getElementById('total').textContent = money(t.total);
    }

    // Drawer controls
    document.getElementById('openCart').addEventListener('click',()=>{cartDrawer.classList.add('open'); renderCart();});
    document.getElementById('closeCart').addEventListener('click',()=>cartDrawer.classList.remove('open'));
    cartDrawer.addEventListener('click',e=>{ if(e.target.dataset.close!==undefined) cartDrawer.classList.remove('open'); });
    document.getElementById('checkoutBtn').addEventListener('click',()=>{cartDrawer.classList.remove('open'); openCheckout();});

    // Delegate clicks (grid + cart)
    document.body.addEventListener('click', (e)=>{
      const add = e.target.closest('[data-add]');
      if(add){ addToCart(+add.dataset.add); }
      const rm = e.target.closest('[data-remove]');
      if(rm){ removeFromCart(+rm.dataset.remove); }
      const inc = e.target.closest('[data-inc]');
      if(inc){ updateQty(+inc.dataset.inc, +1); }
      const dec = e.target.closest('[data-dec]');
      if(dec){ updateQty(+dec.dataset.dec, -1); }
    });

    // ======= Checkout Flow =======
    const checkout = document.getElementById('checkout');
    const stepBody = document.getElementById('stepBody');
    const steps = Array.from(document.querySelectorAll('.step'));
    const prevStep = document.getElementById('prevStep');
    const nextStep = document.getElementById('nextStep');

    function openCheckout(){
      if(!state.cart.length){ toast('Cart is empty'); return; }
      state.step=0; renderSteps(); checkout.classList.add('open');
    }
    function closeCheckout(){ checkout.classList.remove('open'); }

    document.querySelectorAll('.checkout .overlay').forEach(o=>o.addEventListener('click', e=>{ if(e.target.dataset.close!==undefined) closeCheckout(); }))

    prevStep.addEventListener('click', ()=>{ if(state.step>0){ state.step--; renderSteps(); }});
    nextStep.addEventListener('click', ()=>{
      if(state.step===0){ state.step=1; renderSteps(); return; }
      if(state.step===1){ if(!validateAddress()) return; state.step=2; renderSteps(); return; }
      if(state.step===2){ if(!validatePayment()) return; state.step=3; renderSteps(); return; }
      if(state.step===3){ placeOrder(); }
    });

    function renderSteps(){
      steps.forEach(s=>s.classList.toggle('active', +s.dataset.step===state.step));
      prevStep.style.visibility = state.step===0? 'hidden':'visible';
      nextStep.textContent = state.step===3? 'Place Order' : 'Next';
      if(state.step===0) renderStepCart();
      if(state.step===1) renderStepAddress();
      if(state.step===2) renderStepPayment();
      if(state.step===3) renderStepReview();
    }

    function renderStepCart(){
      const t = totals();
      stepBody.innerHTML = `
        <h3>Your items</h3>
        ${state.cart.map(i=>{ const p=PRODUCTS.find(p=>p.id===i.id); return `<div class="cart-item" style="grid-template-columns:80px 1fr auto"><img src="${p.img}" alt="${p.name}" style="width:80px;height:80px;border-radius:10px;object-fit:cover"><div><strong>${p.name}</strong><div class=meta>${p.category}</div><div>Qty: ${i.qty}</div></div><div><strong>${money(p.price*i.qty)}</strong></div></div>`}).join('')}
        <div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">
          <div class="row"><span>Subtotal</span><strong>${money(t.sub)}</strong></div>
          <div class="row"><span>Shipping</span><span>${money(t.shipping)}</span></div>
          <div class="row"><span>Tax</span><span>${money(t.tax)}</span></div>
          <div class="row" style="border-top:1px dashed var(--border);padding-top:8px"><strong>Total</strong><strong>${money(t.total)}</strong></div>
        </div>`;
    }

    function renderStepAddress(){
      const a = state.address;
      stepBody.innerHTML = `
        <h3>Shipping Address</h3>
        <form id="addrForm" class="form">
          <input required name="name" placeholder="Full name" value="${a.name}">
          <input required name="phone" placeholder="Phone" value="${a.phone}" pattern="[0-9]{10}">
          <input required type="email" name="email" placeholder="Email" value="${a.email}">
          <input required name="line1" placeholder="Address line 1" value="${a.line1}">
          <input name="line2" placeholder="Address line 2" value="${a.line2}">
          <div style="display:grid;grid-template-columns:1fr 1fr 140px;gap:12px">
            <input required name="city" placeholder="City" value="${a.city}">
            <input required name="state" placeholder="State" value="${a.state}">
            <input required name="zip" placeholder="PIN" value="${a.zip}" pattern="[0-9]{6}">
          </div>
        </form>`;
    }

    function validateAddress(){
      const form = document.getElementById('addrForm');
      if(!form.checkValidity()){ form.reportValidity(); toast('Please fill all required fields correctly.'); return false; }
      const data = Object.fromEntries(new FormData(form).entries());
      state.address = data; save('address', data); toast('Address saved'); return true;
    }

    function renderStepPayment(){
      const p = state.payment;
      stepBody.innerHTML = `
        <h3>Payment</h3>
        <div class="form">
          <label class="chip"><input type="radio" name="method" value="card" ${p.method==='card'?'checked':''}> Card</label>
          <label class="chip"><input type="radio" name="method" value="upi" ${p.method==='upi'?'checked':''}> UPI</label>
          <div id="payFields"></div>
        </div>`;
      stepBody.querySelectorAll('input[name=method]').forEach(r=>r.addEventListener('change', (e)=>{ state.payment.method=e.target.value; renderPayFields(); }));
      renderPayFields();
    }

    function renderPayFields(){
      const wrap = document.getElementById('payFields');
      if(state.payment.method==='card'){
        wrap.innerHTML = `
          <input id="cardNum" placeholder="Card number (demo)" value="${state.payment.card||''}" maxlength="19">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <input placeholder="MM/YY">
            <input placeholder="CVV">
          </div>`;
      } else {
        wrap.innerHTML = `<input id="upi" placeholder="UPI ID (demo)" value="${state.payment.upi||''}">`;
      }
    }

    function validatePayment(){
      if(state.payment.method==='card'){
        const v = (document.getElementById('cardNum').value||'').replace(/\s+/g,'');
        if(v.length<12){ toast('Enter a demo card number'); return false; }
        state.payment.card=v; state.payment.upi='';
      } else {
        const v = (document.getElementById('upi').value||'').trim();
        if(!v.includes('@')){ toast('Enter a demo UPI like name@bank'); return false; }
        state.payment.upi=v; state.payment.card='';
      }
      save('payment', state.payment); toast('Payment method saved'); return true;
    }

    function renderStepReview(){
      const t = totals();
      stepBody.innerHTML = `
        <h3>Review & Confirm</h3>
        <div class="panel" style="padding:12px;margin-bottom:12px">
          <strong>Ship to:</strong>
          <div class="meta">${state.address.name}, ${state.address.line1} ${state.address.line2?','+state.address.line2:''}, ${state.address.city}, ${state.address.state} ${state.address.zip}</div>
        </div>
        <div class="panel" style="padding:12px;margin-bottom:12px">
          <strong>Pay via:</strong>
          <div class="meta">${state.payment.method==='card' ? 'Card ••••'+(state.payment.card||'').slice(-4): 'UPI '+state.payment.upi}</div>
        </div>
        <div class="panel" style="padding:12px">
          <div class="row"><span>Total amount</span><strong>${money(t.total)}</strong></div>
        </div>`;
    }

    function placeOrder(){
      // In a real app, send to server. Here we simulate success.
      const orderId = 'SS'+Math.floor(100000+Math.random()*900000);
      const t = totals();
      stepBody.innerHTML = `<div class="empty">✅ Order placed successfully!<br><br><strong>Order ID:</strong> ${orderId}<br><strong>Amount:</strong> ${money(t.total)}<br><br>Check your email (${state.address.email}) for a confirmation (demo).</div>`;
      nextStep.textContent = 'Close';
      nextStep.onclick = ()=>{ closeCheckout(); nextStep.onclick=null; };
      // clear cart
      state.cart=[]; save('cart',state.cart); syncCartBadge(); renderCart();
    }

    // ======= Quick View (simple alert demo) =======
    document.body.addEventListener('click', (e)=>{
      const quick = e.target.closest('[data-quick]');
      if(!quick) return;
      const p = PRODUCTS.find(p=>p.id===+quick.dataset.quick);
      alert(`${p.name}\n\nCategory: ${p.category}\nPrice: ${money(p.price)}\nRating: ${p.rating}★\n\n${p.stock>0?'In stock':'Out of stock'}`);
    });

    // ======= Boot =======
    syncPrice(); render(); syncCartBadge();
  