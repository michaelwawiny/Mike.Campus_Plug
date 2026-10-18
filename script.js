const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");
const categoryFilter = document.getElementById("category-filter");
const productGrid = document.getElementById("product-grid");
const emptyMessage = document.getElementById("empty-message");
const startSelling = document.getElementById("start-selling");

// Replace with your WhatsApp number, including country code.
// Example format for Kenya: 2547XXXXXXXX
const SELLER_WHATSAPP = "2547XXXXXXXX";

const starterProducts = [
    {
        id: 1,
        name: "HP Laptop",
        category: "Electronics",
        price: 25000,
        seller: "Brian",
        emoji: "💻",
        phone: ""
    },
    {
        id: 2,
        name: "Calculus Textbook",
        category: "Books",
        price: 800,
        seller: "Sarah",
        emoji: "📚",
        phone: ""
    },
    {
        id: 3,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 1500,
        seller: "Kevin",
        emoji: "🎧",
        phone: ""
    }
];

let products;

try {
    const savedProducts = localStorage.getItem("campusplug-products");
    products = savedProducts ? JSON.parse(savedProducts) : starterProducts;

    if (!Array.isArray(products)) {
        products = starterProducts;
    }
} catch {
    products = starterProducts;
}

function saveProducts() {
    localStorage.setItem("campusplug-products", JSON.stringify(products));
}

function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;

    const filteredProducts = products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory =
            selectedCategory === "all" ||
            product.category === selectedCategory;

        return matchesName && matchesCategory;
    });

    productGrid.replaceChildren();

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("div");
        image.className = "product-image";
        image.textContent = product.emoji;

        const info = document.createElement("div");
        info.className = "product-info";

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = `KSh ${product.price.toLocaleString()}`;

        const seller = document.createElement("p");
        seller.className = "seller";
        seller.textContent = `Listed by ${product.seller}`;

        const contact = document.createElement("button");
        contact.className = "contact-button";
        contact.textContent = "Contact seller";
        contact.addEventListener("click", () => contactSeller(product));

        const remove = document.createElement("button");
        remove.className = "contact-button";
        remove.style.marginTop = "8px";
        remove.textContent = "Delete listing";
        remove.addEventListener("click", () => deleteProduct(product.id));

        info.append(category, name, price, seller, contact, remove);
        card.append(image, info);
        productGrid.append(card);
    });

    emptyMessage.hidden = filteredProducts.length !== 0;
}

function contactSeller(product) {
    const phone = String(product.phone || "").replace(/\D/g, "");

    if (!phone) {
        alert("The seller hasn't provided a contact number yet.");
        return;
    }

    const message = `Hi! I'm interested in your ${product.name} listed on CampusPlug.`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank", "noopener,noreferrer");
}

function deleteProduct(id) {
    const confirmed = confirm("Are you sure you want to delete this listing?");

    if (!confirmed) return;

    products = products.filter(product => product.id !== id);
    saveProducts();
    renderProducts();
}

function openListingForm() {
    if (document.getElementById("listing-form")) return;

    const form = document.createElement("form");
    form.id = "listing-form";
    form.style.cssText =
        "max-width:500px;margin:25px auto;padding:20px;border:1px solid #ddd;border-radius:8px;display:grid;gap:12px;";

    form.innerHTML = `
        <h3>List your item</h3>

        <label>
            Product name
            <input name="name" required maxlength="80"
                placeholder="e.g. Scientific calculator">
        </label>

        <label>
            Category
            <select name="category" required>
                <option value="Electronics">Electronics</option>
                <option value="Books">Books</option>
                <option value="Fashion">Fashion</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
            </select>
        </label>

        <label>
            Price (KSh)
            <input name="price" type="number" required min="1" step="1">
        </label>

        <label>
            Seller name
            <input name="seller" required maxlength="60">
        </label>

        <label>
            WhatsApp number
            <input name="phone" type="tel"
                placeholder="2547XXXXXXXX" required>
        </label>

        <label>
            Product emoji
            <input name="emoji" maxlength="8" value="🛍️">
        </label>

        <button class="contact-button" type="submit">Publish listing</button>
        <button class="contact-button" id="cancel-listing" type="button">
            Cancel
        </button>

        <p id="form-message" role="status"></p>
    `;

    startSelling.insertAdjacentElement("afterend", form);

    form.querySelector("#cancel-listing").addEventListener("click", () => {
        form.remove();
    });

    form.addEventListener("submit", event => {
        event.preventDefault();

        const data = new FormData(form);
        const name = String(data.get("name")).trim();
        const seller = String(data.get("seller")).trim();
        const phone = String(data.get("phone")).replace(/\D/g, "");
        const price = Number(data.get("price"));

        if (!name || !seller || !Number.isSafeInteger(price) || price <= 0) {
            alert("Enter a valid product name, seller name, and price.");
            return;
        }

        if (phone.length < 10 || phone.length > 15) {
            alert("Enter a valid phone number with its country code.");
            return;
        }

        products.unshift({
            id: Date.now(),
            name,
            category: String(data.get("category")),
            price,
            seller,
            phone,
            emoji: String(data.get("emoji") || "🛍️")
        });

        try {
            saveProducts();
        } catch {
            products.shift();
            alert("Unable to save the listing in this browser.");
            return;
        }

        searchInput.value = "";
        categoryFilter.value = "all";
        renderProducts();
        form.remove();

        document.getElementById("marketplace").scrollIntoView({
            behavior: "smooth"
        });
    });
}

searchForm.addEventListener("submit", event => {
    event.preventDefault();
    renderProducts();
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
startSelling.addEventListener("click", openListingForm);

saveProducts();
renderProducts();