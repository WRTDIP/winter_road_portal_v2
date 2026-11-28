import express from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import { rateLimit } from 'express-rate-limit';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readSessionCookie } from './auth.route.mjs';
import { syncAuth0User, publicUserSelect, IdentityConflictError, UnverifiedEmailError } from '../lib/auth0-user.mjs';

export function createAuth0Router({
    prisma,
    issuerBaseURL = `https://${process.env.AUTH0_DOMAIN || 'dev-chk7fj0z6p5bj1da.ca.auth0.com'}/`,
    audience = process.env.AUTH0_AUDIENCE || 'urn:wrtdip:api',
    clientId = process.env.AUTH0_CLIENT_ID || 'qoVWsLJu8GfiJH4ZDlYZvh3eehrp4Ofa',
    provisioningSecret = process.env.AUTH0_PROVISIONING_SECRET,
    fetchProfile = fetch,
}) {
    const router = express.Router();
    const issuer = issuerBaseURL.replace(/\/$/, '');
    const limit = rateLimit({ windowMs: 5 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false });
    const digest = (value) => createHash('sha256').update(value).digest();

    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    router.post('/provision', limit, async (req, res, next) => {
        const supplied = req.get('authorization') || '';
        if (!provisioningSecret || !timingSafeEqual(digest(supplied), digest(`Bearer ${provisioningSecret}`))) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized provisioning request.' });
        }
        try {
            const user = await syncAuth0User(prisma, req.body || {}, { login: false });
            res.json({ status: 'success', data: { id: user.id } });
        } catch (error) {
            next(error);
        }
    });

    // Embedded login keeps the token in an httpOnly cookie; accept it when no
    // bearer header is sent.
    router.use((req, res, next) => {
        const token = readSessionCookie(req);
        if (!req.headers.authorization && token) req.headers.authorization = `Bearer ${token}`;
        next();
    });

    router.use(auth({ issuerBaseURL: issuer, audience, tokenSigningAlg: 'RS256' }));
    router.use((req, res, next) => {
        if (!req.auth.payload.sub || req.auth.payload.azp !== clientId) {
            return res.status(401).json({ status: 'error', message: 'Invalid application identity.' });
        }
        next();
    });

    router.post('/sync', limit, async (req, res, next) => {
        try {
            const response = await fetchProfile(`${issuer}/userinfo`, {
                headers: { Authorization: `Bearer ${req.auth.token}` },
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) {
                return res.status(response.status === 401 ? 401 : 502).json({
                    status: 'error', message: 'Unable to verify your Auth0 profile. Please sign in again.',
                });
            }
            const profile = await response.json();
            if (profile.sub !== req.auth.payload.sub) {
                return res.status(401).json({ status: 'error', message: 'Identity verification failed.' });
            }
            const user = await syncAuth0User(prisma, profile);
            res.json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    });

    router.get('/me', async (req, res, next) => {
        try {
            const user = await prisma.user.findUnique({
                where: { auth0Id: req.auth.payload.sub }, select: publicUserSelect,
            });
            if (!user) return res.status(404).json({ status: 'error', message: 'Account has not been linked yet.' });
            res.json({ status: 'success', data: user });
        } catch (error) {
            next(error);
        }
    });

    router.use((error, req, res, next) => {
        if (error instanceof IdentityConflictError || error instanceof UnverifiedEmailError) {
            return res.status(409).json({ status: 'error', message: error.message });
        }
        if ([400, 401, 403].includes(error.status)) {
            return res.status(error.status).json({ status: 'error', message: 'Authentication required. Please sign in again.' });
        }
        console.error('Auth0 account request failed:', error.code || error.name);
        res.status(503).json({ status: 'error', message: 'Your account is temporarily unavailable. Please try again.' });
    });

    return router;
}