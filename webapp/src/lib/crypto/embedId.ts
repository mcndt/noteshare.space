export async function getEmbedId(filename: string): Promise<string> {
	// generate 64 bit id
	const idBuf = new Uint32Array((await deriveKey(filename)).slice(0, 8));

	// convert idBuf to base 32 string
	const id = idBuf.reduce((acc, cur) => {
		return acc + cur.toString(32);
	}, '');

	return id;
}

async function deriveKey(seed: string): Promise<ArrayBuffer> {
	const keyMaterial = await window.crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(seed),
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const masterKey = await window.crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: new Uint8Array(16),
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	return new Uint8Array(masterKey);
}
