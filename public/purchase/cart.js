// ----------------------
// CART MANAGEMENT
// ----------------------
document.addEventListener("DOMContentLoaded", () => {

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

function addToCart() {
    console.log('button pressed')
    const user = firebase.auth().currentUser;
    const productId = urlParams.get('productID');

    var product = {};

    const productRef = firebase.database().ref(`/products/${productId}/`);
    productRef.once("value").then(snapshot => {
        var snapshot = snapshot.val()
        product = {
            id: productId,
            productName: snapshot.productName,
            price: snapshot.price,
            mainImage: snapshot.mainImage,
            size: snapshot.size,
            quantity: 1,
            stock: snapshot.stock
        };
        return product;
    }).then(product => {
        if (user) {
            console.log('user is logged in');
            const cartRef = firebase.database().ref(`/accounts/${user.uid}/cart/${product.id}`);
        
            cartRef.once("value").then(snapshot => {
                const existing = snapshot.val();
                const currentQty = existing ? existing.quantity : 0;
                const newQty = currentQty + 1;
        
                // Check against available stock
                if (newQty > product.stock) {
                    alert("Sorry, no more stock available for this item.");
                    return;
                }
        
                cartRef.set({
                    ...product,
                    quantity: newQty
                })
                .then(() => {
                    console.log("Cart updated successfully!");
                    const buttonDiv = document.getElementById("container_cartButton");
                    buttonDiv.innerHTML = `<div class="div_addToCart">Added to cart</div>`;
                })
                .catch((error) => {
                    alert("Error adding to your cart. Please try again.");
                });
            });
        
        } else {
            console.log('user is not logged in');
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            const existing = cart.find(item => item.id === product.id);
        
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + 1;

            console.log(currentQty, newQty)

            console.log(product.stock)
        
            // Check stock
            if (newQty > product.stock) {
                renderInCartButton()
                alert("Sorry, no more stock available for this item.");
                return;
            }
        
            if (existing) {
                existing.quantity = newQty;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
        
            localStorage.setItem("cart", JSON.stringify(cart));
            console.log(JSON.parse(localStorage.getItem("cart")));

        }
    })
        
}

// ----------------------
// CHECKOUT
// ----------------------
async function startCheckout() {
    const user = firebase.auth().currentUser;

    let cart;
    if (user) {
        const snapshot = await firebase.database().ref(`/accounts/${user.uid}/cart`).once("value");
        cart = snapshot.val() || {};
    } else {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
    }

    const items = user ? Object.values(cart) : cart; // cart is object for logged in, array for guest

    if (items.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    try {
        console.log(items);

        const response = await fetch("https://createpaymentlink-cpk5xp36za-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user ? user.uid : null, // optional for guest checkout
                email: user ? user.email : null, // optional
                items: items.map(item => ({
                    name: item.productName,
                    price: item.price,
                    id: item.id,
                    size: item.size,
                    mainImage: item.mainImage,
                    quantity: item.quantity
                }))
            })
        });


        const data = await response.json();

        if (data.url) {
            window.location.href = data.url;
        } else {
            console.error(data);
            alert("Failed to create checkout session.");
        }
    } catch (err) {
        console.error(err);
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
                populateCartDiv(cart);
            });
        } else {
            let storedCartString = localStorage.getItem("cart");
            cart = JSON.parse(storedCartString);

            console.log(cart)
            
            document.getElementById("cart_alert").innerHTML = 
            '<button><a href="/account/account.html">Sign in to save your cart</a></button>'
            populateCartDiv(cart);
        }

    });
}

// ----------------------
// POPULATE THE CART ON CART.HTML
// ----------------------
function populateCartDiv(cart) {
    let cartItemsDiv = document.getElementById("cartItems");
    let cartPricesDiv = document.getElementById("cartItemPrices");
    let cartTotal = document.getElementById("cartTotal");

    cartItemsDiv.innerHTML = "";

    var total = 0;
    var shipping = 7;

    const user = firebase.auth().currentUser;

    console.log(user)
    // populate cart div

    if (cart){
    cart.forEach(item => {
        if (user) {
            var productID = item.key;
            var price = item.value.price
            var quantity = item.value.quantity
            var productName = item.value.productName;
            var size = item.value.size;
            var mainImage = item.value.mainImage;
        } else {
            var productID = item.id;
            var price = item.price
            var quantity = item.quantity
            var productName = item.productName;
            var size = item.size;
            var mainImage = item.mainImage
        }

        cartPricesDiv.innerHTML += `<p>${productName}</p><p>$${price}</p>`

        total += price * quantity;
        cartItemsDiv.innerHTML += `
            <div class="product">
                <div onclick="goToPage('${productID}')" class="image">
                    <img src="${mainImage}">
                </div>
                <div class="info">
                    <h3  onclick="goToPage('${productID}')">${productName}</h3>
                    <p>Size: ${size}</p>
                    <p>Price: $${price} x ${quantity}</p>
                </div>
                <div onclick="removeProduct('${productID}')" class="remove">
                    <img src="/images/x.png">
                </div>
            </div>
        `;
    })

    total += shipping;
    cartPricesDiv.innerHTML += `<p>Shipping</p><p>$${shipping}</p>`
    cartTotal.innerText = "Total: $" + total.toFixed(2);

    } else {
        cartItemsDiv.innerHTML += `<p>Cart is empty</p>`
    }

}

function goToPage(productID) {
    window.location=`/products/product.html?productID=${productID}`;
}

function removeProduct(productID) {
    const user = firebase.auth().currentUser;

    if (user) {
        var productRef = firebase.database().ref(`/accounts/${uid}/cart/${productID}`);
        productRef.remove()
        .then(function() {
            location.reload();
            console.log('success');
        })
        .catch(function(error) {
            console.log('failure', error);
            alert(`There was an error deleting '${product.productName}' from the cart. Please try again.`);
        });
    } else {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart = cart.filter(item => item.id !== productID);
        localStorage.setItem("cart", JSON.stringify(cart));
        console.log("Updated cart:", cart);

        }

    
}
