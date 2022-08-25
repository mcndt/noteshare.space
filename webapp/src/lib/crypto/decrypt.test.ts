import { expect, describe, it, vi } from 'vitest';
import { webcrypto } from 'crypto';
import { decrypt_v1, decrypt_v2 } from './decrypt';

vi.stubGlobal('crypto', {
	subtle: webcrypto.subtle
});

const TEST_NOTE_V1 = {
	ciphertext: 'U2FsdGVkX1+r+nJffb6piMq1hPFSBSkf9/sgXj/UalA=',
	hmac: '7bfd5b0e96a0ed7ea43091d3e26f7c487bcebf8ba06175a4d4fc4d8466ba37f6'
};
const TEST_KEY_V1 = 'mgyUwoFwhlb1cnjhYYSrkY9_7hZKcRHQJs5l8wYB3Vk';
const TEST_PLAINTEXT_V1 = 'You did it!';

const TEST_NOTE_V2 = {
	ciphertext: '7u2HlkxEfptYF0KTIkSLHBbNumP58XjfjEuLb2qG0tw=',
	hmac: '6SDEr9vCn4qM0u6+yFt/e+8Z1LLCNcCTw4GB4aNVMXM='
};
const TEST_KEY_V2 = 'fzrpzrhjyeBgZNJTlIQ5GmduQ+AywMUFPY9ZisP6A9c=';
const TEST_PLAINTEXT_V2 = 'This is the test data.';

describe.each([
	{ decrypt_func: decrypt_v1, note: TEST_NOTE_V1, key: TEST_KEY_V1, plaintext: TEST_PLAINTEXT_V1 },
	{ decrypt_func: decrypt_v2, note: TEST_NOTE_V2, key: TEST_KEY_V2, plaintext: TEST_PLAINTEXT_V2 }
])('decrypt', ({ decrypt_func, note, key, plaintext }) => {
	it('Should return plaintext with the correct key', async () => {
		const test_plaintext = await decrypt_func({ ...note, key: key });
		expect(test_plaintext).toContain(plaintext);
	});

	it('Should throw with the wrong key', async () => {
		await expect(decrypt_v1({ ...note, key: '' })).rejects.toThrow('Failed HMAC check');
	});

	it('Should throw with the wrong HMAC', async () => {
		await expect(decrypt_v1({ ...note, hmac: '', key: key })).rejects.toThrow('Failed HMAC check');
	});
});
