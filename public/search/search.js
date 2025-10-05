var search_productsArray = [];
var search_allProductsArray = [];
var search_colourFilter;
var search_sizeFilter;
var search_sortBy = 'relevance';       // or 'price'
var search_sortSettings = 'relevance'; // or 'lowPrice', 'highPrice', etc.

let search_productsPerPage = 12;
let search_currentIndex = 0;
let search_userWishlist = {}; 

console.log('page load')

function web_searchSubmit(event) {
    event.preventDefault();
    var SEARCH_INPUT = document.getElementById("web_searchInput").value;
    console.log(SEARCH_INPUT);
    window.location = `/search/search.html?searchResults=${SEARCH_INPUT}`;
}

function mobile_searchSubmit(event) {
    event.preventDefault();
    var SEARCH_INPUT = document.getElementById("mobile_searchInput").value;
    console.log(SEARCH_INPUT);
    window.location = `/search/search.html?searchResults=${SEARCH_INPUT}`;
}

function search_displayProducts() {
    console.log('search_displayProducts')
    const urlParams = new URLSearchParams(window.location.search);
    const SEARCH_INPUT = urlParams.get('searchResults');
    const searchWords = SEARCH_INPUT.split(" ");

    console.log(SEARCH_INPUT);
    document.getElementById("div_searchedFor").innerHTML = `<h1>${SEARCH_INPUT}</h1>`;

    firebase.database().ref('/products/').once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var search_productInfo = childSnapshot.val();
            var searched = 0;
            const productName = search_productInfo.productName || "";
            const brand = search_productInfo.brand || "";
            const colour1 = search_productInfo.colour1 || "";
            const colour2 = search_productInfo.colour2 || "";
            const description = search_productInfo.description || ""
            console.log(description)

            for (let i = 0; i < searchWords.length; i++) {
                const word = searchWords[i].toLowerCase();
                if (
                    productName.toLowerCase().includes(word) ||
                    brand.toLowerCase().includes(word) ||
                    colour1.toLowerCase().includes(word)
                ) {
                    searched += 3;
                } else if (colour2.toLowerCase().includes(word)) {
                    searched += 2;
                } else if (description.toLowerCase().includes(word)) {
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

            search_allProductsArray = [].concat(search_productsArray); 

        });
        // Sort by relevance (descending)
        search_sortByRelevance()
        
    });
}

function search_sortByRelevance() {
    console.log('search_sortByRelevance')
    search_productsArray.sort((a, b) => b.relevance - a.relevance);
        
        // check if user is logged in, then get their wishlist
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                firebase.database().ref(`/accounts/${user.uid}/wishlist`).once('value').then(snap => {
                    search_userWishlist = snap.val() || {}; // save wishlist
                    search_createGrid(search_productsArray);
                });
            } else {
                search_userWishlist = {}; // empty if not logged in
                search_createGrid(search_productsArray);
            }
        });
}

function search_createGrid() {
    console.log('search_createGrid');
    console.log(search_productsArray)
    if (search_productsArray.length > 0 ) {
        document.getElementById("search_products_container").innerHTML = '';
        search_currentIndex = 0; // reset whenever grid is recreated
        search_loadMoreProducts(search_productsArray);
    } else {
        document.getElementById("search_products_container").innerHTML = '<p id="p_noResults">NO RESULTS</p>';
    }   
}

function search_loadMoreProducts() {
    let search_endIndex = search_currentIndex + search_productsPerPage;
    for (let i = search_currentIndex; i < search_endIndex && i < search_productsArray.length; i++) {
        search_appendProduct(
            search_productsArray[i].value.mainImage,
            search_productsArray[i].key,
            search_productsArray[i].value.productName,
            search_productsArray[i].value.price,
            search_productsArray[i].value.size,
            search_productsArray[i].value.stock
        );
    }
}
    
function search_appendProduct(search_mainImage, search_productID,  search_productName, 
     search_productPrice,  search_productSize, search_productStock) {
    if (search_productStock < 1 ) {
        search_productPrice = 'OUT OF STOCK'
    } else {
        search_productPrice = '$' + search_productPrice;
    }

    const search_isInWishlist = search_userWishlist.hasOwnProperty(search_productID);
    const search_heartSrc = search_isInWishlist ? "/images/heart_filled.png" : "/images/heart.png";

    const search_product = 
           `<div class="productContainer">
            <div class="productImageContainer">
                <a aria-label="link to ${search_productName}" href="/products/product.html?productID=${search_productID}">
                    <img alt="${search_productName}" class="productImage" src="${search_mainImage}">
                </a>
                <img class="addToWishlistButton" src="${search_heartSrc}" alt="wishlist button"
                     onclick="search_wishlistPressed('${search_productID}', '${search_productName}', '${search_mainImage}', this)">
            </div>
            <p class="productName">${search_productName}</p>
            <p class="productSize">size ${search_productSize}</p>
            <p class="productPrice">${search_productPrice}</p>
            <div class="big_gap"></div>
        </div>`;
            ;
    document.getElementById("search_products_container").innerHTML += search_product;
}

function search_wishlistPressed(search_productID, search_productName, search_mainImage, search_buttonEl) {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            const search_itemRef = firebase.database().ref(`/accounts/${user.uid}/wishlist/${search_productID}`);
            search_itemRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    // remove from wishlist
                    return search_itemRef.remove().then(() => {
                        search_buttonEl.src = "/images/heart.png";
                        delete search_userWishlist[search_productID]; // keep local state in sync
                    });
                } else {
                    // add to wishlist
                    return search_itemRef.set({
                        search_productName,
                        search_mainImage
                    }).then(() => {
                        search_buttonEl.src = "/images/heart_filled.png";
                        search_userWishlist[search_productID] = { search_productName, search_mainImage }; // sync local state
                    });
                }
            });
        } else {
            document.getElementById("wishlistPopup").classList.remove("hidden");
        }
    });
}

function search_filterSettings(event) {
    event.preventDefault();
    document.getElementById("search_products_container").innerHTML = '';
    search_colourFilter = document.getElementById("search_colourDropdown").value;
    search_sizeFilter = document.getElementById("search_sizeDropdown").value;
    var search_oldProductsArray = [].concat(search_allProductsArray);
    search_productsArray = []

    search_oldProductsArray.forEach(function(child){
        if ((search_colourFilter === 'all' || 
            child.value.colour1 === search_colourFilter || 
            child.value.colour2 === search_colourFilter) && 
            (search_sizeFilter === 'all' || 
            child.value.size === search_sizeFilter)) {
                search_productsArray.push({
                    key: child.key,
                    value: child.value,
                    relevance: child.relevance 
                });
        } else {
            console.log('search_ not filtered')
        }
    });

    console.log(search_sortBy);

    console.log("sortBy:", search_sortBy, "sortSettings:", search_sortSettings);

    if (search_sortBy === 'date') {
        if (search_sortSettings === 'newest') {
            search_sortNewest();
        } else {
            search_sortOldest();
        }
    } else if (search_sortBy === 'price') {
        if (search_sortSettings === 'lowPrice') {
            search_sortLowPrice();
        } else {
            search_sortHighPrice();
        }
    } else {
        search_sortByRelevance();
        console.log('filtered and sorting by relevance')
    }
}

function search_handleSortSettings(event) {
    event.preventDefault();
    document.getElementById("search_products_container").innerHTML = '';
    search_sortSettings = document.getElementById("search_sortDropdown").value;

    if (search_sortSettings === 'newest' || search_sortSettings === 'oldest') {
        search_sortBy = 'date'
    } else if (search_sortSettings === 'lowPrice' || search_sortSettings === 'highPrice') {
        search_sortBy = 'price'
    } else {
        search_sortBy = 'relevance';
    }

    console.log('sort by', search_sortBy)

     if (search_sortBy === 'date') {
        if (search_sortSettings === 'newest') {
            console.log('newest')
            search_sortNewest();
        } else {
            console.log('oldest');
            search_sortOldest();
        }
    } else if (search_sortBy === 'price') {
        if (search_sortSettings === 'lowPrice') {
            search_sortLowPrice();
        } else {
            search_sortHighPrice();
        }
    } else {
        console.log('handle sort settings relevance')
        search_sortByRelevance()
    }
}

function search_sortOldest() {
    console.log('sorting by oldest')
    search_productsArray.sort((a, b) => 
        a.value.date - b.value.date
    ); 
    search_createGrid();
}

function search_sortNewest() {
    console.log('sorting by newest')
    search_productsArray.sort((a, b) => 
        b.value.date - a.value.date
    ); 
    search_createGrid();
}

function search_sortLowPrice() {
    search_productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    search_productsArray.reverse();
    search_createGrid();
}

function search_sortHighPrice() {
    console.log('sort price high to low')
    search_productsArray.sort(function(a, b) {
        return b.value.price - a.value.price;
    });
    search_createGrid();
}



function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}