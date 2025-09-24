
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, query, where, deleteDoc, collectionGroup } from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const URLS_SUBCOLLECTION = 'urls';

// Get all URLs for a specific user
export async function getUrls(userId: string): Promise<string[]> {
    const urlsCollectionRef = collection(db, USERS_COLLECTION, userId, URLS_SUBCOLLECTION);
    const urlSnapshot = await getDocs(urlsCollectionRef);
    const urlList = urlSnapshot.docs.map(doc => doc.data().url as string);
    return urlList;
}

// Get all URLs from all users
export async function getAllUrls(): Promise<string[]> {
    const urlsQuery = query(collectionGroup(db, URLS_SUBCOLLECTION));
    const querySnapshot = await getDocs(urlsQuery);
    const urlList = querySnapshot.docs.map(doc => doc.data().url as string);
    return urlList;
}

// Add a new URL to a user's list
export async function addUrl(userId: string, url: string): Promise<void> {
    const urlsCollectionRef = collection(db, USERS_COLLECTION, userId, URLS_SUBCOLLECTION);
    await addDoc(urlsCollectionRef, { url });
}

// Delete a URL from a user's list
export async function deleteUrl(userId: string, urlToDelete: string): Promise<void> {
    const urlsCollectionRef = collection(db, USERS_COLLECTION, userId, URLS_SUBCOLLECTION);
    const q = query(urlsCollectionRef, where("url", "==", urlToDelete));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`URL to delete not found: ${urlToDelete}`);
        return;
    }

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((document) => {
        const docRef = doc(db, USERS_COLLECTION, userId, URLS_SUBCOLLECTION, document.id);
        deletePromises.push(deleteDoc(docRef));
    });
    
    await Promise.all(deletePromises);
}
