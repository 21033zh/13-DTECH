function displayProducts() {
    firebase.database().ref('/products/').once('value', function(snapshot) {
        var productsArray = [];
        console.log(productsArray);
        snapshot.forEach(function(childSnapshot) {
            productsArray.push({
                key: childSnapshot.key,
                value: childSnapshot.val()
            });
        });
    
        var productTable = document.getElementById('productTable');
        productTable.innerHTML = '';
    
        for (i = 0; i < productsArray.length; i++) {
            if (productsArray[i].value.join == 'y') {
                console.log(productsArray[i].value.p1Name + 's lobby is full')
            } else {
                var row = `
            <tr> 
                <td>${productsArray[i].key}</td> 
                <td>${productsArray[i].value.name}</td> 
                <td>${productsArray[i].value.price}
                <td><button class="joinButton" onclick="goToPage(
                    '${productsArray[i].key}',
                    '${productsArray[i].value.name}',
                    '${productsArray[i].value.price}'
                    )">see more</button></td>
                </tr>`
            productTable.innerHTML += row;
            }
        };
    }, fb_error);
}

function goToPage(productID, productName, productPrice) {
    sessionStorage.setItem("productID", productID)
    sessionStorage.setItem("productName", productName)
    sessionStorage.setItem("productPrice", productPrice)
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

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}