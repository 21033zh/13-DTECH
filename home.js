function displayFeaturedProducts() {
    firebase.database().ref('/products/').once('value', function(snapshot) {
        var productsArray = [];
        snapshot.forEach(function(childSnapshot) {
            productsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        createRow(productsArray);
});
}

function createRow(productsArray) {
    for (i = 0; i < 10; i++) {
            const product = 
            `<div class="featured_product">
            <img src="${productsArray[i].value.mainImage}" class="productImage">
            <h6>${productsArray[i].value.productName}</h6>
            <p>$${productsArray[i].value.price}</p>
            <p>size ${productsArray[i].value.size}</p>
            <button class="wishlist" onclick=
            "addToWishlist('${productsArray[i].key}', '${productsArray[i].value.productName}', 
            '${productsArray[i].value.productPrice}', 
            '${productsArray[i].value.mainImage}')">add to wishlist</button>
            <button class="joinButton" onclick="goToPage(
                '${productsArray[i].key}', '${productsArray[i].value.productName}', 
                '${productsArray[i].value.productPrice}', 
                '${productsArray[i].value.mainImage}'
                )">see more</button></div>`;
        console.log(productsArray[i].value.productName)
        document.getElementById("featured_products_container").innerHTML += product;
    };
}
