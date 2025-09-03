document.addEventListener("DOMContentLoaded", () => {
    displayFeaturedProducts('all');
});

function displayFeaturedProducts() {
    console.log('featured display')
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
            <img src="${productsArray[i].value.mainImage}" class="featured_image">
            <div class="info_card">
            <p>${productsArray[i].value.productName}</p>
            <p>size ${productsArray[i].value.size}</p>
            <p class="price">$${productsArray[i].value.price}</p>
            </div>
            </div>`;
        console.log(productsArray[i].value.productName)
        document.getElementById("featured_products_container").innerHTML += product;
    };
}
