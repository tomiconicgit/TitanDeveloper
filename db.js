/*
File: /db.js
*/

// A simple IndexedDB wrapper for persistent storage.

const DB_NAME = 'TitanDeveloperDB';
const DB_VERSION = 3; // Incremented for new index
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
            const oldVersion = event.oldVersion;
            let fileStore;
            if (oldVersion < 1 || !db.objectStoreNames.contains(STORES.files)) {
                fileStore = db.createObjectStore(STORES.files, { keyPath: 'id', autoIncrement: true });
                fileStore.createIndex('timestamp', 'timestamp', { unique: false });
                fileStore.createIndex('repositoryId', 'repositoryId', { unique: false });
                fileStore.createIndex('parentId', 'parentId', { unique: false });
            } else {
                const tx = event.target.transaction;
                fileStore = tx.objectStore(STORES.files);
            }
            if (oldVersion < 3) {
                fileStore.createIndex('type', 'type', { unique: false });
            }
            if (oldVersion < 1 || !db.objectStoreNames.contains(STORES.repositories)) {
                const repoStore = db.createObjectStore(STORES.repositories, { keyPath: 'id', autoIncrement: true });
                repoStore.createIndex('timestamp', 'timestamp', { unique: false });
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

async function getItemsByIndex(storeName, indexName, value) {
    if (!dbInstance) await initDB();
    const tx = dbInstance.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    return new Promise((resolve, reject) => {
        const request = index.getAll(IDBKeyRange.only(value));
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

window.db = {
    addItem,
    getAllItems,
    getItemById,
    getItemsByIndex,
    updateItem,
    deleteItem,
};

window.db.ready = initDB();