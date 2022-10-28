const crypto = require("crypto");
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const options = {
    amount: 50000,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
};
instance.orders.create(options, function (err, order) {
    console.log(order);
    res.send({
        orderId: order.id,
    })
});

exports.generateSignature = async (req, res, next) => {
    generated_signature = hmac_sha256(order_id + "|" + razorpay_payment_id, secret);
    if (generated_signature == razorpay_signature) {
        console.log("payment is successful");
    }
}

exports.verifyPayment = async (req, res, next) => {

    let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
    console.log("sig received ", req.body.response.razorpay_signature);
    console.log("sig generated ", expectedSignature);
    const response = { "signatureIsValid": "false" }
    if (expectedSignature === req.body.response.razorpay_signature)
        response = { "signatureIsValid": "true" }
    res.send(response);
};
