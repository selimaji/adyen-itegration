const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const axios = require("axios");
const {uuid} = require("uuidv4");
const {Client, Config, CheckoutAPI, hmacValidator} = require("@adyen/api-library");

// init app
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "build")));

dotenv.config({
  path: "./.env",
});

const config = new Config();
config.apiKey = process.env.ADYEN_API_KEY;
const client = new Client({config});
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);
const validator = new hmacValidator();

// in-memory store for transactions
const paymentStore = {};

const determineHostUrl = (req) => {
  let {
    "x-forwarded-proto": forwardedProto,
    "x-forwarded-host": forwardedHost,
  } = req.headers;

  if (forwardedProto && forwardedHost) {
    if (forwardedProto.includes(",")) {
      [forwardedProto,] = forwardedProto.split(",");
    }

    return `${forwardedProto}://${forwardedHost}`;
  }

  return "http://localhost:8080";
};

/* ################# API ENDPOINTS ###################### */
app.get("/api/getPaymentDataStore", async (req, res) => res.json(paymentStore));

// Submitting a payment
app.post("/api/sessions", async (req, res) => {

  console.log(8888,process.env.ADYEN_API_KEY)

  try {
    // unique ref for the transaction
    const orderRef = uuid();

    // Create the payload for Adyen API
    const payload = {
      countryCode: "NL",
      amount: {currency: "EUR", value: 10000},
      reference: orderRef,
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
      returnUrl: `${determineHostUrl(req)}/redirect?orderRef=${orderRef}`,
      lineItems: [
        {quantity: 1, amountIncludingTax: 5000, description: "Sunglasses"},
        {quantity: 1, amountIncludingTax: 5000, description: "Headphones"}
      ]
    };

    // Send the request to Adyen API using Axios
    const response = await axios.post('https://checkoutshopper-test.adyen.com/checkoutshopper/v1/sessions', payload, {
      headers: {
        'x-API-key': process.env.ADYEN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log(17,response);
    // Save transaction in memory
    paymentStore[orderRef] = {
      amount: {currency: "EUR", value: 1000},
      paymentRef: orderRef,
      status: "Pending"
    };


    res.json([response.data, orderRef]);
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.response?.data?.errorCode}`);
    res.status(err.response?.status || 500).json(err.response?.data || err.message);
  }
});

// Cancel or Refund a payment
app.post("/api/cancelOrRefundPayment", async (req, res) => {
  console.log("/api/cancelOrRefundPayment orderRef: " + req.query.orderRef);
  // Create the payload for canceling payment
  const payload = {
    merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
    reference: uuid(),
  };

  try {
    // Return the response back to the client
    const response = await checkout.reversals(paymentStore[req.query.orderRef].paymentRef, payload);
    paymentStore[req.query.orderRef].status = "Refund Initiated";
    paymentStore[req.query.orderRef].modificationRef = response.pspReference;
    res.json(response);
    console.info("Refund initiated for ", response);
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Receive webhook notifications
app.post("/api/webhooks/notifications", async (req, res) => {
  // get notificationItems from body
  const notificationRequestItems = req.body.notificationItems;

  // fetch first (and only) NotificationRequestItem
  const notificationRequestItem = notificationRequestItems[0].NotificationRequestItem;
  console.log(notificationRequestItem);

  if (!validator.validateHMAC(notificationRequestItem, process.env.ADYEN_HMAC_KEY)) {
    // invalid hmac: webhook cannot be accepted
    res.status(401).send('Invalid HMAC signature');
    return;
  }

  // valid hmac: process event
  if (notificationRequestItem.success === "true") {
    // Process the webhook based on the eventCode
    if (notificationRequestItem.eventCode === "AUTHORISATION") {
      const payment = paymentStore[notificationRequestItem.merchantReference];
      if (payment) {
        payment.status = "Authorised";
        payment.paymentRef = notificationRequestItem.pspReference;
      }
    } else if (notificationRequestItem.eventCode === "CANCEL_OR_REFUND") {
      const payment = findPayment(notificationRequestItem.pspReference);
      if (payment) {
        console.log("Payment found: ", JSON.stringify(payment));
        // update with additionalData.modification.action
        if (
          "modification.action" in notificationRequestItem.additionalData &&
          "refund" === notificationRequestItem.additionalData["modification.action"]
        ) {
          payment.status = "Refunded";
        } else {
          payment.status = "Cancelled";
        }
      }
    } else {
      console.info("skipping non-actionable webhook");
    }
  }

  // acknowledge event has been consumed
  res.status(202).send();
});

/* ################# end API ENDPOINTS ###################### */

/* ################# CLIENT ENDPOINTS ###################### */

// Handles any requests that don't match the above
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

/* ################# end CLIENT ENDPOINTS ###################### */

/* ################# UTILS ###################### */

function findPayment(pspReference) {
  const payments = Object.values(paymentStore).filter((v) => v.modificationRef === pspReference);
  if (payments.length <= 0) {
    console.error("No payment found with that PSP reference");
  }
  return payments[0];
}

/* ################# end UTILS ###################### */

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
