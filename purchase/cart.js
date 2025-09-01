// ----------------------
// CART MANAGEMENT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
    // Add event listeners to "Add to Cart" buttons on product page
    const addToCartButtons = document.querySelectorAll(".button_addToCart");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", product_getProductID);
    });

    document.getElementById("products_container").addEventListener("click", (event) => {
        if (event.target.classList.contains("shopPage_button_addToCart")) {
          const productID = event.target.dataset.productId;
          addToCart(productID)
        }
    });

    // Add event listener to "Checkout" button
    const checkoutBtn = document.getElementById("button_checkout");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", startCheckout);
    }

    // Merge guest cart → user cart when user logs in
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            mergeGuestCartIntoUserCart(user.uid);
        }
    });
});


// ----------------------
// ADD PRODUCT TO CART
// ----------------------

function product_getProductID() {
    const productId = urlParams.get('productID');
    addToCart(productID)
    
}

function addToCart(productId) {
    const productRef = firebase.database().ref(`/products/${productId}/`);
    productRef.once("value").then(snapshot => {
        var snapshot = snapshot.val()
        var product = {
            id: productId,
            name: snapshot.productName,
            price: snapshot.price,
            mainImage: snapshot.mainImage,
            size: snapshot.size,
            quantity: 1
        };

        console.log(product)

    const user = firebase.auth().currentUser;

    if (user) {
        console.log('user is logged in')
        // Save to Firebase
        console.log(product)
        const cartRef = firebase.database().ref(`/accounts/${user.uid}/cart/${product.id}`);
        cartRef.once("value").then(snapshot => {
            const existing = snapshot.val();
            console.log('existing: ' + existing)
            console.log(cartRef)
            const newQty = (existing ? existing.quantity : 0) + 1;

            cartRef.set({
                ...product,
                quantity: newQty
            });

        });
    } else {
        console.log('user is not logged in')
        // Save to localStorage
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find(item => item.id === product.id);

        console.log(product)

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem("cart", JSON.stringify(cart));
    }

    alert(`${product.name} added to cart!`);
    });
}

// ----------------------
// CHECKOUT
// ----------------------
async function startCheckout() {
    let items = [];
    const user = firebase.auth().currentUser;

    if (user) {
        console.log('user logged in')
        // Get cart from Firebase
        const snapshot = await firebase.database().ref(`/accounts/${user.uid}/cart`).once("value");
        const cart = snapshot.val() || {};
        items = Object.values(cart);
        console.log(items)
    } else {
        // Get cart from localStorage
        console.log('user not logged in')
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        items = cart;
    }

    if (items.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    try {
        console.log("Starting checkout...");

        const response = await fetch("https://createpaymentlink-cpk5xp36za-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: items.map(item => ({
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

// ----------------------
// MERGE GUEST CART → USER CART
// ----------------------
async function mergeGuestCartIntoUserCart(uid) {
    const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (guestCart.length === 0) return; // nothing to merge

    const userCartRef = firebase.database().ref(`/accounts/${uid}/cart`);
    const snapshot = await userCartRef.once("value");
    const userCart = snapshot.val() || {};

    // Merge each guest item into user cart
    guestCart.forEach(item => {
        const existing = userCart[item.id];
        const newQty = (existing ? existing.quantity : 0) + item.quantity;

        userCart[item.id] = { ...item, quantity: newQty };
    });

    // Save merged cart
    await userCartRef.set(userCart);

    // Clear guest cart
    localStorage.removeItem("cart");
    console.log("Merged guest cart into user cart.");
}

// ----------------------
// RETRIEVE THE CART FOR CART.HTML
// ----------------------
function loadCart() {
    console.log('hi')
    firebase.auth().onAuthStateChanged(user => {
        var cart = [];
        // if user is logged in
        if (user) {
            console.log('user logged in')

            const cartRef = firebase.database().ref(`/accounts/${user.uid}/cart`);
            cartRef.once("value").then(snapshot => {
                // create cart array
                snapshot.forEach(function(childSnapshot) {
                    console.log('happening')
                    cart.push({
                        key: childSnapshot.key,
                        value: childSnapshot.val()
                    });
                    console.log(cart)
                })
                populateCartDiv(cart, user);
            });
        } else {
            let storedCartString = localStorage.getItem("cart");
            cart = JSON.parse(storedCartString);
            
            document.getElementById("cart_alert").innerHTML = 
            '<button><a href="/account/account.html">Sign in to save your cart</a></button>'
            populateCartDiv(cart, user);
        }

    });
}

// ----------------------
// POPULATE THE CART ON CART.HTML
// ----------------------
function populateCartDiv(cart, user) {
    console.log(cart)
    // clear cart div
    let cartItemsDiv = document.getElementById("cartItems");
    cartItemsDiv.innerHTML = "";

    var total = 0;

    // populate cart div

    cart.forEach(item => {
        var productID = item.key;
        if (user) {
            var price = item.value.price
            var quantity = item.value.quantity
            var name = item.value.name;
            var size = item.value.size;
            var mainImage = item.value.mainImage;
        } else {
            var price = item.price
            var quantity = item.quantity
            var name = item.name;
            var size = item.size;
            var mainImage = item.mainImage
        }

        console.log(mainImage)
        total += price * quantity;
        cartItemsDiv.innerHTML += `
            <div class="product">
                <div onclick="goToPage('${productID}')" class="image">
                    <img src="${mainImage}">
                </div>
                <div class="info">
                    <h3  onclick="goToPage('${productID}')">${name}</h3>
                    <p>Size: ${size}</p>
                    <p>Price: $${price} x ${quantity}</p>
                </div>
                <div onclick="removeProduct('${productID}', '${user.uid}')" class="remove">
                    <img src="/images/x.png">
                </div>
            </div>
        `;
    })
    document.getElementById("cartTotal").innerText = "Total: $" + total.toFixed(2);
}

function goToPage(productID) {
    window.location=`/products/product.html?productID=${productID}`;
}

function removeProduct(productID, uid) {
    console.log(productID);

    var productRef = firebase.database().ref(`/accounts/${uid}/cart/${productID}`);
    productRef.remove()
        .then(function() {
            location.reload();
            console.log('success');
        })
        .catch(function(error) {
            console.log('failure', error);
            alert(`There was an error deleting '${product.name}' from the cart. Please try again.`);
        });
}
