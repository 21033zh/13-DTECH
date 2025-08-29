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
            <a href="/admin/product_manageProducts.html?productID=${productID}">
                <img class="productImage" src="${mainImage}">
            </a>
            </div>
            <button class="addToCartButton">Add to cart</button>
            <p class="productName"  onclick="goToPage(
                '${productID}')">${productName}</p>
            <p class="productSize" >size ${productSize}</p>
            <p class="productPrice">$${productPrice}</p>
            </div>`;
    document.getElementById("products_container").innerHTML += product;
}


function goToPage(productID) {
    sessionStorage.setItem("productID", productID)
    window.location = "product_manageProducts.html"
}

function displayProductPage() {
    var productName = sessionStorage.getItem("productName");
    var productPrice = sessionStorage.getItem("productPrice");
    nameDiv = document.getElementById("nameP")
    nameDiv.innerHTML = productName;
    priceDiv = document.getElementById("priceP")
    priceDiv.innerHTML += productPrice;
}