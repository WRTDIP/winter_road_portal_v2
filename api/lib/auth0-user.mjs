export class IdentityConflictError extends Error {}

export class UnverifiedEmailError extends Error {}

export const publicUserSelect = {
    id: true,
    auth0Id: true,
    email: true,
    name: true,
    emailverified: true,
    datecreated: true,
    dateloggedin: true,
};

export async function syncAuth0User(prisma, profile, { login = true } = {}) {
    if (typeof profile.sub !== 'string' || !profile.sub ||
        typeof profile.email !== 'string' || !profile.email.trim()) {
        throw new IdentityConflictError('The identity must include a subject and email.');
    }

    const email = profile.email.trim().toLowerCase();
    const emailverified = profile.email_verified === true;
    const name = typeof profile.name === 'string' ? profile.name : null;
    const activity = login ? { dateloggedin: new Date() } : {};

    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            return await prisma.$transaction(async (transaction) => {
                const linked = await transaction.user.findUnique({ where: { auth0Id: profile.sub } });
                if (linked) {
                    return transaction.user.update({
                        where: { id: linked.id },
                        data: { ...activity, ...(linked.email.toLowerCase() === email ? { emailverified } : {}) },
                        select: publicUserSelect,
                    });
                }

                const matches = await transaction.user.findMany({
                    where: { email: { equals: email, mode: 'insensitive' } },
                    take: 2,
                });
                if (matches.length > 1 || (matches[0]?.auth0Id && matches[0].auth0Id !== profile.sub)) {
                    throw new IdentityConflictError('This email is already associated with another account.');
                }

                const existing = matches[0];
                if (existing && (!emailverified || !existing.emailverified)) {
                    throw new UnverifiedEmailError('An existing account with this email requires verified ownership before linking. Contact support.');
                }

                const data = { auth0Id: profile.sub, emailverified, ...activity };
                return existing
                    ? transaction.user.update({ where: { id: existing.id }, data, select: publicUserSelect })
                    : transaction.user.create({ data: { ...data, email, name }, select: publicUserSelect });
            }, { isolationLevel: 'Serializable' });
        } catch (error) {
            if (attempt < 2 && ['P2002', 'P2034'].includes(error.code)) continue;
            throw error;
        }
    }
}