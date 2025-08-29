const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Initialize Firebase Admin
admin.initializeApp();

// Use Stripe secret key directly (or via functions.config())
const stripe = Stripe("sk_test_51RORXOHYjsredqEcrTyx13IHxHH6gqas7n5uhgCZbuTosefw3o3fA11VPABhUivlT3ZbGBLoK9dbb0dmHOowbZWl0046xPUlkk");

// ----------------------
// Create Checkout Session for a single product or cart
// ----------------------
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    const { productId, items } = req.body;

    let line_items;

    if (productId) {
      // Single product
      const snapshot = await admin.database().ref(`products/${productId}`).once("value");
      const product = snapshot.val();
      if (!product) return res.status(404).send({ error: "Product not found" });

      line_items = [{
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      }];
    } else if (items && Array.isArray(items)) {
      // Multiple items in cart
      line_items = items.map(item => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.name },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity || 1,
      }));
    } else {
      return res.status(400).send({ error: "No products provided" });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: "http://127.0.0.1:5500/success.html",
      cancel_url: "http://127.0.0.1:5500/cancel.html",
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err.message });
  }
});

exports.createPaymentLink = functions.https.onRequest(async (req, res) => {
    // Set CORS headers on all responses
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  
    if (req.method === "OPTIONS") {
      // Preflight request. Respond with 204 (No Content)
      return res.status(204).send("");
    }
  
    try {
      // Parse JSON safely
      const { items } = JSON.parse(req.rawBody || req.body);
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).send({ error: "Invalid or empty items array" });
      }
  
      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map(item => ({
          price_data: {
            currency: "usd",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100), // price in cents
          },
          quantity: item.quantity || 1,
        })),
        mode: "payment",
        success_url: "http://127.0.0.1:5500/success.html",
        cancel_url: "http://127.0.0.1:5500/cancel.html",
      });
  
      // Return URL
      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
  