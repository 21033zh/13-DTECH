function createAccount(event) {
    event.preventDefault();
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var mailingList = document.getElementById("mailingList").checked;
    console.log('name: ' + name + ', email: ' + email);

    let newAccountRef = firebase.database().ref('accounts').push();
    newAccountRef.set({
    name: name,
    email: email,
    password: password
    });

    if (mailingList === true) {
        console.log('join mailing list')
    }
}