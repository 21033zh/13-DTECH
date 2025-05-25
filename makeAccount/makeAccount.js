function createAccount(event) {
    event.preventDefault();
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var mailingList = document.getElementById("mailingList").checked;
    console.log('name: ' + name + ', email: ' + email);

    let newAccountRef = firebase.database().ref('accounts').push();
    let accountID = newAccountRef.key;
    newAccountRef.set({
    name: name,
    email: email,
    password: password
    });

    sessionStorage.setItem("uid", accountID);

    if (mailingList === true) {
        console.log('join mailing list')
    }
}

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
        console.log('name: ' + productsArray[i].value.productID)
    };
}