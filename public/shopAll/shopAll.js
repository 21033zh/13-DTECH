var colourFilter;
var sizeFilter;
var sortBy = 'date';      
var sortSettings = 'newest'; 
var productsArray = [];
var allProductsArray = []

let productsPerPage = 12;
let currentIndex = 0;
let userWishlist = {}; 


console.log('page load');

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("products_container").addEventListener("click", (event) => {
      if (event.target.classList.contains("shopPage_button_addToCart")) {
        const productID = event.target.dataset.productId;
        addToCart(productID);
      }
    });
});
  

document.getElementById("closePopup").addEventListener("click", () => {
    console.log('x button pressed')
    document.getElementById("wishlistPopup").classList.add("hidden");
});

// Optional: close popup if user clicks outside it
document.getElementById("wishlistPopup").addEventListener("click", (e) => {
    if (e.target.id === "wishlistPopup") {
        e.target.classList.add("hidden");
    }
});

function displayProducts(category) {
    console.log('displayProducts')
    productsArray = [];
    firebase.database().ref('/products/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var productInfo = childSnapshot.val();
            productsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        allProductsArray = [].concat(productsArray);

        // check if user is logged in, then get their wishlist
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                firebase.database().ref(`/accounts/${user.uid}/wishlist`).once('value').then(snap => {
                    userWishlist = snap.val() || {}; // save wishlist
                    createGrid(category);
                });
            } else {
                userWishlist = {}; // empty if not logged in
                createGrid(category);
            }
        });
});
}

function createGrid(category) {
    console.log('createGrid ', category)
    document.getElementById("products_container").innerHTML = '';
    currentIndex = 0; // reset whenever grid is recreated
    loadMoreProducts(category);
}

function loadMoreProducts(category) {
    let endIndex = currentIndex + productsPerPage;
    

    for (let i = currentIndex; i < endIndex && i < productsArray.length; i++) {
        
        if (category === 'all') {
            appendProduct(
                productsArray[i].value.mainImage,
                productsArray[i].key,
                productsArray[i].value.productName,
                productsArray[i].value.price,
                productsArray[i].value.size,
                productsArray[i].value.stock
            );
        } else if (category === productsArray[i].value.category) {
            appendProduct(
                productsArray[i].value.mainImage,
                productsArray[i].key,
                productsArray[i].value.productName,
                productsArray[i].value.price,
                productsArray[i].value.size,
                productsArray[i].value.stock
            );
        }
    }

    currentIndex = endIndex;

    // Show or hide the button depending on if there are more products
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (currentIndex >= productsArray.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

function appendProduct(mainImage, productID, productName, productPrice, productSize, productStock) {

    if (productStock < 1 ) {
        productPrice = 'OUT OF STOCK'
    } else {
        productPrice = '$' + productPrice;
    }

    const isInWishlist = userWishlist.hasOwnProperty(productID);
    const heartSrc = isInWishlist ? "/images/heart_filled.png" : "/images/heart.png";


    const product = 
           `<div class="productContainer">
            <div class="productImageContainer">
                <a href="/products/product.html?productID=${productID}">
                    <img class="productImage" src="${mainImage}">
                </a>
                <img class="addToWishlistButton" src="${heartSrc}" 
                     onclick="wishlistPressed('${productID}', '${productName}', '${mainImage}', this)">
            </div>
            <p class="productName">${productName}</p>
            <p class="productSize">size ${productSize}</p>
            <p class="productPrice">${productPrice}</p>
            <div class="big_gap"></div>
        </div>`;
            ;
    document.getElementById("products_container").innerHTML += product;

}


function wishlistPressed(productID, productName, mainImage, buttonEl) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const itemRef = firebase.database().ref(`/accounts/${user.uid}/wishlist/${productID}`);
            itemRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    // remove from wishlist
                    return itemRef.remove().then(() => {
                        buttonEl.src = "/images/heart.png";
                        delete userWishlist[productID]; // keep local state in sync
                    });
                } else {
                    // add to wishlist
                    return itemRef.set({
                        productName,
                        mainImage
                    }).then(() => {
                        buttonEl.src = "/images/heart_filled.png";
                        userWishlist[productID] = { productName, mainImage }; // sync local state
                    });
                }
            });
        } else {
            document.getElementById("wishlistPopup").classList.remove("hidden");
        }
    });
}

function goToPage(productID) {
    sessionStorage.setItem("productID", productID)
    window.location = "productPage.html"
}

function goToCategory(category) {
    var page = category + '.html'
    window.location = page;
}

function displayProductPage() {
    var productName = sessionStorage.getItem("productName");
    var productPrice = sessionStorage.getItem("productPrice");
    nameDiv = document.getElementById("nameP")
    nameDiv.innerHTML = productName;
    priceDiv = document.getElementById("priceP")
    priceDiv.innerHTML += productPrice;
}

function filterSettings(event, category) {
    console.log('filterSettings', category)
    event.preventDefault();
    document.getElementById("products_container").innerHTML = '';
    colourFilter = document.getElementById("colourDropdown").value;
    sizeFilter = document.getElementById("sizeDropdown").value;
    var oldProductsArray = [].concat(allProductsArray);
    productsArray = []

    console.log(colourFilter)

    oldProductsArray.forEach(function(child){
        if ((colourFilter === 'all' || 
            child.value.colour1 === colourFilter || 
            child.value.colour2 === colourFilter) && 
            (sizeFilter === 'all' || 
            child.value.size === sizeFilter)) {
                productsArray.push({
                    key: child.key,
                    value: child.value
                });
        } else {
            console.log('not filtered')
        }
    });

    console.log(sortBy);

    console.log("sortBy:", sortBy, "sortSettings:", sortSettings);

    if (sortBy === 'date') {
        if (sortSettings === 'newest') {
            sortNewest(category);
        } else {
            sortOldest(category);
        }
    } else if (sortBy === 'price') {
        if (sortSettings === 'lowPrice') {
            sortLowPrice(category);
        } else {
            sortHighPrice(category);
        }
    } else {
        createGrid(category);
    }
}

function handleSortSettings(event, category) {
    event.preventDefault();
    document.getElementById("products_container").innerHTML = '';
    sortSettings = document.getElementById("sortDropdown").value;

    if (sortSettings === 'newest' || sortSettings === 'oldest') {
        sortBy = 'date'
    } else if (sortSettings === 'lowPrice' || sortSettings === 'highPrice') {
        sortBy = 'price'
    }

     if (sortBy === 'date') {
        if (sortSettings === 'newest') {
            sortNewest(category);
        } else {
            sortOldest(category);
        }
    } else if (sortBy === 'price') {
        if (sortSettings === 'lowPrice') {
            sortLowPrice(category);
        } else {
            sortHighPrice(category);
        }
    }
}

function sortOldest(category) {
    productsArray.sort(function(a, b) {
        return new Date(a.value.date) - new Date(b.value.date);
    });
    console.log(productsArray);
    createGrid(category);
}

function sortNewest(category) {
    productsArray.sort(function(a, b) {
        return new Date(b.value.date) - new Date(a.value.date);
    });
    console.log(productsArray);
    createGrid(category);
}

function sortLowPrice(category) {
    productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    productsArray.reverse();
    createGrid(category);
}

function sortHighPrice(category) {
    console.log('sort price high to low')
    productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    createGrid(category);
}

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}
