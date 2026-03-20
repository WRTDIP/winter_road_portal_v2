
import { MailtrapClient } from "mailtrap";

const TOKEN = "0cb39453eb8b42c9231774332aaf8e7b"; //Replace this later

const mtclient = new MailtrapClient({
    token: TOKEN,
});


const mtsender = {
    email: "hello@wramp.ca",
    name: "Wramp Team",
};

export { mtclient, mtsender };


// const recipients = [
//     {
//        email: "
//     }
// ];

// client
//     .send({
//         from: sender,
//         to: recipients,
//         subject: "This is a test email!",
//         text: "Hello! This is a test email sent from the dev route of our API.",
//         category: "Integration Test",
//     })
//     .then(() => {
//         res.send("Test email sent successfully.");
//     })
//     .catch((error) => {
//         console.error(error);
//         res.status(500).send("Failed to send test email.");
//     });

// sendEmail