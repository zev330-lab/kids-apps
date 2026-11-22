const DB_NAME = "playtime-scribbles";
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

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function galleryRequest<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>) {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const request = run(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(request.result);
      tx.onabort = () => reject(tx.error ?? request.error);
    });
  } finally {
    db.close();
  }
}

export async function addFriend({ blob, ...friend }: FriendRecord) {
  // Read the bytes before opening the transaction so it stays active for the put.
  const row = { ...friend, bytes: await blob.arrayBuffer(), mimeType: blob.type };
  await galleryRequest("readwrite", (store) => store.put(row));
}

export async function listFriends(): Promise<FriendRecord[]> {
  const rows: StoredFriend[] = await galleryRequest("readonly", (store) => store.getAll());
  return rows.sort((a, b) => b.created - a.created).slice(0, 30).map((row) => {
    if ("blob" in row) return row;
    const { bytes, mimeType, ...friend } = row;
    return { ...friend, blob: new Blob([bytes], { type: mimeType }) };
  });
}

export async function deleteFriend(id: string) {
  await galleryRequest("readwrite", (store) => store.delete(id));
}
