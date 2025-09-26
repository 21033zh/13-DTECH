// Get session_id from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get("session_id");

const linkEl = document.getElementById("receiptLink");

if (!sessionId) {
  linkEl.textContent = "No session ID found. Cannot load receipt.";
} else {
  // Fetch receipt URL from Cloud Function
  fetch(`https://us-central1-dollplanet-947ae.cloudfunctions.net/getReceipt?session_id=${sessionId}`)
    .then(res => res.json())
    .then(data => {
        console.log('data: ', data)
        console.log('data recipetURL: ', data.receiptUrl)
      if (data.receiptUrl) {
        linkEl.href = data.receiptUrl;
        linkEl.textContent = "View Receipt";
      } else {
        linkEl.textContent = "Receipt not available";
      }
    })
    .catch(err => {
      console.error("Error fetching receipt:", err);
      linkEl.textContent = "Failed to load receipt";
    });
}
