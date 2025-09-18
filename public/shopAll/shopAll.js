var colourFilter;
var sizeFilter;
var sortBy = 'date';       // or 'price'
var sortSettings = 'newest'; // or 'lowPrice', 'highPrice', etc.
var productsArray = [];
var allProductsArray = []

let productsPerPage = 12;
let currentIndex = 0;

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
        createGrid(category);
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
    let allInfo = [
        mainImage,
        productID,
        productName,
        productPrice,
        productSize,
        productStock
    ]

    if (productStock < 1 ) {
        productPrice = 'OUT OF STOCK'
    } else {
        productPrice = '$' + productPrice;
    }

    const product = 
            `<div class="productContainer">
            <div class="productImageContainer">
            <a href="/products/product.html?productID=${productID}">
                <img class="productImage" src="${mainImage}">
            </a>
                <img class="addToWishlistButton" src="/images/heart.png" onclick="wishlistPressed(
                '${productID}', '${productName}', '${mainImage}')">
            </div>
            <p class="productName" href="/products/product.html?productID=${productID}">
            ${productName}</p>
            <p class="productSize" >size ${productSize}</p>
            <p class="productPrice">${productPrice}</p>
            <div class="big_gap"></div>
            </div>`
            ;
    document.getElementById("products_container").innerHTML += product;

}


function wishlistPressed(productID, productName, mainImage) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is signed in:", user);
            firebase.database().ref("/accounts/" + user.uid + "/wishlist/" + productID ).update({
                productName,
                mainImage
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
