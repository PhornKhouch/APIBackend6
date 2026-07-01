const stripe = require('stripe');
const axios = require('axios');
require('dotenv').config();
const { BakongKHQR, khqrData, IndividualInfo } = require("bakong-khqr");

const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);
const appUrl = process.env.APP_URL || 'http://localhost:3000';

const createCheckoutSession = async (request, response) => {
  try {
    var Data = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Visa PayWay Demo Payment',
              description: 'Test card payment processed securely by Stripe'
            },
            unit_amount: 2000, // Amount in cents (e.g., $10.00)
          },
          quantity: 1
        }
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancel`,
    }

    const session = await stripeInstance.checkout.sessions.create(Data);

    response.json({
      message: 'Checkout session created successfully!',
      url: session.url
    });

  } catch (error) {
    console.error(error);
    response.status(500).json({
      error: 'Unable to create checkout session. Check your Stripe keys and server logs.'
    });
  }
}

const getSessionDetails = async (sessionId) => {
  const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent.payment_method']
  });

  return {
    id: session.id,
    amount_total: session.amount_total,
    currency: session.currency,
    payment_status: session.payment_status,
    customer_email: session.customer_details?.email || null,
    card_brand: session.payment_intent?.payment_method?.card?.brand || null,
    last4: session.payment_intent?.payment_method?.card?.last4 || null
  };
}

// Stripe redirects here after payment. Confirms the real status with
// Stripe and responds with the session data.
const PaymentSuccess = async (request, response) => {
  const sessionId = request.query.session_id;
  if (!sessionId) {
    return response.status(400).json({ error: 'Missing session_id.' });
  }
  try {
    const data = await getSessionDetails(sessionId);
    response.json(data);
  } catch (error) {
    console.error(error);
    response.status(404).json({ error: 'Checkout session not found.' });
  }
}



//section KHQR payway
const generateKHQR = async (req, res) => {
    try {
        const { amount, currency, billNumber } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required and must be greater than 0',
            });
        }

        // ─── Configure your Bakong account info here ───
        // TODO: Replace with your real Bakong account ID (e.g., "yourname@wing", "yourname@abaa")
        const BAKONG_ACCOUNT_ID = process.env.BAKONG_ACCOUNT_ID || "khouch_phorn@bkrt";
        const MERCHANT_NAME = process.env.MERCHANT_NAME || "test";
        const MERCHANT_CITY = process.env.MERCHANT_CITY || "Phnom Penh";

        // Determine currency (default USD)
        const qrCurrency = currency === "KHR"
            ? khqrData.currency.khr
            : khqrData.currency.usd;

        const optionalData = {
            currency: qrCurrency,
            amount: parseFloat(amount),
            billNumber: billNumber || `INV-${Date.now()}`,
            mobileNumber: process.env.MERCHANT_PHONE || "",
            storeLabel: process.env.STORE_LABEL || "POS Store",
            terminalLabel: "POS-T1",
            expirationTimestamp: Date.now() + (5 * 60 * 1000), // expires in 5 minutes
        };

        // bakong-khqr v1.x signature: (bakongAccountID, merchantName, merchantCity, optional)
        // currency, amount and expirationTimestamp all live inside `optional`.
        // An amount is what makes the QR *dynamic* (trackable by MD5); without it
        // Bakong returns "System does not support static QR code" on check-payment.
        const individualInfo = new IndividualInfo(
            BAKONG_ACCOUNT_ID,
            MERCHANT_NAME,
            MERCHANT_CITY,
            optionalData
        );

        const khqr = new BakongKHQR();
        const response = khqr.generateIndividual(individualInfo);

        if (response && response.data) {
            // response.data.qr contains the EMV-compliant KHQR string
            // This string can be encoded into a QR code image for customers to scan
            // with any Bakong-supported banking app (ABA, Wing, ACLEDA, etc.)
            return res.status(200).json({
                success: true,
                data: {
                    qr: response.data.qr,       // The KHQR string to encode as QR image
                    md5: response.data.md5,       // MD5 hash for verification
                    merchantName: MERCHANT_NAME,
                    currency: currency || 'USD',
                    amount: parseFloat(amount),
                },
                message: 'KHQR generated successfully',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to generate KHQR',
        });

    } catch (error) {
        console.error("KHQR generation error:", error);
        logError(res, { message: error.message || 'Unknown error' }, "khqrController");
    }
};


const checkPaymentStatus = async (req, res) => {
    try {
        const { hash, md5 } = req.body;
        
        // Check if Bakong API is enabled
        if (process.env.BAKONG_API_ENABLED !== 'true') {
            return res.status(400).json({
                success: false,
                message: 'Bakong API verification is not enabled. Please configure BAKONG_API_TOKEN in .env',
            });
        }

        if (!hash && !md5) {
            return res.status(400).json({
                success: false,
                message: 'Hash or MD5 is required',
            });
        }

        // Call Bakong Open API to check transaction status
        const apiUrl = process.env.BAKONG_API_URL || 'https://api-bakong.nbc.gov.kh';
        const apiToken = process.env.BAKONG_API_TOKEN;

        // Determine which endpoint to use based on provided parameter
        const endpoint = hash ? '/v1/check_transaction_by_hash' : '/v1/check_transaction_by_md5';
        const requestBody = hash ? { hash } : { md5 };

        const response = await axios.post(`${apiUrl}${endpoint}`, requestBody, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000, // 10 seconds timeout
        });

        // Official response format:
        // { responseCode: 0, responseMessage: "...", data: {...} }
        // responseCode: 0 = Success, 1 = Failed
        
        if (response.data && response.data.responseCode === 0) {
            const transactionData = response.data.data || {};

            return res.status(200).json({
                success: true,
                status: 'COMPLETED',
                isCompleted: true,
                data: {
                    status: 'COMPLETED',
                    isCompleted: true,
                    hash: transactionData.hash,
                    fromAccountId: transactionData.fromAccountId,
                    toAccountId: transactionData.toAccountId,
                    currency: transactionData.currency,
                    amount: transactionData.amount,
                    description: transactionData.description,
                },
                message: response.data.responseMessage || 'Transaction found successfully',
            });
        }

        // responseCode: 1 = Failed
        return res.status(404).json({
            success: false,
            status: 'PENDING',
            isCompleted: false,
            message: response.data?.responseMessage || 'Transaction not found',
        });

    } catch (error) {
        console.error("Bakong API check payment error:", error.message);
        if (error.response) {
            console.error("Bakong responded:", error.response.status, JSON.stringify(error.response.data));
        }

        if (error.response) {
            // Handle HTTP error codes: 400, 401, 404, 500
            const statusCode = error.response.status;
            const errorMessage = error.response.data?.responseMessage || 
                                error.response.data?.message || 
                                'Failed to check payment status';
            
            return res.status(statusCode).json({
                success: false,
                message: errorMessage,
            });
        }
        
        logError(res, { message: error.message || 'Unknown error' }, "khqrController - checkPaymentStatus");
    }
};

const verifyKHQR = async (req, res) => {
    try {
        const { qrString } = req.body;

        if (!qrString) {
            return res.status(400).json({
                success: false,
                message: 'QR string is required',
            });
        }

        const isValid = BakongKHQR.verify(qrString).isValid;
        const decoded = BakongKHQR.decode(qrString);

        return res.status(200).json({
            success: true,
            data: {
                isValid,
                decoded,
            },
        });
    } catch (error) {
        console.error("KHQR verify error:", error);
        logError(res, { message: error.message || 'Unknown error' }, "khqrController");
    }
};
module.exports = { createCheckoutSession, PaymentSuccess , generateKHQR, verifyKHQR , checkPaymentStatus };