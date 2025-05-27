function displayWishlist() {
    var uid = sessionStorage.getItem("uid");
    console.log('uid: ' + uid);
    firebase.database().ref('/accounts/' + uid + '/wishlist/').once('value', function(snapshot) {
        var productsArray = [];
        snapshot.forEach(function(childSnapshot) {
            productsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
        createGrid(productsArray);
});
}

function createGrid(productsArray) {
    console.log(productsArray)
    for (i = 0; i < productsArray.length; i++) {
        console.log('name: ' + productsArray[i].value.productName)
        const product = 
            `<div>
            <img src="${productsArray[i].value.productImage}" class="wishlistImage">
            <h6>${productsArray[i].value.productName}</h6>
            </div>`
        document.getElementById("wishlist_products_container").innerHTML += product;
    };
}