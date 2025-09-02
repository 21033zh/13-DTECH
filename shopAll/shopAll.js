var colourFilter;
var sizeFilter;
var sortSettings;
var sortBy;
var productsArray = [];
var allProductsArray = []

let productsPerPage = 12;
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("products_container").addEventListener("click", (event) => {
      if (event.target.classList.contains("shopPage_button_addToCart")) {
        const productID = event.target.dataset.productId;
        addToCart(productID);
      }
    });
  });

function displayProducts() {
    productsArray = [];
    firebase.database().ref('/products/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            productsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        allProductsArray = [].concat(productsArray);
        createGrid();
});
}

function createGrid() {
    document.getElementById("products_container").innerHTML = '';
    currentIndex = 0; // reset whenever grid is recreated
    loadMoreProducts();
}

function loadMoreProducts() {
    let endIndex = currentIndex + productsPerPage;

    for (let i = currentIndex; i < endIndex && i < productsArray.length; i++) {
        appendProduct(
            productsArray[i].value.mainImage,
            productsArray[i].key,
            productsArray[i].value.productName,
            productsArray[i].value.price,
            productsArray[i].value.size
        );
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

function appendProduct(mainImage, productID, productName, productPrice, productSize) {
    let allInfo = [
        mainImage,
        productID,
        productName,
        productPrice,
        productSize
    ]
    const product = 
            `<div class="productContainer">
            <div class="productImageContainer">
            <a href="/products/product.html?productID=${productID}">
                <img class="productImage" src="${mainImage}">
            </a>
                <img class="addToWishlistButton" src="/images/heart.png" 
                    onclick="addToWishlist(
                    '${productID}',
                    '${productName}',
                    '${mainImage}')">
            </div>
            <p class="productName"  onclick="goToPage(
                '${productID}')">${productName}</p>
            <p class="productSize" >size ${productSize}</p>
            <p class="productPrice">$${productPrice}</p>
            <div class="big_gap"></div>
            </div>`
            ;
    document.getElementById("products_container").innerHTML += product;

}

function addToWishlist(productID, productName, mainImage) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is signed in:", user);
            firebase.database().ref("/accounts/" + user.uid + "/wishlist/" + productID ).update({
                productName,
                mainImage
            });
        } else {
            // User is signed out.
            alert("make an account");
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

function filterCategory(filter) {
    document.getElementById("products_container").innerHTML = '';
        for (i = 0; i < productsArray.length; i++) {
            if (productsArray[i].value.category === filter) {
                appendProduct(
                    productsArray[i].value.mainImage,
                    productsArray[i].key,
                    productsArray[i].value.productName,
                    productsArray[i].value.price,
                    productsArray[i].value.size
                );    
        };
}
}

function filterSettings(event) {
    event.preventDefault();
    document.getElementById("products_container").innerHTML = '';
    colourFilter = document.getElementById("colourDropdown").value;
    sizeFilter = document.getElementById("sizeDropdown").value;
    var oldProductsArray = [].concat(allProductsArray);
    productsArray = []

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

    if (sortBy === 'date') {
        if (sortSettings === 'newest') {
            sortHighest();
        } else {
            sortOldest()
        }
    } else if (sortBy === 'price') {
        if (sortSettings === 'lowPrice') {
            sortLowPrice();
        } else {
            sortHighPrice();
        }
    } else {
        createGrid();
    }
}

function handleSortSettings(event) {
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
            sortNewest();
        } else {
            sortOldest();
        }
    } else if (sortBy === 'price') {
        if (sortSettings === 'lowPrice') {
            sortLowPrice();
        } else {
            sortHighPrice();
        }
    }
}

function sortOldest() {
    productsArray.sort((a, b) => 
        a.value.date - b.value.date
    ); 
}

function sortNewest() {
    productsArray.sort((a, b) => 
        b.value.date - a.value.date
    ); 
}

function sortLowPrice() {
    productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    productsArray.reverse();
    createGrid();
}

function sortHighPrice() {
    console.log('sort price high to low')
    productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    createGrid();
}

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}
