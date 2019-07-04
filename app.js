const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");

const app = express();
const PORT = process.env.PORT || 4050  

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    // host: "api.sandbox.paypal.com",
    mode: "sandbox", //sandbox or live
    client_id:
        "AWqL58--bybKGNEheKrV-o-X49_hvdu4uw5xj4Fb54k0f8rtki6NlTF5UnBwJfrNRwPhrzK0AZMabSm6",
    client_secret:
        "ECpBAL9AQ8m8xNGVRLP5pVv1CthNAyyKAuk0Vqq3Z34TUO5sBFG3KXJysFpka2yaOMuwy5xLifDnA7FY"
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/paypal", (req, res) => {
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: `${process.env.PORT}/success` || "http://localhost:4050/success",
            cancel_url: `${process.env.PORT}/cancel` || "http://localhost:4050/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "Mudassir",
                            sku: "Mudassir",
                            price: "5.00",
                            currency: "USD",
                            quantity: 2
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "10.00"
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            console.log('Error during create_payment_json :', error );
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
});

app.get("/success", (req, res) => {
    // res.send("Success");
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "10.00"
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log("Get Payment Response");
            console.log(JSON.stringify(payment));
            res.render("success");
        }
    });
});

app.get("cancel", (req, res) => {
    res.render("cancel");
});

app.listen(process.env.PORT || PORT, () => {
    console.log("Server is running on port 4050");
});
