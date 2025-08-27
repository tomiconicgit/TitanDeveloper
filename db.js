/*
File: /db.js
*/

const DB_NAME = 'TitanDeveloperDB';
const DB_VERSION = 3;
const STORES = { files: 'files', repositories: 'repositories' };

let dbInstance;

async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORES.files)) {
                const fileStore = db.createObjectStore(STORES.files, { keyPath: 'id', autoIncrement: true });
                fileStore.createIndex('timestamp', 'timestamp', { unique: false });
                fileStore.createIndex('repositoryId', 'repositoryId', { unique: false });
                fileStore.createIndex('parentId', 'parentId', { unique: false });
                fileStore.createIndex('type', 'type', { unique: false });
            }
            if (!db.objectStoreNames.contains(STORES.repositories)) {
                db.createObjectStore(STORES.repositories, { keyPath: 'id', autoIncrement: true });
            }
        };
        request.onsuccess = () => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };
        request.onerror = () => reject(event.target.error);
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
    if (!item) throw new Error('Item not found');
    return new Promise((resolve, reject) => {
        const request = store.put({ ...item, ...updates, timestamp: Date.now() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteItem(storeName, id) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

window.db = { addItem, getAllItems, getItemById, updateItem, deleteItem };
window.db.ready = initDB();