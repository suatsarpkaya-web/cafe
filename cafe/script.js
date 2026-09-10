/* ==================== MOBİL MENÜ ==================== */
const navMenu = document.getElementById("nav-menu");
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");

if (navToggle) {
  navToggle.addEventListener("click", () => navMenu.classList.add("show-menu"));
}
if (navClose) {
  navClose.addEventListener("click", () =>
    navMenu.classList.remove("show-menu"),
  );
}

/* ==================== HERO DİNAMİK VİTRİN DEĞİŞİMİ ==================== */
const heroItems = [
  {
    title: "Artisan Flat White",
    price: "140 ₺",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Avokado Poşe Tost",
    price: "290 ₺",
    img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "San Sebastian Cheesecake",
    price: "230 ₺",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
  },
  {
    title: "Gusto Truffle Burger",
    price: "360 ₺",
    img: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop",
  },
];

let heroIndex = 0;
const centerImg = document.getElementById("center-img");
const centerTitle = document.getElementById("center-title");
const centerPrice = document.getElementById("center-price");

if (centerImg && centerTitle && centerPrice) {
  setInterval(() => {
    centerImg.classList.add("fade-out");
    setTimeout(() => {
      heroIndex = (heroIndex + 1) % heroItems.length;
      const cur = heroItems[heroIndex];
      centerImg.src = cur.img;
      centerTitle.textContent = cur.title;
      centerPrice.textContent = cur.price;
      centerImg.classList.remove("fade-out");
    }, 400);
  }, 3500);
}

/* ==================== KATEGORİ FİLTRELEME ==================== */
const filterBtns = document.querySelectorAll(".menu__filter-btn");
const menuCards = document.querySelectorAll(".menu__card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");

    menuCards.forEach((card) => {
      const category = card.getAttribute("data-category");
      if (filter === "all" || filter === category) {
        card.classList.remove("hide");
      } else {
        card.classList.add("hide");
      }
    });
  });
});

/* ==================== ONLINE SEPET YÖNETİMİ ==================== */
let cart = [];

const cartBtn = document.getElementById("cart-btn");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");
const cartItemsContainer = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotalPrice = document.getElementById("cart-total-price");

// Sepeti Aç/Kapat
function toggleCart(open = true) {
  if (open) {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("open");
  } else {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("open");
  }
}

cartBtn.addEventListener("click", () => toggleCart(true));
cartClose.addEventListener("click", () => toggleCart(false));
cartOverlay.addEventListener("click", () => toggleCart(false));

// Sepete Ürün Ekle
function addToCart(id, name, price) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: Number(price), qty: 1 });
  }
  updateCartUI();
}

// Miktar Artır/Azalt
function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  updateCartUI();
}

// Sepet Arayüzünü Güncelle
function updateCartUI() {
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCount.textContent = totalCount;
  cartTotalPrice.textContent = `${totalPrice} ₺`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="cart-empty">Sepetiniz şu anda boş.</p>';
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div>
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">${item.price} ₺ x ${item.qty}</div>
      </div>
      <div class="cart-item-controls">
        <button class="btn-qty" onclick="changeQty('${item.id}', -1)">-</button>
        <span>${item.qty}</span>
        <button class="btn-qty" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// Menüdeki Butonlara Tıklama & Bot Tetikleme
const addBtns = document.querySelectorAll(".btn-add-cart");
addBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-id");
    const name = btn.getAttribute("data-name");
    const price = btn.getAttribute("data-price");
    const category = btn.getAttribute("data-cat");

    addToCart(id, name, price);

    // Eğer yemek veya tatlı seçildiyse akıllı bot devreye girsin
    if (category === "food" || category === "dessert") {
      triggerDrinkBot(name, category);
    }
  });
});

/* ==================== AKILLI İÇECEK ÖNERİ BOTU (GUSTO BOT) ==================== */
const botPopup = document.getElementById("bot-popup");
const botClose = document.getElementById("bot-close");
const botMessage = document.getElementById("bot-message");
const botSugImg = document.getElementById("bot-sug-img");
const botSugTitle = document.getElementById("bot-sug-title");
const botSugPrice = document.getElementById("bot-sug-price");
const btnBotAdd = document.getElementById("btn-bot-add");

let currentBotItem = null;

const drinkRecommendations = {
  food: {
    id: "4",
    name: "Single Origin Cold Brew",
    price: 160,
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=250&auto=format&fit=crop",
    msg: "Yemeğinizin yanına enfes bir ferahlık! Single Origin Cold Brew öneriyoruz:",
  },
  dessert: {
    id: "1",
    name: "Artisan Flat White",
    price: 140,
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=250&auto=format&fit=crop",
    msg: "Tatlı ziyafetinizi kadifemsi bir Artisan Flat White ile taçlandırmak ister misiniz?",
  },
};

function triggerDrinkBot(productName, category) {
  const rec = drinkRecommendations[category];
  if (!rec) return;

  currentBotItem = rec;
  botMessage.textContent = `${productName} harika bir seçim! ${rec.msg}`;
  botSugImg.src = rec.img;
  botSugTitle.textContent = rec.name;
  botSugPrice.textContent = `${rec.price} ₺`;

  botPopup.classList.add("active");
}

botClose.addEventListener("click", () => {
  botPopup.classList.remove("active");
});

btnBotAdd.addEventListener("click", () => {
  if (currentBotItem) {
    addToCart(currentBotItem.id, currentBotItem.name, currentBotItem.price);
    botPopup.classList.remove("active");
  }
});

/* ==================== ÖDEME VE SİPARİŞ MODALI ==================== */
const checkoutModal = document.getElementById("checkout-modal");
const btnCheckout = document.getElementById("btn-checkout");
const checkoutClose = document.getElementById("checkout-close");
const modalTotalAmount = document.getElementById("modal-total-amount");
const checkoutForm = document.getElementById("checkout-form");
const cardFields = document.getElementById("card-fields");
const paymentRadios = document.querySelectorAll('input[name="payment-method"]');

btnCheckout.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Sepetinizde ürün bulunmamaktadır.");
    return;
  }
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  modalTotalAmount.textContent = `${total} ₺`;
  toggleCart(false);
  checkoutModal.classList.add("open");
});

checkoutClose.addEventListener("click", () => {
  checkoutModal.classList.remove("open");
});

// Ödeme yöntemi seçimi (Kredi Kartı / Kapıda Ödeme)
paymentRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    document
      .querySelectorAll(".payment-method-card")
      .forEach((c) => c.classList.remove("active"));
    e.target.closest(".payment-method-card").classList.add("active");

    if (e.target.value === "door") {
      cardFields.classList.add("hide");
      document
        .querySelectorAll(".card-input")
        .forEach((input) => input.removeAttribute("required"));
    } else {
      cardFields.classList.remove("hide");
      document
        .querySelectorAll(".card-input")
        .forEach((input) => input.setAttribute("required", "true"));
    }
  });
});

// Sipariş Tamamlama Formu
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();
  alert(
    "Harika! Siparişiniz başarıyla alındı ve mutfağa iletildi. Afiyet olsun!",
  );
  cart = [];
  updateCartUI();
  checkoutForm.reset();
  checkoutModal.classList.remove("open");
});

/* ==================== REZERVASYON FORMU ==================== */
const resForm = document.getElementById("res-form");
const feedback = document.getElementById("form-feedback");

if (resForm) {
  resForm.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.textContent =
      "Rezervasyon talebiniz alındı! En kısa sürede sizinle iletişime geçeceğiz.";
    feedback.style.color = "#2e7d32";
    resForm.reset();
    setTimeout(() => {
      feedback.textContent = "";
    }, 5000);
  });
}
