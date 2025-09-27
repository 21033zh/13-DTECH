
(async function() {
    // Get session_id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");

    const linkEl = document.getElementById("receiptLink");

    if (!sessionId) {
        linkEl.textContent = "No session ID found. Cannot load receipt.";
        return;
    }

    try {
        // Fetch receipt URL from Cloud Function
        const receiptResponse = await fetch(`https://us-central1-dollplanet-947ae.cloudfunctions.net/getReceipt?session_id=${sessionId}`);
        const data = await receiptResponse.json();

        console.log('data: ', data);
        console.log('data receiptURL: ', data.receiptUrl);

        if (data.receiptUrl) {
            linkEl.href = data.receiptUrl;
            linkEl.textContent = "View Receipt";
        } else {
            linkEl.textContent = "Receipt not available";
        }

        // ✅ Now also check if this was a guest checkout
        if (data.session && data.session.metadata) {
            const userId = data.session.metadata.userId;
            console.log("Checkout userId:", userId);

            if (!userId || userId === "guest") {
                console.log("Guest checkout detected — clearing local cart.");
                localStorage.removeItem("cart");
            }
        }

    } catch (err) {
        console.error("Error fetching receipt:", err);
        linkEl.textContent = "Failed to load receipt";
    }
})();