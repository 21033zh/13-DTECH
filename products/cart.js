// ----------------------
// CART MANAGEMENT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    // Add event listeners to "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll(".button_addToCart");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", addToCart);
    });

    // Add event listener to "Checkout" button
    const checkoutBtn = document.getElementById("button_checkout");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", startCheckout);
    }
});

// Add product to cart
function addToCart() {
    const name = document.getElementById("h1_name").innerText;
    const price = parseFloat(document.getElementById("p_price").innerText.replace("$", ""));
    const size = document.getElementById("p_size").innerText;
    const productId = sessionStorage.getItem("CURRENT_PRODUCT_ID");

    const product = {
        id: productId,
        name,
        price,
        size,
        quantity: 1
    };

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${name} added to cart!`);
}

// ----------------------
// CHECKOUT
// ----------------------
async function startCheckout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    try {
        console.log("Starting checkout...");

        const response = await fetch("https://createpaymentlink-cpk5xp36za-uc.a.run.app", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                items: cart.map(item => ({
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                }))
            })
        });

        const data = await response.json();

        if (data.url) {
            // Redirect user to Stripe Checkout
            window.location.href = data.url;
        } else {
            alert("Failed to create checkout session.");
            console.error(data);
        }
    } catch (err) {
        console.error("Error starting checkout:", err);
        alert("Something went wrong while starting checkout.");
    }
}
