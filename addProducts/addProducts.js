function createProduct(event) {
    event.preventDefault();
    var productName = document.getElementById("title").value;
    var productPrice = document.getElementById("price").value;
    console.log('title: ' + productName + ', price: ' + productPrice);

    let newProductRef = firebase.database().ref('products').push();
    newProductRef.set({
    name: productName,
    price: productPrice
    });
}