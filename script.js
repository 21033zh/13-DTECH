function write() {
    console.log('write')
    firebase.database().ref('/').set({
    hello: 'hi'
    });
}