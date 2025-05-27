var colourFilter;
var sizeFilter;
var sortSettings;
var sortBy;
var productsArray = [];
var allProductsArray = []

function displayProducts() {
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
    for (i = 0; i < productsArray.length; i++) {
        console.log('name: ' + productsArray[i].value.name)
            const product = 
            `<div>
            <img src="${productsArray[i].value.mainImage}" class="productImage">
            <h6>${productsArray[i].value.productName}</h6>
            <p>$${productsArray[i].value.price}</p>
            <p>size ${productsArray[i].value.size}</p>
            <button class="wishlist" onclick=
            "addToWishlist('${productsArray[i].key}', '${productsArray[i].value.productName}', 
            '${productsArray[i].value.mainImage}')">add to wishlist</button>
            <button class="joinButton" onclick="goToPage(
                '${productsArray[i].key}',
                '${productsArray[i].value.productName},',
                '${productsArray[i].value.price}'
                )">see more</button></div>`;
        console.log(productsArray[i].value.productName)
    document.getElementById("products_container").innerHTML += product;
    };
}

function addToWishlist(productID, productName, productImage) {
    var uid = sessionStorage.getItem("uid");
    if (uid){
        console.log('uid: ' + uid);
        firebase.database().ref("/accounts/" + uid + "/wishlist/" + productID).update({
            productName: productName,
            productImage: productImage
        });
    } else {
        alert("make an account");
    }
}

function goToPage(productID, productName, productPrice, productImage) {
    sessionStorage.setItem("productID", productID)
    sessionStorage.setItem("productName", productName)
    sessionStorage.setItem("productPrice", productPrice)
    sessionStorage.setItem("productImage", productImage)
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
                const product = 
                `<div>
                <img src="${productsArray[i].value.mainImage}" class="productImage">
                <h6>${productsArray[i].value.productName}</h6>
                <p>$${productsArray[i].value.price}</p>
                <p>size ${productsArray[i].value.size}</p>
                <button class="joinButton" onclick="goToPage(
                    '${productsArray[i].key}',
                    '${productsArray[i].value.productName}',
                    '${productsArray[i].value.price}'
                    )">see more</button></div>`;
        document.getElementById("products_container").innerHTML += product;
            }
                
        };
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
