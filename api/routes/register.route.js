import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import { createUser } from '../controllers/user.controller.js';
import { prisma } from '../lib/prisma.js';
import {mtclient, mtsender} from '../lib/mailer.js';
const User = prisma.user;

const router = express.Router();

router.post(
    '/',
    [
        check('fullName', 'Full name is required').notEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 8 characters').isLength({ min: 8 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        console.log(req.body);
        const { fullName, email, password } = req.body;
        try {
            let existing = await prisma.user.findUnique({ where: { email } });
            if (existing) {
                return res.status(400).json({
                    status: "error",
                    message: `User already exists. Please check your email for validation link.
            <a href="/resend-email-validation">Click here to resend</a>`
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await createUser(req={ email, name: fullName, password: hashedPassword });

            const userSafe = { ...user };
            delete userSafe.password;

            // Generate a new auth code and send validation email logic would go here

            let newCode = await prisma.authCode.create({
                data: {
                    userId: user.id,
                    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    flow: "email_validation",
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
                }
            });
            

            // Send validation email using Mailtrap

            const recipients = [
                {
                    email: user.email
                }
            ];

            await mtclient.send({
                from: mtsender,
                to: recipients,
                subject: "Email Validation",
                text: `Hello! Please validate your email using the following code: ${newCode.code}
                https://${req.get('host')}/validate-email?code=${newCode.code}&email=${user.email}
                `,
                category: "Email Validation",
            }).then(() => {
                console.log({ status: "success", message: "Auth email sent successfully." });
            })
            .catch((error) => {
                console.log(error);
                res.status(500).json({status: "error", message: 'Server error' });
            });

            res.status(201).json({ status: 'success', message: "Registration successful. Please check your email for validation link." });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Server error' });
        }
    }
);

router.post(
    '/resend-validation-email',
    [
        check('email', 'Please include a valid email').isEmail()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ status: 'error', errors: errors.array() });
        console.log(req.body);
        const { email } = req.body;
        try {

            let user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({
                    status: "error",
                    message: `No user found with that email. Please check the email and try again.`
                });
            }

            let recentAuthCodes = await prisma.authCode.findMany({
                where: {
                    userId: user.id,
                    flow: "email_validation",
                    dateCreated: { lt: new Date(Date.now() - 5 * 60 * 1000) } 
                },
                orderBy: { dateCreated: 'desc' }
            });

            if (recentAuthCodes.length > 0) {
                return res.status(400).json({
                    status: "error",
                    message: `A validation email was recently sent. Please check your inbox or try again later.`
                });   
            }

            // Generate a new auth code and send validation email logic would go here

            let newCode = await prisma.authCode.create({
                data: {
                    userId: user.id,
                    code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                    flow: "email_validation",
                    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000)
                }
            });
            

            // Send validation email using Mailtrap

            const recipients = [
                {
                    email: user.email
                }
            ];

            await mtclient.send({
                from: mtsender,
                to: recipients,
                subject: "Email Validation",
                text: `Hello! Please validate your email using the following code: ${newCode.code}
                https://wramp.utsc.utoronto.ca/validate-email?code=${newCode.code}&email=${user.email}
                `,
                category: "Email Validation",
            })
            .then(() => {
                res.status(200).json({ status: "success", message: "Auth email sent successfully." });
            })
            .catch((error) => {
                console.error(error);
                res.status(500).json({status: "error", message: 'Server error' });
            });
            
        } catch (err) {
            console.error(err);
            res.status(500).json({status: "error",  message: 'Server error' });
        }
    }
);

router.post('/validate-email', async (req, res) => {
    const { email, code } = req.body;
    try {
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({
                status: "error",
                message: `No user found with that email. Please check the email and try again.`
            });
        }

        if (user.emailverified) {
            return res.status(400).json({
                status: "error",
                message: `Email is already validated. Please log in.`
            });
        }

        let authCode = await prisma.authCode.findFirst({
            where: {
                userId: user.id,
                code,
                flow: "email_validation",
            }
        });

        if (!authCode) {
            return res.status(400).json({
                status: "error",
                message: `Invalid or expired validation code. Please request a new one.`
            });
        }

        // Mark the user's email as validated
        await prisma.user.update({
            where: { id: user.id },
            data: { emailverified: true }
        });

        res.status(200).json({ status: "success", message: "Email validated successfully." });


    } catch (err) {
        console.error(err);
        res.status(500).json({status: "error", message: 'Server error' });
    }
});


export default router;



