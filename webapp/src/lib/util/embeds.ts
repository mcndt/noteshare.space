/**
 * Returns the EmbedType if embeddable, false if not.
 * @param filename File extension to check.
 * @returns EmbedType if embeddable, false if not.
 */
export function getEmbedType(filename: string): EmbedType | boolean {
	return isImage(filename) ? EmbedType.IMAGE : false;
}

export function getMimeType(filename: string) {
	return 'image/jpeg';
}

export enum EmbedType {
	IMAGE = 'IMAGE'
}

function isImage(filename: string): boolean {
	const match = filename.match(/(png|jpe?g|svg|bmp|gif|)$/i);
	return !!match && match[0]?.length > 0;
}
