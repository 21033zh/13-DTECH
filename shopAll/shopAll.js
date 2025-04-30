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
                var row = `
            <tr> 
                <td>${productsArray[i].key}</td> 
                <td>${productsArray[i].value.name}</td> 
                <td>${productsArray[i].value.price}</td>
               <td><img src="${productsArray[i].value.mainImage}"></td>
                <td><button class="joinButton" onclick="goToPage(
                    '${productsArray[i].key}',
                    '${productsArray[i].value.name}',
                    '${productsArray[i].value.price}'
                    )">see more</button></td>
                </tr>`
            productTable.innerHTML += row;
        };
    }, fb_error);
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

function filterCategory(filter) {
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
            if (productsArray[i].value.category === filter) {
                var row = `
                <tr> 
                    <td>${productsArray[i].key}</td> 
                    <td>${productsArray[i].value.name}</td> 
                    <td>${productsArray[i].value.price}</td>
                    <td><img src="${productsArray[i].value.mainImage}"></td>
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

function filterSettings(event) {
    event.preventDefault();
    var colourFilter = document.getElementById("colourDropdown").value;
    var sizeFilter = document.getElementById("sizeDropdown").value;
    console.log('colour: ' + colourFilter);
    console.log('size: ' + sizeFilter);

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

        console.log("Current filters:", colourFilter, sizeFilter);
    
        for (i = 0; i < productsArray.length; i++) {
            console.log(productsArray[i].value.colour1);
            console.log(productsArray[i].value.size);
            if ((colourFilter === 'all' || 
                 productsArray[i].value.colour1 === colourFilter || 
                 productsArray[i].value.colour2 === colourFilter) && 
                (sizeFilter === 'all' || 
                 productsArray[i].value.size === sizeFilter)) {
                var row = `
                <tr> 
                    <td>${productsArray[i].key}</td> 
                    <td>${productsArray[i].value.name}</td> 
                    <td>${productsArray[i].value.price}</td>
                    <td><img src="${productsArray[i].value.mainImage}"></td>
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

function fb_error(error) {
    console.log("fb_error");
    console.log(error);
}

