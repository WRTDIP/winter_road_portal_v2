const express = require("express");
const router = express.Router();
const { MailtrapClient } = require("mailtrap");

router.get("/", (req, res) => {
    res.send("You are using the dev route.");
});

router.get("/sendtestemail", (req, res) => {

    const TOKEN = "0cb39453eb8b42c9231774332aaf8e7b"; //Replace this later

    const client = new MailtrapClient({
        token: TOKEN,
    });

    const sender = {
        email: "hello@wramp.mahadinur.com",
        name: "Wramp Team",
    };
    const recipients = [
        {
            email: "mcmogaming@gmail.com",
        }
    ];

    client
        .send({
            from: sender,
            to: recipients,
            subject: "This is a test email!",
            text: "Hello! This is a test email sent from the dev route of our API.",
            category: "Integration Test",
        })
        .then(() => {
            res.send("Test email sent successfully.");
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send("Failed to send test email.");
        });
});

module.exports = router;
