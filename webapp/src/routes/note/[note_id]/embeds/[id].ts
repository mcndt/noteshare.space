import type { EncryptedEmbed } from '$lib/model/EncryptedEmbed';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ request, clientAddress, params }) => {
	const ip = (request.headers.get('x-forwarded-for') || clientAddress) as string;
	const url = `${import.meta.env.VITE_SERVER_INTERNAL}/api/note/${params.note_id}/embeds/${
		params.id
	}`;
	const response = await fetch(url, {
		headers: {
			'x-forwarded-for': ip
		}
	});

	if (response.ok) {
		try {
			const embed: EncryptedEmbed = await response.json();
			return {
				status: response.status,
				body: embed
			};
		} catch {
			return {
				status: 500,
				error: response.statusText
			};
		}
	} else {
		return {
			status: response.status,
			error: response.statusText
		};
	}
};
