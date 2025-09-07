const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Stripe = require("stripe");

// Initialize Firebase Admin
admin.initializeApp();

// Use Stripe secret key directly (or via functions.config())
const stripe = Stripe("sk_test_51RORXOHYjsredqEcrTyx13IHxHH6gqas7n5uhgCZbuTosefw3o3fA11VPABhUivlT3ZbGBLoK9dbb0dmHOowbZWl0046xPUlkk");

// Needed for Stripe webhook signature check
functions.https.onRequest((req, res) => {
  req.rawBody = req.rawBody || '';
  res.end();
});

// ----------------------
// Create Checkout Session for a single product or cart
// ----------------------
exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.status(204).send("");

    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "No items provided" });
        }

        const line_items = items.map(item => ({
            price_data: {
                currency: "nzd",           // adjust currency
                product_data: { name: item.name },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity || 1,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items,
            mode: "payment",
            success_url: "http://127.0.0.1:5500/purchase/success.html",
            cancel_url: "http://127.0.0.1:5500/purchase/cart.html", 
            metadata: { userId: req.body.userId }, // 👈 attach here

            shipping_address_collection: {
                allowed_countries: ["NZ"], // adjust to the countries you ship to
            },
            
              // Shipping options
            shipping_options: [
            {
                shipping_rate_data: {
                display_name: "Standard Shipping",
                type: "fixed_amount",
                fixed_amount: { amount: 700, currency: "nzd" }, // $7.00
                delivery_estimate: {
                    minimum: { unit: "business_day", value: 5 },
                    maximum: { unit: "business_day", value: 7 },
                },
                },
            },
            ]
        });

        res.json({ url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
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
            currency: "nzd",
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100), // price in cents
          },
          quantity: item.quantity || 1,
        })),
        mode: "payment",
        success_url: "http://127.0.0.1:5500/purchase/success.html",
        cancel_url: "http://127.0.0.1:5500/purchase/cart.html",
        metadata: { userId: req.body.userId } // 👈 attach here
      });
  
      // Return URL
      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  });
  

  // ----------------------
// Handle Stripe Webhooks
// ----------------------
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];

    if (!req.rawBody) {
      console.error("⚠️ req.rawBody is empty! Stripe signature will fail.");
      return res.status(400).send("Raw body required");
    }

    event = stripe.webhooks.constructEvent(req.rawBody, sig, "whsec_GIMvXSPEenLJSmA8FE67G1rvAogcuABK");
    console.log("✅ Stripe signature verified");
    console.log("Event type:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object

      // LOG session to debug
      console.log("Session object:", session);
      console.log("User ID from metadata:", session.metadata?.userId);

      // Fetch line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      console.log("Line items:", lineItems.data);

      // Prepare order data
      const orderData = {
        userId: session.metadata?.userId || "guest",
        amount_total: session.amount_total,
        currency: session.currency,
        status: "paid",
        createdAt: new Date().toISOString(),
        shipping: session.shipping_details || null,
        line_items: lineItems.data,
      };

      // Then write to your main paths
      await admin.database().ref(`/orders/${session.id}`).set(orderData);
      if (orderData.userId !== "guest") {
        await admin.database().ref(`/accounts/${orderData.userId}/orders/${session.id}`).set(orderData);
      }

      console.log(`✅ Order ${session.id} stored in Firebase.`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
