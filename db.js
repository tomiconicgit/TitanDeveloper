/*
File: /db.js
*/

// A simple IndexedDB wrapper for persistent storage.

const DB_NAME = 'TitanDeveloperDB';
const DB_VERSION = 1;
const STORES = {
    files: 'files',
    repositories: 'repositories'
};

let dbInstance;

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORES.files)) {
                const fileStore = db.createObjectStore(STORES.files, { keyPath: 'id', autoIncrement: true });
                fileStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
            if (!db.objectStoreNames.contains(STORES.repositories)) {
                db.createObjectStore(STORES.repositories, { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
    });
}

async function addItem(storeName, item) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.add({ ...item, timestamp: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getItemById(storeName, id) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllItems(storeName) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function updateItem(storeName, id, updates) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const item = await getItemById(storeName, id);
    if (!item) {
        throw new Error('Item not found');
    }
    const updatedItem = { ...item, ...updates, timestamp: Date.now() };
    return new Promise((resolve, reject) => {
        const request = store.put(updatedItem);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

window.db = {
    addItem,
    getAllItems,
    getItemById,
    updateItem,
};

window.db.ready = initDB();
