const DB_NAME = "playtime-scribbles";
const BYTE_DB = "playtime-scribbles-bytes";
const STORE = "friends";

export type FriendRecord = {
  id: string;
  name: string;
  created: number;
  blob: Blob;
};

type StoredFriend = FriendRecord | (Omit<FriendRecord, "blob"> & {
  bytes: ArrayBuffer;
  mimeType: string;
});

function openDb(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transact<T>(db: IDBDatabase, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = run(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result);
    tx.onabort = () => reject(tx.error ?? request.error);
  });
}

async function galleryRequest<T>(database: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb(database);
  try {
    return await transact(db, mode, run);
  } finally {
    db.close();
  }
}

export async function addFriend({ blob, ...friend }: FriendRecord) {
  const db = await openDb(DB_NAME);
  try {
    await transact(db, "readwrite", (store) => store.put({ ...friend, blob }));
    return;
  } catch {
    // Some engines reject Blob cloning at put or transaction commit.
    // Keep the byte-only retry out of reach of v1 readers.
  } finally {
    db.close();
  }
  const row = { ...friend, bytes: await blob.arrayBuffer(), mimeType: blob.type };
  await galleryRequest(BYTE_DB, "readwrite", (store) => store.put(row));
}

export async function listFriends(): Promise<FriendRecord[]> {
  const groups = await Promise.all([DB_NAME, BYTE_DB].map((db) =>
    galleryRequest<StoredFriend[]>(db, "readonly", (store) => store.getAll()),
  ));
  const rows = groups.flat();
  return rows.sort((a, b) => b.created - a.created).slice(0, 30).map((row) => {
    if ("blob" in row) return row;
    const { bytes, mimeType, ...friend } = row;
    return { ...friend, blob: new Blob([bytes], { type: mimeType }) };
  });
}

export async function deleteFriend(id: string) {
  await Promise.all([DB_NAME, BYTE_DB].map((db) => galleryRequest(db, "readwrite", (store) => store.delete(id))));
}
