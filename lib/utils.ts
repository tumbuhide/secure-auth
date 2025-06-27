import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// Kunci tidak lagi diinisialisasi di sini untuk stabilitas yang lebih baik.

export const createErrorResponse = (
    message: string,
    status: number,
    code: string,
    details?: object
): NextResponse => {
    return NextResponse.json(
        { error: { code, message, details } },
        { status }
    );
};

export const generateRandomString = (length: number): string => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

export const hashString = (str: string): string => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

export const verifyHash = (str: string, hash: string): boolean => {
  return hashString(str) === hash;
};

export const encrypt = async (text: string): Promise<{ encryptedString?: string; error?: Error }> => {
    // Inisialisasi dan validasi kunci dilakukan "just-in-time" di sini.
    const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
    if (!encryptionKey || encryptionKey.length !== 64) {
        console.error("FATAL: MFA_ENCRYPTION_KEY tidak valid atau tidak ada.");
        return { error: new Error('Konfigurasi kunci enkripsi server tidak valid.') };
    }
    const key = Buffer.from(encryptionKey, 'hex');

    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();
        const encryptedString = Buffer.concat([iv, authTag, encrypted]).toString('hex');
        return { encryptedString };
    } catch (error: any) {
        return { error };
    }
};

export const decrypt = async (encryptedText: string): Promise<{ decryptedString?: string; error?: Error }> => {
    // Inisialisasi dan validasi kunci dilakukan "just-in-time" di sini.
    const encryptionKey = process.env.MFA_ENCRYPTION_KEY;
    if (!encryptionKey || encryptionKey.length !== 64) {
        console.error("FATAL: MFA_ENCRYPTION_KEY tidak valid atau tidak ada.");
        return { error: new Error('Konfigurasi kunci enkripsi server tidak valid.') };
    }
    const key = Buffer.from(encryptionKey, 'hex');
    
    try {
        const data = Buffer.from(encryptedText, 'hex');
        const iv = data.slice(0, IV_LENGTH);
        const authTag = data.slice(IV_LENGTH, IV_LENGTH + 16);
        const encrypted = data.slice(IV_LENGTH + 16);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
        return { decryptedString: decrypted };
    } catch (error: any) {
        return { error };
    }
};
