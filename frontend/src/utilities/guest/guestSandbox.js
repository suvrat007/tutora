/**
 * Makes a guest's faked writes stick.
 *
 * Without this, a guest adds a student, the UI refetches, and the server's
 * pristine list erases what they just did - which reads as a broken app rather
 * than a demo. So every faked write is journalled here, and the journal is
 * replayed over subsequent GET responses: created rows appended, updated rows
 * merged by _id, deleted ids filtered out.
 *
 * Scope is deliberately limited to the plain list endpoints (see PROJECTIONS).
 * Server-computed aggregates - attendance percentages, fee dashboard totals - * are not reproduced here; doing so would mean reimplementing MongoDB
 * aggregation pipelines in the browser. A guest's edits therefore show up in the
 * lists but not in those summary figures, which the demo banner says plainly.
 *
 * The journal lives in sessionStorage, never localStorage: a refresh keeps the
 * guest's changes, a new tab starts clean, and nothing can ever leak into a real
 * account's session on the same device.
 */

const STORAGE_PREFIX = "tutora_guest_journal:";
const MAX_ENTRIES = 400;

let journal = [];
let seq = 0;
let storageKey = null;

// Whether the guest has been told their changes aren't saved. Session state, so
// it lives and dies with the journal.
let writeNoticeShown = false;

/** True exactly once per session, for the first change the guest makes. */
export const shouldAnnounceWrite = () => {
    if (writeNoticeShown) return false;
    writeNoticeShown = true;
    return true;
};

/* ------------------------------------------------------------- persistence */

const persist = () => {
    if (!storageKey) return;
    try {
        sessionStorage.setItem(storageKey, JSON.stringify({ seq, journal }));
    } catch {
        /* quota or private mode - the demo still works, it just won't survive a reload */
    }
};

export const loadJournal = (sessionId) => {
    storageKey = sessionId ? STORAGE_PREFIX + sessionId : null;
    journal = [];
    seq = 0;
    if (!storageKey) return;
    try {
        const raw = sessionStorage.getItem(storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        journal = Array.isArray(parsed.journal) ? parsed.journal : [];
        seq = Number(parsed.seq) || journal.length;
    } catch {
        journal = [];
    }
};

export const clearJournal = () => {
    if (storageKey) {
        try {
            sessionStorage.removeItem(storageKey);
        } catch {
            /* nothing to clean up */
        }
    }
    journal = [];
    seq = 0;
    storageKey = null;
    writeNoticeShown = false;
};

const push = (entry) => {
    if (journal.length >= MAX_ENTRIES) journal.shift();
    seq += 1;
    journal.push({ ...entry, seq });
    persist();
};

/* ------------------------------------------------------------------ helpers */

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

/** 24 hex chars, so anything treating _id as an ObjectId string still works. */
export const mintId = () => {
    const bytes = new Uint8Array(12);
    (globalThis.crypto ?? {}).getRandomValues?.(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

/** Two levels deep: the forms send whole nested objects like contact_info. */
const merge = (base, patch) => {
    const out = { ...base };
    Object.entries(patch ?? {}).forEach(([key, value]) => {
        const isPlainObject = value && typeof value === "object" && !Array.isArray(value);
        out[key] = isPlainObject ? { ...(base?.[key] ?? {}), ...value } : value;
    });
    return out;
};

const normaliseUrl = (url = "") => url.replace(/^\/+/, "").split("?")[0];

/* -------------------------------------------------------------------- rules */

const OID = "([a-f0-9]{24})";

/**
 * One entry per mutating endpoint: what the fake response should look like, and
 * what to remember so the change survives the next refetch.
 */
const RULES = [
    {
        m: "post",
        p: new RegExp("^student/add-new-student$"),
        run: (body) => {
            const doc = { ...body, _id: body._id ?? mintId() };
            return { entry: { kind: "create", coll: "student", doc }, data: doc };
        },
    },
    {
        m: "patch",
        p: new RegExp(`^student/update-student/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "update", coll: "student", id, patch: body }, data: { ...body, _id: id } }),
    },
    {
        m: "delete",
        p: new RegExp(`^student/delete-student/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "delete", coll: "student", id }, data: { _id: id } }),
    },
    {
        m: "delete",
        p: new RegExp(`^student/delete-all-by-batch/${OID}$`),
        run: (body, [, batchId]) => ({ entry: { kind: "deleteInBatch", coll: "student", batchId }, data: {} }),
    },
    {
        m: "post",
        p: new RegExp(`^student/transfer-batch/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "update", coll: "student", id, patch: body }, data: { ...body, _id: id } }),
    },

    {
        m: "post",
        p: new RegExp("^batch/add-new-batch$"),
        run: (body) => {
            const doc = { ...body, _id: body._id ?? mintId() };
            return { entry: { kind: "create", coll: "batch", doc }, data: doc };
        },
    },
    {
        m: "patch",
        p: new RegExp(`^batch/update-batch/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "update", coll: "batch", id, patch: body }, data: { ...body, _id: id } }),
    },
    {
        m: "delete",
        p: new RegExp(`^batch/delete-batch/${OID}$`),
        run: (body, [, id]) => ({
            entry: {
                kind: "delete",
                coll: "batch",
                id,
                cascade: body?.shouldDeleteStudents ? "deleteStudents" : "detachStudents",
            },
            data: { _id: id },
        }),
    },

    {
        m: "post",
        p: new RegExp("^teacher/add$"),
        run: (body) => {
            const doc = { ...body, _id: body._id ?? mintId() };
            return { entry: { kind: "create", coll: "teacher", doc }, data: doc };
        },
    },
    {
        m: "put",
        p: new RegExp(`^teacher/update/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "update", coll: "teacher", id, patch: body }, data: { ...body, _id: id } }),
    },
    {
        m: "delete",
        p: new RegExp(`^teacher/delete/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "delete", coll: "teacher", id }, data: { _id: id } }),
    },

    {
        m: "post",
        p: new RegExp("^reminder/add-reminder$"),
        run: (body) => {
            const doc = { ...body, _id: body._id ?? mintId() };
            return { entry: { kind: "create", coll: "reminder", doc }, data: { message: "Reminder added", reminder: doc } };
        },
    },
    {
        m: "delete",
        p: new RegExp(`^reminder/delete-reminder/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "delete", coll: "reminder", id }, data: { message: "Reminder deleted" } }),
    },

    {
        m: "post",
        p: new RegExp("^test/createTest$"),
        run: (body) => {
            const doc = { ...body, _id: body._id ?? mintId(), studentResults: body.studentResults ?? [] };
            return { entry: { kind: "create", coll: "test", doc }, data: doc };
        },
    },
    {
        m: "put",
        p: new RegExp(`^test/updateTest/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "update", coll: "test", id, patch: body }, data: { ...body, _id: id } }),
    },
    {
        m: "delete",
        p: new RegExp(`^test/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "delete", coll: "test", id }, data: { _id: id } }),
    },

    {
        m: "post",
        p: new RegExp(`^register/pending/${OID}/approve$`),
        run: (body, [, id]) => ({ entry: { kind: "delete", coll: "pending", id }, data: { message: "Approved" } }),
    },
    {
        m: "delete",
        p: new RegExp(`^register/pending/${OID}$`),
        run: (body, [, id]) => ({ entry: { kind: "delete", coll: "pending", id }, data: { message: "Removed" } }),
    },
];

/**
 * Records a faked write and returns the body the caller should see.
 * Unmodelled writes still succeed - they simply won't survive a refetch.
 */
export const fulfil = (method, url, body) => {
    const path = normaliseUrl(url);
    const rule = RULES.find((r) => r.m === method && r.p.test(path));

    if (!rule) {
        if (import.meta.env?.DEV) {
            console.warn(`[guest] unmodelled write: ${method.toUpperCase()} ${path}`);
        }
        return { message: "Saved in demo mode", __demo: true };
    }

    const { entry, data } = rule.run(body ?? {}, path.match(rule.p));
    push(entry);
    return { ...data, __demo: true };
};

/* -------------------------------------------------------------- projections */

const entriesFor = (coll) => journal.filter((e) => e.coll === coll).sort((a, b) => a.seq - b.seq);

/**
 * Folds create/update/delete over a plain array of rows.
 *
 * `belongsHere` keeps created rows out of responses they don't belong to: the
 * tests list is fetched one batch at a time and merged per batch, so appending a
 * new test to every batch's response would file it under the wrong one.
 */
const applyToArray = (rows, coll, belongsHere = () => true) => {
    let out = Array.isArray(rows) ? [...rows] : [];

    entriesFor(coll).forEach((e) => {
        if (e.kind === "create") {
            if (!belongsHere(e.doc)) return;
            out = [...out.filter((r) => !sameId(r._id, e.doc._id)), e.doc];
        } else if (e.kind === "update") {
            out = out.map((r) => (sameId(r._id, e.id) ? merge(r, e.patch) : r));
        } else if (e.kind === "delete") {
            out = out.filter((r) => !sameId(r._id, e.id));
        }
    });

    return out;
};

/** `{ data, pagination }` - keep the total honest so paging text isn't wrong. */
const applyPaged = (payload, coll, belongsHere) => {
    const data = applyToArray(payload?.data, coll, belongsHere);
    const delta = data.length - (payload?.data?.length ?? 0);
    return {
        ...payload,
        data,
        ...(payload?.pagination
            ? { pagination: { ...payload.pagination, total: Math.max(0, (payload.pagination.total ?? 0) + delta) } }
            : {}),
    };
};

/**
 * The grouped student list is the intricate one: rows live inside per-batch
 * groups, so creates have to land in the right group and a batch deletion has to
 * take its students with it (or hand them to "No Batch").
 */
const applyGroupedStudents = (groups) => {
    let out = (Array.isArray(groups) ? groups : []).map((g) => ({ ...g, students: [...(g.students ?? [])] }));

    const createdBatches = entriesFor("batch").filter((e) => e.kind === "create");

    const groupFor = (batchId) => {
        if (batchId == null) {
            let noBatch = out.find((g) => g.batchId == null);
            if (!noBatch) {
                noBatch = { batchId: null, batchName: "No Batch", forStandard: "N/A", students: [] };
                out.push(noBatch);
            }
            return noBatch;
        }

        let group = out.find((g) => sameId(g.batchId, batchId));
        if (group) return group;

        // A batch the guest created in this session has no group yet.
        const created = createdBatches.find((e) => sameId(e.doc._id, batchId));
        group = {
            batchId,
            batchName: created?.doc?.name ?? "New Batch",
            forStandard: created?.doc?.forStandard ?? "N/A",
            students: [],
        };
        out.push(group);
        return group;
    };

    const removeStudent = (id) => {
        let found = null;
        out.forEach((g) => {
            const hit = g.students.find((s) => sameId(s._id, id));
            if (hit) {
                found = hit;
                g.students = g.students.filter((s) => !sameId(s._id, id));
            }
        });
        return found;
    };

    journal
        .filter((e) => e.coll === "student" || (e.coll === "batch" && e.kind === "delete"))
        .sort((a, b) => a.seq - b.seq)
        .forEach((e) => {
            if (e.coll === "batch") {
                const group = out.find((g) => sameId(g.batchId, e.id));
                if (!group) return;
                if (e.cascade === "detachStudents" && group.students.length) {
                    groupFor(null).students.push(...group.students.map((s) => ({ ...s, batchId: null })));
                }
                out = out.filter((g) => !sameId(g.batchId, e.id));
                return;
            }

            if (e.kind === "create") {
                groupFor(e.doc.batchId ?? null).students.push(e.doc);
            } else if (e.kind === "update") {
                const existing = removeStudent(e.id);
                const updated = merge(existing ?? { _id: e.id }, e.patch);
                groupFor(updated.batchId ?? null).students.push(updated);
            } else if (e.kind === "delete") {
                removeStudent(e.id);
            } else if (e.kind === "deleteInBatch") {
                const group = out.find((g) => sameId(g.batchId, e.batchId));
                if (group) group.students = [];
            }
        });

    // Drop groups the guest emptied, but keep ones the server sent empty.
    return out.filter((g) => g.students.length > 0 || g.batchId == null);
};

const PROJECTIONS = [
    { p: /^batch\/get-all-batches/, apply: (d) => applyPaged(d, "batch") },
    { p: /^student\/get-students-grouped-by-batch/, apply: (d) => applyGroupedStudents(d) },
    { p: /^teacher\/all/, apply: (d) => applyPaged(d, "teacher") },
    {
        p: /^test\/getAllTests/,
        apply: (d, params) => {
            const batchId = params.get("batchId");
            return applyPaged(d, "test", (doc) => !batchId || sameId(doc.batchId, batchId));
        },
    },
    { p: /^register\/pending/, apply: (d) => ({ ...d, data: applyToArray(d?.data, "pending") }) },
    {
        p: /^reminder\/get-reminder/,
        apply: (d) => ({ ...d, reminder: applyToArray(d?.reminder, "reminder") }),
    },
];

/** Replays the journal over a GET response. Unknown URLs pass through as-is. */
export const decorate = (url = "", data) => {
    if (!journal.length) return data;
    const path = normaliseUrl(url);
    const projection = PROJECTIONS.find((p) => p.p.test(path));
    if (!projection) return data;
    try {
        const params = new URLSearchParams(url.includes("?") ? url.slice(url.indexOf("?") + 1) : "");
        return projection.apply(data, params);
    } catch (err) {
        // A broken overlay must never break the demo - fall back to the truth.
        console.warn("[guest] could not apply demo changes to", path, err);
        return data;
    }
};

export const journalSize = () => journal.length;
