(function() {
    const db = window.firebaseDB || null;

    const COLLECTIONS = {
        reports: 'wasteReports',
        schedules: 'collectionSchedules'
    };

    async function getAll(collection) {
        if (!db) {
            return JSON.parse(localStorage.getItem(collection) || '[]');
        }
        const snapshot = await db.collection(collection).get();
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    async function setAll(collection, items) {
        if (!db) {
            localStorage.setItem(collection, JSON.stringify(items));
            return;
        }
        // Simple sync approach: replace all docs with the incoming snapshot
        const batch = db.batch();
        const colRef = db.collection(collection);
        const existing = await colRef.get();
        existing.forEach(doc => batch.delete(doc.ref));
        items.forEach(item => {
            const { id, ...rest } = item;
            const docRef = id ? colRef.doc(id) : colRef.doc();
            batch.set(docRef, rest);
        });
        await batch.commit();
    }

    async function upsert(collection, item) {
        if (!db) {
            const items = JSON.parse(localStorage.getItem(collection) || '[]');
            const idx = items.findIndex(x => x.id === item.id);
            if (idx >= 0) items[idx] = item; else items.push(item);
            localStorage.setItem(collection, JSON.stringify(items));
            return item.id;
        }
        const colRef = db.collection(collection);
        const { id, ...rest } = item;
        if (id) {
            await colRef.doc(id).set(rest, { merge: true });
            return id;
        }
        const docRef = await colRef.add(rest);
        return docRef.id;
    }

    async function remove(collection, id) {
        if (!db) {
            const items = JSON.parse(localStorage.getItem(collection) || '[]');
            const updated = items.filter(x => x.id !== id);
            localStorage.setItem(collection, JSON.stringify(updated));
            return;
        }
        await db.collection(collection).doc(id).delete();
    }

    window.DB = {
        getAllReports: () => getAll(COLLECTIONS.reports),
        getAllSchedules: () => getAll(COLLECTIONS.schedules),
        setAllReports: items => setAll(COLLECTIONS.reports, items),
        setAllSchedules: items => setAll(COLLECTIONS.schedules, items),
        upsertReport: item => upsert(COLLECTIONS.reports, item),
        upsertSchedule: item => upsert(COLLECTIONS.schedules, item),
        removeSchedule: id => remove(COLLECTIONS.schedules, id)
    };
})();


