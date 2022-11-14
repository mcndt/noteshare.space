import type { EncryptedNote } from '$lib/model/EncryptedNote';
import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ request, params, setHeaders, getClientAddress }) => {
	const ip = (request.headers.get('x-forwarded-for') || getClientAddress()) as string;
	const url = `${import.meta.env.VITE_SERVER_INTERNAL}/api/note/${params.id}`;
	const response = await fetch(url, {
		headers: {
			'x-forwarded-for': ip
		}
	});

	if (response.ok) {
		try {
			const note: EncryptedNote = await response.json();
			note.insert_time = new Date(note.insert_time as unknown as string);
			note.expire_time = new Date(note.expire_time as unknown as string);
			const maxage = Math.floor((note.expire_time.valueOf() - note.insert_time.valueOf()) / 1000);

			setHeaders({
				maxage: `${maxage}`,
				'Cache-Control': `max-age=${maxage}, public`
			});
			return { note };
		} catch {
			throw error(500, response.statusText);
		}
	} else {
		throw error(response.status, response.statusText);
	}
};
