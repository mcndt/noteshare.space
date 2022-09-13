// TODO: should be same source code as used in the plugin!!

import { AES, enc, HmacSHA256 } from 'crypto-js';

export async function decrypt(
	cryptData: { ciphertext: string; hmac: string; key: string },
	version: string
): Promise<string> {
	console.debug(`decrypting with crypto suite ${version}`);
	if (version === 'v1') {
		return decrypt_v1(cryptData);
	}
	if (version === 'v2') {
		return decrypt_v2(cryptData);
	}
	throw new Error(`Unsupported crypto version: ${version}`);
}

export async function decrypt_v1(cryptData: {
	ciphertext: string;
	hmac: string;
	key: string;
}): Promise<string> {
	const hmac_calculated = HmacSHA256(cryptData.ciphertext, cryptData.key).toString();
	const is_authentic = hmac_calculated == cryptData.hmac;

	if (!is_authentic) {
		throw Error('Failed HMAC check');
	}
	const md = AES.decrypt(cryptData.ciphertext, cryptData.key).toString(enc.Utf8);
	return md;
}

export async function decrypt_v2(cryptData: {
	ciphertext: string;
	hmac: string;
	key: string;
}): Promise<string> {
	const md = await decryptBuffer_v2(cryptData);
	return new TextDecoder().decode(md);
}

export async function decryptBuffer_v2(cryptData: {
	ciphertext: string;
	hmac: string;
	key: string;
}): Promise<ArrayBuffer> {
	const secret = base64ToArrayBuffer(cryptData.key);
	const ciphertext_buf = base64ToArrayBuffer(cryptData.ciphertext);
	const hmac_buf = base64ToArrayBuffer(cryptData.hmac);

	const is_authentic = await window.crypto.subtle.verify(
		{ name: 'HMAC', hash: 'SHA-256' },
		await _getSignKey(secret),
		hmac_buf,
		ciphertext_buf
	);

	if (!is_authentic) {
		throw Error('Failed HMAC check');
	}

	const data = await window.crypto.subtle.decrypt(
		{ name: 'AES-CBC', iv: new Uint8Array(16) },
		await _getAesKey(secret),
		ciphertext_buf
	);
	return data;
}

function _getAesKey(secret: ArrayBuffer): Promise<CryptoKey> {
	return window.crypto.subtle.importKey('raw', secret, { name: 'AES-CBC', length: 256 }, false, [
		'encrypt',
		'decrypt'
	]);
}

function _getSignKey(secret: ArrayBuffer): Promise<CryptoKey> {
	return window.crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
		'verify'
	]);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
	return Uint8Array.from(window.atob(base64), (c) => c.charCodeAt(0));
}
