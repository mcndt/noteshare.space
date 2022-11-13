import type { EncryptedNote } from '$lib/model/EncryptedNote';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data, setHeaders }) => {
	const note: EncryptedNote = data.note;
	const maxage = Math.floor((note.expire_time.valueOf() - note.insert_time.valueOf()) / 1000);

	setHeaders({
		maxage: maxage,
		'Cache-Control': `max-age=${maxage}, public`
	});

	return { note };
};
