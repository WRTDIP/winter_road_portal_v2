import express from 'express';
import { rateLimit } from 'express-rate-limit';

export const SESSION_COOKIE = 'wrtdip_session';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function readSessionCookie(req) {
    for (const part of (req.get('cookie') || '').split(';')) {
        const [name, ...value] = part.trim().split('=');
        if (name === SESSION_COOKIE) return decodeURIComponent(value.join('='));
    }
    return null;
}

// Embedded email/password login. The browser posts credentials to this API,
// which exchanges them with Auth0 (password-realm grant) and keeps the access
// token in an httpOnly cookie, so tokens never reach page scripts.
export function createAuthRouter({
    domain = process.env.AUTH0_DOMAIN || 'dev-chk7fj0z6p5bj1da.ca.auth0.com',
    clientId = process.env.AUTH0_CLIENT_ID || 'qoVWsLJu8GfiJH4ZDlYZvh3eehrp4Ofa',
    clientSecret = process.env.AUTH0_CLIENT_SECRET,
    audience = process.env.AUTH0_AUDIENCE || 'urn:wrtdip:api',
    connection = process.env.AUTH0_CONNECTION || 'Username-Password-Authentication',
    fetchAuth0 = fetch,
}) {
    const router = express.Router();
    const base = domain.startsWith('http') ? domain.replace(/\/$/, '') : `https://${domain}`;
    const limit = rateLimit({ windowMs: 5 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    const fail = (res, status, message) => res.status(status).json({ status: 'error', message });

    async function post(path, body, req) {
        const headers = { 'Content-Type': 'application/json' };
        // Lets Auth0 brute-force protection see the end user's IP rather than
        // the server's. Auth0 only honours it for confidential clients.
        if (clientSecret) headers['auth0-forwarded-for'] = req.ip;
        const response = await fetchAuth0(`${base}${path}`, {
            method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10000),
        });
        return { ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) };
    }

    async function signIn(req, res, email, password) {
        const result = await post('/oauth/token', {
            grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            realm: connection,
            username: email,
            password,
            client_id: clientId,
            ...(clientSecret ? { client_secret: clientSecret } : {}),
            audience,
            scope: 'openid profile email',
        }, req);

        if (!result.ok) {
            const { error, error_description: description } = result.data;
            if (error === 'invalid_grant') return fail(res, 401, 'Incorrect email or password.');
            if (error === 'too_many_attempts') return fail(res, 429, 'This account has been blocked after too many failed attempts. Check your email for instructions to unblock it.');
            if (error === 'unauthorized' && description) return fail(res, 403, description);
            if (error === 'unauthorized_client' || (error === 'access_denied' && /grant/i.test(description || ''))) {
                console.error('Auth0 password login is not enabled for this application:', description);
                return fail(res, 503, 'Password sign in is not available right now. Please try again later.');
            }
            console.error('Auth0 login failed:', result.status, error);
            return fail(res, 502, 'Unable to sign in right now. Please try again.');
        }

        res.cookie(SESSION_COOKIE, result.data.access_token, {
            httpOnly: true,
            secure: req.secure,
            sameSite: 'strict',
            path: '/api',
            maxAge: (result.data.expires_in || 3600) * 1000,
        });
        res.json({ status: 'success' });
    }

    router.post('/login', limit, async (req, res) => {
        const email = String(req.body?.email || '').trim();
        const password = String(req.body?.password || '');
        if (!EMAIL_PATTERN.test(email) || !password) return fail(res, 400, 'Enter your email address and password.');
        try {
            await signIn(req, res, email, password);
        } catch (error) {
            console.error('Auth0 login request failed:', error.name);
            fail(res, 502, 'Unable to reach the sign in service. Please try again.');
        }
    });

    router.post('/signup', limit, async (req, res) => {
        const name = String(req.body?.name || '').trim();
        const email = String(req.body?.email || '').trim();
        const password = String(req.body?.password || '');
        if (!name) return fail(res, 400, 'Enter your full name.');
        if (!EMAIL_PATTERN.test(email)) return fail(res, 400, 'Enter a valid email address.');
        if (!password) return fail(res, 400, 'Enter a password.');
        try {
            const result = await post('/dbconnections/signup', {
                client_id: clientId, connection, email, password, name,
            }, req);
            if (!result.ok) {
                const { code, name: kind, description, message, policy } = result.data;
                if (kind === 'PasswordStrengthError' || code === 'invalid_password') {
                    return fail(res, 400, `Password is too weak.${policy ? ` ${policy}` : ''}`.trim());
                }
                if (code === 'invalid_signup' || code === 'user_exists') {
                    return fail(res, 409, 'An account with this email may already exist. Try signing in instead.');
                }
                if (kind === 'BadRequestError' || result.status === 400) {
                    return fail(res, 400, typeof description === 'string' ? description : message || 'Please check your details and try again.');
                }
                console.error('Auth0 signup failed:', result.status, code || kind);
                return fail(res, 502, 'Unable to create your account right now. Please try again.');
            }
            await signIn(req, res, email, password);
        } catch (error) {
            console.error('Auth0 signup request failed:', error.name);
            fail(res, 502, 'Unable to reach the sign up service. Please try again.');
        }
    });

    router.post('/logout', (req, res) => {
        res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: req.secure, sameSite: 'strict', path: '/api' });
        res.json({ status: 'success' });
    });

    return router;
}
