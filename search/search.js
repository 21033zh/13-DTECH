var search_productsArray = [];
var search_allProductsArray = [];

console.log('page load')

function web_searchSubmit(event) {
    event.preventDefault();
    var SEARCH_INPUT = document.getElementById("web_searchInput").value;
    sessionStorage.setItem("SEARCH_INPUT", SEARCH_INPUT)
    console.log(SEARCH_INPUT);
    window.location = "/search/search.html";
}

function mobile_searchSubmit(event) {
    event.preventDefault();
    var SEARCH_INPUT = document.getElementById("mobile_searchInput").value;
    sessionStorage.setItem("SEARCH_INPUT", SEARCH_INPUT)
    console.log(SEARCH_INPUT);
    window.location = "/search.html";
}

function search_displayProducts() {
    console.log('deafwsfkjw')
    var SEARCH_INPUT = sessionStorage.getItem("SEARCH_INPUT");
    const searchWords = SEARCH_INPUT.split(" ");
    console.log(SEARCH_INPUT);
    document.getElementById("div_searchedFor").innerHTML = `<h1>${SEARCH_INPUT}</h1>`;

    firebase.database().ref('/products/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var search_productInfo = childSnapshot.val();
            var searched = 0;

            for (let i = 0; i < searchWords.length; i++) {
                const word = searchWords[i].toLowerCase();
                if (
                    search_productInfo.productName.toLowerCase().includes(word) ||
                    search_productInfo.brand.toLowerCase().includes(word) ||
                    search_productInfo.colour1.toLowerCase().includes(word)
                ) {
                    searched += 2;
                } else if (search_productInfo.colour2.toLowerCase().includes(word)) {
                    searched += 1;
                }
            }

            if (searched > 0) {
                search_productsArray.push({
                    key: childSnapshot.key,
                    value: search_productInfo,
                    relevance: searched
                });
            }
        });

        // Sort by relevance (descending)
        search_productsArray.sort((a, b) => b.relevance - a.relevance);

        search_allProductsArray = [].concat(search_productsArray); // optional copy
        search_createGrid(search_productsArray);
    });
}

function search_createGrid(search_productsArray) {
    document.getElementById("search_products_container").innerHTML = '';
    for (let i = 0; i < search_productsArray.length; i++) {
        search_appendProduct(
            search_productsArray[i].value.mainImage,
            search_productsArray[i].key,
            search_productsArray[i].value.productName,
            search_productsArray[i].value.price,
            search_productsArray[i].value.size
        );
    }
}
    
function search_appendProduct( search_mainImage, search_productID,  search_productName, 
     search_productPrice,  search_productSize) {
    let search_allInfo = [
        search_mainImage,
        search_productID,
        search_productName,
        search_productPrice,
        search_productSize
    ]
    const search_product = 
            `<div class="productContainer">
            <div class="productImageContainer">
                <img class="productImage" src="${search_mainImage}"
                    onclick="goToPage(
                '${search_allInfo}', 
                )">
                <img class="addToWishlistButton" src="/images/heart.png" 
                    onclick="addToWishlist(
                    '${search_productID}',
                    '${search_productName}',
                    '${search_mainImage}')">
            </div>
            <p class="productName"  onclick="goToPage(
                '${search_allInfo}')">${search_productName}</p>
            <p class="productSize" >size ${search_productSize}</p>
            <p class="productPrice">$${search_productPrice}</p>
            </div>`;
    document.getElementById("search_products_container").innerHTML += search_product;
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
    
function search_filterCategory(filter) {
    document.getElementById("products_container").innerHTML = '';
        for (i = 0; i < search_productsArray.length; i++) {
            if (productsArray[i].value.category === filter) {
                search_appendProduct(
                    search_productsArray[i].value.mainImage,
                    search_productsArray[i].key,
                    search_productsArray[i].value.productName,
                    search_productsArray[i].value.price,
                    search_productsArray[i].value.size
                );    
        };
}
}
    
function search_filterSettings(event) {
    event.preventDefault();
    document.getElementById("search_products_container").innerHTML = '';
    search_colourFilter = document.getElementById("colourDropdown").value;
    search_sizeFilter = document.getElementById("sizeDropdown").value;
    var search_oldProductsArray = [].concat(allProductsArray);
    search_productsArray = []
    var search_sortSettings = document.getElementById("sortDropdown").value;

    var sortBy;

    if (search_sortSettings === 'newest' || search_sortSettings === 'oldest') {
        sortBy = 'date'
    } else if (search_sortSettings === 'relevence') {
        sortBy = 'relevence'
    }

    console.log("Current filters:", colourFilter, sizeFilter);
    console.log(oldProductsArray)

    search_oldProductsArray.forEach(function(child){
        if ((search_colourFilter === 'all' || 
            child.value.colour1 === search_colourFilter || 
            child.value.colour2 === search_colourFilter) && 
            (search_sizeFilter === 'all' || 
            child.value.size === sizeFilter)) {
                search_productsArray.push({
                    key: child.key,
                    value: child.value
                });
                console.log(productsArray)
        } else {
            console.log('not filtered')
        }
    });

    if (sortBy === 'price') {
        if (search_sortSettings === 'lowPrice') {
            search_sortLowPrice();
        } else {
            search_sortHighPrice();
        }
    } else if (search_sortBy === 'relvence') {
        search_displayProducts();
    } else {
        search_createGrid();
    }
}
    
function search_sortSettings(event) {
    event.preventDefault();
    document.getElementById("search_products_container").innerHTML = '';
    var sortSettings = document.getElementById("search_sortDropdown").value;
    var sortBy;

    if (sortSettings === 'newest' || sortSettings === 'oldest') {
        sortBy = 'date'
    } else if (sortSettings === 'lowPrice' || sortSettings === 'highPrice') {
        sortBy = 'price'
    }
        if (sortBy === 'date') {
        if (sortSettings === 'newest') {
            search_displayProducts();
            console.log('date new to old')
        } else {
            console.log('date old to new')
        }
    } else if (sortBy === 'price') {
        if (sortSettings === 'lowPrice') {
            search_sortLowPrice();
        } else {
            search_sortHighPrice();
        }
    }
}
    
function search_sortLowPrice() {
    console.log('sort price low to high')
        search_productsArray.sort(function(a, b) {
            return b.value.price - a.value.price;
        });
        search_productsArray.reverse();
        search_productsArray.forEach(function(child){
            console.log(child.key, child.value)
        }
        );
        search_createGrid();
}
    
function search_sortHighPrice() {
    console.log('sort price high to low')
    search_productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    search_productsArray.forEach(function(child){
        console.log(child.key, child.value)
    }
    );
    search_createGrid();
}

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}
