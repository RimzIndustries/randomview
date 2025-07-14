
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, query, where, deleteDoc } from 'firebase/firestore';

const URLS_COLLECTION = 'urls';

// Get all URLs from the 'urls' collection
export async function getUrls(): Promise<string[]> {
    const urlsCollection = collection(db, URLS_COLLECTION);
    const urlSnapshot = await getDocs(urlsCollection);
    const urlList = urlSnapshot.docs.map(doc => doc.data().url as string);
    return urlList;
}

// Add a new URL to the 'urls' collection
export async function addUrl(url: string): Promise<void> {
    const urlsCollection = collection(db, URLS_COLLECTION);
    await addDoc(urlsCollection, { url });
}

// Delete a URL from the 'urls' collection
export async function deleteUrl(urlToDelete: string): Promise<void> {
    const urlsCollection = collection(db, URLS_COLLECTION);
    const q = query(urlsCollection, where("url", "==", urlToDelete));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`URL to delete not found: ${urlToDelete}`);
        return;
    }

    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, URLS_COLLECTION, document.id)));
    });
    
    await Promise.all(deletePromises);
}
