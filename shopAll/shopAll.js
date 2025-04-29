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
                <td><button class="joinButton" onclick="html_p2Details(
                    '${productsArray[i].key}'
                    )">see more</button></td>
                </tr>`
            productTable.innerHTML += row;
            }
        };
    }, fb_error);
}

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}