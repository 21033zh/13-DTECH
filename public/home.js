
function displayFeaturedProducts() {
    console.log('featured display')
    firebase.database().ref('/').once('value', function(snapshot) {
        console.log(snapshot.val())
    });

    firebase.database().ref('/products/').once('value', function(snapshot) {
        var productsArray = [];
        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.val().stock > 0) {
                productsArray.push({
                    key: childSnapshot.key,
                    value: childSnapshot.val()
                });
            }
        });

        productsArray.sort(function(a, b) {
            return new Date(b.value.date) - new Date(a.value.date);
        });

        
        createRow(productsArray);
});
}

function createRow(productsArray) {
    for (i = 0; i < 10; i++) {
            const product = 
            `<div class="featured_product">
            <a href="/products/product.html?productID=${productsArray[i].key}">
            <img src="${productsArray[i].value.mainImage}" class="featured_image">
            <div class="info_card">
            <p>${productsArray[i].value.productName}</p>
            <p>size ${productsArray[i].value.size}</p>
            <p class="price">$${productsArray[i].value.price}</p>
            </div>
            </a>
            </div>`;
        console.log(productsArray[i].value.productName)
        document.getElementById("featured_products_container").innerHTML += product;
    };
}
