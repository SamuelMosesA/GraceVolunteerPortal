import { getInstructionByFilename } from '$lib/firebase/instructions.svelte';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const prerender = false;

export const load: PageLoad = async ({ params }) => {
	const instruction = await getInstructionByFilename(params.filename);
	if (!instruction) {
		error(404, 'Instruction not found');
	}
	return {
		instruction
	};
};
