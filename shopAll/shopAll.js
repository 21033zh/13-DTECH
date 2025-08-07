var colourFilter;
var sizeFilter;
var sortSettings;
var sortBy;
var productsArray = [];
var allProductsArray = []

function displayProducts() {
    productsArray = [];
    firebase.database().ref('/products/').once('value', function(snapshot) {
        console.log(productsArray);
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
    console.log(productsArray)
    document.getElementById("products_container").innerHTML = '';
    for (i = 0; i < productsArray.length; i++) {
        appendProduct(
            productsArray[i].value.mainImage,
            productsArray[i].key,
            productsArray[i].value.productName,
            productsArray[i].value.price,
            productsArray[i].value.size
        );
    };
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
            <a href="productPage.html?productID=${productID}">
                <img class="productImage" src="${mainImage}">
            </a>
                <img class="addToWishlistButton" src="/images/heart.png" 
                    onclick="addToWishlist(
                    '${productID}',
                    '${productName}',
                    '${mainImage}')">
            </div>
            <button class="addToCartButton">Add to cart</button>
            <p class="productName"  onclick="goToPage(
                '${productID}')">${productName}</p>
            <p class="productSize" >size ${productSize}</p>
            <p class="productPrice">$${productPrice}</p>
            </div>`;
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
    console.log('colour: ' + colourFilter);
    console.log('size: ' + sizeFilter);
    var oldProductsArray = [].concat(allProductsArray);
    productsArray = []

    console.log("Current filters:", colourFilter, sizeFilter);
    console.log(oldProductsArray)

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
                console.log(productsArray)
        } else {
            console.log('not filtered')
        }
    });

    if (sortBy === 'date') {
        if (sortSettings === 'newest') {
            displayProducts();
            console.log('date new to old')
        } else {
            console.log('date old to new')
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

function sortSettings(event) {
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
            displayProducts();
            console.log('date new to old')
        } else {
            console.log('date old to new')
        }
    } else if (sortBy === 'price') {
        if (sortSettings === 'lowPrice') {
            sortLowPrice();
        } else {
            sortHighPrice();
        }
    }
}

function sortLowPrice() {
    console.log('sort price low to high')
        productsArray.sort(function(a, b) {
            return b.value.price - a.value.price;
        });
        productsArray.reverse();
        productsArray.forEach(function(child){
            console.log(child.key, child.value)
        }
        );
    createGrid();
}

function sortHighPrice() {
    console.log('sort price high to low')
    productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    productsArray.forEach(function(child){
        console.log(child.key, child.value)
    }
    );
    createGrid();
}

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}
