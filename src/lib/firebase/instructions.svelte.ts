import type { RoleInstruction } from '../types';

export async function getAllInstructions(): Promise<RoleInstruction[]> {
    try {
        // Use eager: true and as: 'raw' to get the markdown content at build time
        const modules = import.meta.glob('/src/lib/instructions/*.md', {
            as: 'raw',
            eager: true
        });

        const instructions: RoleInstruction[] = Object.entries(modules).map(([path, content]) => {
            // Extract filename without extension (e.g., /src/lib/instructions/Sound.md -> Sound)
            const filename = path.split('/').pop()?.replace('.md', '') || 'General';

            // For now, mapping filename to both team and role as requested
            // If filenames contain a dash (e.g., Tech-Sound), split them
            const parts = filename.split('-');
            const team = parts[0];
            const role = parts.slice(1).join(' ') || filename;

            return {
                team,
                role,
                instructions_md: content as string
            };
        });

        return instructions;
    } catch (error) {
        console.error('Error loading static instructions:', error);
        return [];
    }
}
