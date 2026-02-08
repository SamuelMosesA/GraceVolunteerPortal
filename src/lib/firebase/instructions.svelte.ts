import { fireStore } from './connection';
import { collection, getDocs } from 'firebase/firestore';
import type { RoleInstruction } from '../types';

export async function getAllInstructions(): Promise<RoleInstruction[]> {
    try {
        const querySnapshot = await getDocs(collection(fireStore, 'role_instructions'));
        return querySnapshot.docs.map((doc) => doc.data() as RoleInstruction);
    } catch (error) {
        console.error('Error getting instructions:', error);
        return [];
    }
}
