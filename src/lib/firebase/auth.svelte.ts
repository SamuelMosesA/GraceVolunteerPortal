import { firebaseApp } from './connection';
import {
	getAuth,
	GoogleAuthProvider,
	setPersistence,
	browserLocalPersistence,
	signInWithPopup,
	onAuthStateChanged,
	type User
} from 'firebase/auth';
import type { AuthState, OnAuthStateChangedResult } from '../types';
import { getContext, hasContext, setContext } from 'svelte';

export const firebaseAuth = getAuth(firebaseApp);
const authProvider = new GoogleAuthProvider();

export function loginWithGoogleAuth() {
	setPersistence(firebaseAuth, browserLocalPersistence)
		.then(() => signInWithPopup(firebaseAuth, authProvider))
		.then((result) => console.log(result))
		.catch((error) => window.alert('Login failed: ' + String(error)));
}

export function subscribeToAuthUpdates(authState: AuthState) {
	return onAuthStateChanged(firebaseAuth, (user) => {
		console.log('Auth Update', user);
		if (user) {
			authState.user = user;
		}else{
			authState.user = null;
		}
	});
}

const authState = {};
const loggedInUser = {}

export function setAuthState(state: AuthState) {
	setContext(authState, state);
}

export function getAuthState() {
	return getContext(authState) as AuthState;
}

export function setLoggedInUser(user: User){
	setContext(loggedInUser, user)
}

export function getLoggedInUser(){
	return getContext(loggedInUser) as User
}
