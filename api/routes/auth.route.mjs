import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'wrtdip_session';
export const OAUTH_COOKIE = 'wrtdip_oauth';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readCookie(req, cookieName) {
    for (const part of (req.get('cookie') || '').split(';')) {
        const [name, ...value] = part.trim().split('=');
        if (name !== cookieName) continue;
        try {
            return decodeURIComponent(value.join('='));
        } catch {
            return null;
        }
    }
    return null;
}

export function readSessionCookie(req) {
    return readCookie(req, SESSION_COOKIE);
}

const base64url = (buffer) => buffer.toString('base64url');
const sha256 = (value) => createHash('sha256').update(value).digest();
const sameSecret = (a, b) => timingSafeEqual(sha256(a), sha256(b));

// Embedded email/password login. The browser posts credentials to this API,
// which exchanges them with Auth0 (password-realm grant) and keeps the access
// token in an httpOnly cookie, so tokens never reach page scripts.
export function createAuthRouter({
    domain = process.env.AUTH0_DOMAIN || 'dev-chk7fj0z6p5bj1da.ca.auth0.com',
    clientId = process.env.AUTH0_CLIENT_ID || 'qoVWsLJu8GfiJH4ZDlYZvh3eehrp4Ofa',
    clientSecret = process.env.AUTH0_CLIENT_SECRET,
    audience = process.env.AUTH0_AUDIENCE || 'urn:wrtdip:api',
    connection = process.env.AUTH0_CONNECTION || 'Username-Password-Authentication',
    socialProviders = (process.env.AUTH0_SOCIAL_PROVIDERS || '').split(',').map((name) => name.trim()).filter(Boolean),
    socialConnections = {
        google: process.env.AUTH0_GOOGLE_CONNECTION || 'google-oauth2',
        microsoft: process.env.AUTH0_MICROSOFT_CONNECTION || 'windowslive',
    },
    callbackUrl = process.env.AUTH0_CALLBACK_URL,
    fetchAuth0 = fetch,
}) {
    const enabledProviders = socialProviders.filter((name) => Object.hasOwn(socialConnections, name));
    const router = express.Router();
    const base = domain.startsWith('http') ? domain.replace(/\/$/, '') : `https://${domain}`;
    const limit = rateLimit({ windowMs: 5 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

    router.use((req, res, next) => {
        res.set('Cache-Control', 'no-store');
        next();
    });

    const fail = (res, status, message, extra = {}) => res.status(status).json({ status: 'error', message, ...extra });

    // Signup creates the Auth0 account before signing in. If that sign in then
    // fails, the account still exists, so tell the user to sign in rather than
    // retry signup (which would only report that the email is taken).
    const signedUpButNotIn = (res) => fail(res, 502,
        'Your account was created, but we could not sign you in automatically. Please sign in.',
        { accountCreated: true });

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

    async function signIn(req, res, email, password, { afterSignup = false } = {}) {
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
            if (afterSignup) {
                console.error('Auth0 sign in after signup failed:', result.status, error, description);
                return signedUpButNotIn(res);
            }
            if (error === 'invalid_grant') return fail(res, 401, 'Incorrect email or password.');
            if (error === 'too_many_attempts') return fail(res, 429, 'This account has been blocked after too many failed attempts. Check your email for instructions to unblock it.');
            if (error === 'unauthorized' && description) return fail(res, 403, description);
            if (error === 'unauthorized_client' || (error === 'access_denied' && /grant/i.test(description || ''))) {
                console.error('Auth0 password login is not enabled for this application:', description);
                return fail(res, 503, 'Password sign in is not available right now. Please try again later.');
            }
            console.error('Auth0 login failed:', result.status, error, description);
            return fail(res, 502, 'Unable to sign in right now. Please try again.');
        }

        setSession(req, res, result.data);
        res.json({ status: 'success' });
    }

    function setSession(req, res, tokens) {
        res.cookie(SESSION_COOKIE, tokens.access_token, {
            httpOnly: true,
            secure: req.secure,
            sameSite: 'strict',
            path: '/api',
            maxAge: (tokens.expires_in || 3600) * 1000,
        });
    }

    const oauthCookieOptions = (req) => ({ httpOnly: true, secure: req.secure, sameSite: 'lax', path: `${req.baseUrl}/callback` });

    function redirectUriFor(req) {
        if (callbackUrl) return callbackUrl;
        const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
        return `${req.protocol}://${host}${req.baseUrl}/callback`;
    }

    router.get('/providers', (req, res) => {
        res.json({ status: 'success', data: enabledProviders });
    });

    router.get('/social/:provider', (req, res) => {
        const provider = req.params.provider;
        if (!enabledProviders.includes(provider)) return res.redirect('/login?error=social_unavailable');
        const state = base64url(randomBytes(24));
        const verifier = base64url(randomBytes(32));
        const redirectUri = redirectUriFor(req);
        res.cookie(OAUTH_COOKIE, base64url(Buffer.from(JSON.stringify({ state, verifier, redirectUri }))), {
            ...oauthCookieOptions(req), maxAge: 10 * 60 * 1000,
        });
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri,
            scope: 'openid profile email',
            audience,
            connection: socialConnections[provider],
            state,
            code_challenge: base64url(sha256(verifier)),
            code_challenge_method: 'S256',
        });
        res.redirect(`${base}/authorize?${params}`);
    });

    router.get('/callback', async (req, res) => {
        const backToLogin = (reason) => res.redirect(`/login?error=${reason}`);
        let saved = null;
        try {
            saved = JSON.parse(Buffer.from(readCookie(req, OAUTH_COOKIE) || '', 'base64url').toString());
        } catch {
            saved = null;
        }
        res.clearCookie(OAUTH_COOKIE, oauthCookieOptions(req));

        const { code, state, error, error_description: description } = req.query;
        if (error) {
            if (error === 'access_denied' && !description) return backToLogin('social_cancelled');
            console.error('Auth0 social sign in failed:', error, description);
            return backToLogin(error === 'access_denied' ? 'social_denied' : 'social_failed');
        }
        if (typeof code !== 'string' || typeof state !== 'string' || typeof saved?.state !== 'string' ||
            typeof saved.verifier !== 'string' || !sameSecret(state, saved.state)) {
            return backToLogin('social_expired');
        }
        try {
            const result = await post('/oauth/token', {
                grant_type: 'authorization_code',
                client_id: clientId,
                ...(clientSecret ? { client_secret: clientSecret } : {}),
                code,
                code_verifier: saved.verifier,
                redirect_uri: saved.redirectUri,
            }, req);
            if (!result.ok || !result.data.access_token) {
                console.error('Auth0 social code exchange failed:', result.status, result.data?.error, result.data?.error_description);
                return backToLogin('social_failed');
            }
            setSession(req, res, result.data);
            res.redirect('/dashboard');
        } catch (failure) {
            console.error('Auth0 social code exchange request failed:', failure.name);
            backToLogin('social_failed');
        }
    });

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
        let created = false;
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
            created = true;
            await signIn(req, res, email, password, { afterSignup: true });
        } catch (error) {
            if (created) {
                console.error('Auth0 sign in after signup request failed:', error.name);
                return signedUpButNotIn(res);
            }
            console.error('Auth0 signup request failed:', error.name);
            fail(res, 502, 'Unable to reach the sign up service. Please try again.');
        }
    });

    // Asks Auth0 to email a password reset link. The reply is the same whether
    // or not the account exists, so this cannot be used to probe for emails.
    router.post('/forgot-password', limit, async (req, res) => {
        const email = String(req.body?.email || '').trim();
        if (!EMAIL_PATTERN.test(email)) return fail(res, 400, 'Enter a valid email address.');
        try {
            const result = await post('/dbconnections/change_password', {
                client_id: clientId, connection, email,
            }, req);
            if (!result.ok) {
                console.error('Auth0 password reset failed:', result.status, result.data?.error || result.data?.code);
                return fail(res, 502, 'Unable to send a reset email right now. Please try again.');
            }
            res.json({
                status: 'success',
                message: 'If an account exists for that email, we have sent a link to reset your password. Check your inbox and spam folder.',
            });
        } catch (error) {
            console.error('Auth0 password reset request failed:', error.name);
            fail(res, 502, 'Unable to reach the password reset service. Please try again.');
        }
    });

    router.post('/logout', (req, res) => {
        res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: req.secure, sameSite: 'strict', path: '/api' });
        res.json({ status: 'success' });
    });

    return router;
}
