import crypto from 'crypto';

export function genUUID() {
    const seconds = Math.floor(Date.now() / 1000).toString().padStart(10, '0').slice(0, 10);
    const part1 = seconds.slice(0, 5);
    const part2 = seconds.slice(5, 10);
    const ALNUM = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rand5 = () => {
        let out = '';
        while (out.length < 5) {
            const bytes = crypto.randomBytes(8);
            for (let i = 0; i < bytes.length && out.length < 5; i++) {
                out += ALNUM[bytes[i] % ALNUM.length];
            }
        }
        return out;
    };
    const part3 = rand5();
    const part4 = rand5();
    return `${part1}-${part2}-${part3}-${part4}`;
}