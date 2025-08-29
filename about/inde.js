const functions = require("firebase-functions"); 
const admin = require("firebase-admin"); 
const Stripe = require("stripe")(functions.config().stripe.secret); 
admin.initializeApp(); 

exports.createCheckoutSession = functions.https.onCall(async (data, context) => { 
    const { productId } = data;

    // Get product info from Realtime Database
    const snapshot = await admin.database().ref(`products/${productId}`).once("value"); 
    const product = snapshot.val();
    if (!product) throw new functions.https.HttpsError("not-found", "Product not found"); 

    // Create Stripe Checkout session with dynamic price
    const session = await stripe.checkout.sessions.create({ 
        payment_method_types: ["card"],
        line_items: [ 
            { 
                price_data: { 
                    currency: "usd", 
                    product_data: { name: product.name }, 
                    unit_amount: product.price * 100, // price in cents 
                }, 
                quantity: 1, 
            }, 
        ], 
        mode: "payment", 
        success_url: "https://yourwebsite.com/success.html", 
        cancel_url: "https://yourwebsite.com/cancel.html", 
    }); 

    return { sessionId: session.id }; 
});


exports.createPaymentLink = functions.https.onRequest(async (req, res) => { 
    res.set("Access-Control-Allow-Origin", "*"); // allow all domains 
    res.set("Access-Control-Allow-Methods", "GET, POST"); 
    res.set("Access-Control-Allow-Headers", "Content-Type"); 
    if (req.method === "OPTIONS") { 
        // Handle CORS preflight 
        res.status(204).send(''); return; 
    } try { 
        const session = await stripe.checkout.sessions.create({ 
            mode: "payment", 
            line_items: req.body.items, 
            success_url: "http://127.0.0.1:5500/success.html", 
            cancel_url: "http://127.0.0.1:5500/cancel.html", 
        }); 
        res.json({ 
            url: session.url 
        }); 
    } catch (error) { 
        console.error(error); 
        res.status(500).send({ 
            error: error.message 
        }); 
    } 
});