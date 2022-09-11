import { app } from "./app";
import supertest from "supertest";
import { describe, it, expect } from "vitest";
import prisma from "./db/client";
import { deleteExpiredNotes } from "./tasks/deleteExpiredNotes";
import { EventType } from "./logging/EventLogger";
import { createNote } from "./db/note.dao";
import { EncryptedNote } from "@prisma/client";

// const testNote with base64 ciphertext and hmac
const testNote = {
  ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
  hmac: Buffer.from("sample_hmac").toString("base64"),
};

describe("GET /api/note", () => {
  it("returns a note for valid ID", async () => {
    // Insert a note
    const { id } = await prisma.encryptedNote.create({
      data: testNote,
    });

    // Make get request
    const res = await supertest(app).get(`/api/note/${id}`);

    // Validate returned note
    expectCodeOrThrowResponse(res, 200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("expire_time");
    expect(res.body).toHaveProperty("insert_time");
    expect(res.body).toHaveProperty("ciphertext");
    expect(res.body).toHaveProperty("hmac");
    expect(res.body.id).toEqual(id);
    expect(res.body.ciphertext).toEqual(testNote.ciphertext);
    expect(res.body.hmac).toEqual(testNote.hmac);

    // Is a read event logged?
    const readEvents = await prisma.event.findMany({
      where: { type: EventType.READ, note_id: id },
    });
    expect(readEvents.length).toBe(1);
    expect(readEvents[0].success).toBe(true);
    expect(readEvents[0].size_bytes).toBe(
      res.body.ciphertext.length + res.body.hmac.length
    );
  });

  it("responds 404 for invalid ID", async () => {
    // Make get request
    const res = await supertest(app).get(`/api/note/NaN`);

    // Validate returned note
    expectCodeOrThrowResponse(res, 404);

    // Is a read event logged?
    const readEvents = await prisma.event.findMany({
      where: { type: EventType.READ, note_id: "NaN" },
    });
    expect(readEvents.length).toBe(1);
    expect(readEvents[0].success).toBe(false);
  });

  it("Applies rate limits to endpoint", async () => {
    // Insert a note
    const { id } = await prisma.encryptedNote.create({
      data: testNote,
    });

    // Make get requests
    const requests = [];
    for (let i = 0; i < 51; i++) {
      requests.push(supertest(app).get(`/api/note/${id}`));
    }
    const responses = await Promise.all(requests);
    const responseCodes = responses.map((res) => res.statusCode);

    // at least one response should be 429
    expect(responseCodes).toContain(200);
    expect(responseCodes).toContain(429);

    // No other response codes should be present
    expect(
      responseCodes.map((code) => code === 429 || code === 200)
    ).not.toContain(false);

    // sleep for 100 ms to allow rate limiter to reset
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
});

describe("POST /api/note", () => {
  it("returns a view_url on correct POST body with embeds", async () => {
    const res = await supertest(app)
      .post("/api/note")
      .send({
        ...testNote,
        embeds: [
          {
            embed_id: "sample_embed_id0",
            ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
            hmac: Buffer.from("sample_hmac").toString("base64"),
          },
          {
            embed_id: "sample_embed_id1",
            ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
            hmac: Buffer.from("sample_hmac").toString("base64"),
          },
        ],
      });

    expectCodeOrThrowResponse(res, 200);

    // Returned body has correct fields
    expect(res.body).toHaveProperty("expire_time");
    expect(res.body).toHaveProperty("view_url");

    // View URL is properly formed
    expect(res.body.view_url).toMatch(/^http[s]?:\/\//);

    // A future expiry date is assigned
    expect(new Date(res.body.expire_time).getTime()).toBeGreaterThan(
      new Date().getTime()
    );

    // Is a write event logged?
    const writeEvents = await prisma.event.findMany({
      where: { type: EventType.WRITE, note_id: res.body.id },
    });
    expect(writeEvents.length).toBe(1);
    expect(writeEvents[0].success).toBe(true);
    expect(writeEvents[0].expire_window_days).toBe(30);
    expect(writeEvents[0].size_bytes).toBe(
      testNote.ciphertext.length + testNote.hmac.length
    );
  });

  it("Returns a bad request on invalid POST body", async () => {
    const res = await supertest(app).post("/api/note").send({});
    expectCodeOrThrowResponse(res, 400);
  });

  it("returns a valid view_url on correct POST body", async () => {
    // Make post request
    let res = await supertest(app).post("/api/note").send(testNote);

    // Extract note id from post response
    expectCodeOrThrowResponse(res, 200);
    expect(res.body).toHaveProperty("view_url");
    const match = (res.body.view_url as string).match(/note\/(.+)$/);
    expect(match).not.toBeNull();
    expect(match).toHaveLength(2);
    const note_id = (match as RegExpMatchArray)[1];

    // Make get request
    res = await supertest(app).get(`/api/note/${note_id}`);

    // Validate returned note
    expectCodeOrThrowResponse(res, 200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("expire_time");
    expect(res.body).toHaveProperty("insert_time");
    expect(res.body).toHaveProperty("ciphertext");
    expect(res.body).toHaveProperty("hmac");
    expect(res.body.id).toEqual(note_id);
    expect(res.body.ciphertext).toEqual(testNote.ciphertext);
    expect(res.body.hmac).toEqual(testNote.hmac);
  });

  it("Applies upload limit to endpoint of 8MB", async () => {
    const largeNote = {
      ciphertext: Buffer.from("a".repeat(8 * 1024 * 1024)).toString("base64"),
      hmac: Buffer.from("a".repeat(32)).toString("base64"),
    };
    const res = await supertest(app).post("/api/note").send(largeNote);
    expectCodeOrThrowResponse(res, 413);
  });

  // 2022-08-30: Skip this test because it crashes the database connection for some reason
  it.skip("Applies rate limits to endpoint", async () => {
    // make more requests than the post limit set in .env.test
    const requests = [];
    for (let i = 0; i < 51; i++) {
      requests.push(supertest(app).post("/api/note").send(testNote));
    }
    const responses = await Promise.all(requests);
    const responseCodes = responses.map((res) => res.statusCode);

    // at least one response should be 429
    expect(responseCodes).toContain(200);
    expect(responseCodes).toContain(429);

    // No other response codes should be present
    expect(
      responseCodes.map((code) => code === 429 || code === 200)
    ).not.toContain(false);

    // sleep for 250 ms to allow rate limiter to reset
    await new Promise((resolve) => setTimeout(resolve, 250));
  });
});

describe("Use case: POST note with embeds, then GET embeds", () => {
  it("returns a view_url on correct POST body with embeds", async () => {
    const payload = {
      ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
      hmac: Buffer.from("sample_hmac").toString("base64"),
      user_id: "f06536e7df6857fc",
      embeds: [
        {
          embed_id: "EMBED_ID",
          ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
          hmac: Buffer.from("sample_hmac").toString("base64"),
        },
      ],
    };

    // make post request
    const res = await supertest(app).post("/api/note").send(payload);

    // check response and extract note id
    expectCodeOrThrowResponse(res, 200);
    expect(res.body).toHaveProperty("view_url");
    const match = (res.body.view_url as string).match(/note\/(.+)$/);
    expect(match).not.toBeNull();
    const note_id = (match as RegExpMatchArray)[1];

    // make get request for note
    const noteRes = await supertest(app).get(`/api/note/${note_id}`);
    expectCodeOrThrowResponse(noteRes, 200);
    expect(noteRes.body?.ciphertext).toEqual(payload.ciphertext);
    expect(noteRes.body?.hmac).toEqual(payload.hmac);

    // make get request for embed
    const embedRes = await supertest(app).get(
      `/api/note/${note_id}/embeds/EMBED_ID`
    );
    expectCodeOrThrowResponse(embedRes, 200);
    expect(embedRes.body?.ciphertext).toEqual(payload.embeds[0].ciphertext);
    expect(embedRes.body?.hmac).toEqual(payload.embeds[0].hmac);
  });
});

describe("Clean expired notes", () => {
  it("removes expired notes", async () => {
    // insert a note with expiry date in the past using prisma
    const { id } = await prisma.encryptedNote.create({
      data: {
        ...testNote,
        expire_time: new Date(0),
      },
    });

    // make request for note and check that response is 200
    let res = await supertest(app).get(`/api/note/${id}`);
    expect(res.statusCode).toBe(200);

    // run cleanup
    const nDeleted = await deleteExpiredNotes();
    expect(nDeleted).toBeGreaterThan(0);

    // if the note is added to the expire filter, it returns 410
    res = await supertest(app).get(`/api/note/${id}`);
    expect(res.statusCode).toBe(410);

    // sleep 100ms to allow all events to be logged
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Is a delete event logged?
    const deleteEvents = await prisma.event.findMany({
      where: { type: EventType.PURGE, note_id: id },
    });
    expect(deleteEvents.length).toBe(1);
    expect(deleteEvents[0].success).toBe(true);
    expect(deleteEvents[0].size_bytes).toBe(
      testNote.ciphertext.length + testNote.hmac.length
    );
  });

  it("removes notes with embeds", async () => {
    // insert a note with embeds and with expiry date in the past using prisma
    const note = {
      ...testNote,
      expire_time: new Date(0),
    } as EncryptedNote;
    const embeds = [
      {
        embed_id: "EMBED_ID",
        ciphertext: Buffer.from("sample_ciphertext").toString("base64"),
        hmac: Buffer.from("sample_hmac").toString("base64"),
      },
    ];
    const { id } = await createNote(note, embeds);

    // make request for note and check that response is 200
    const res = await supertest(app).get(`/api/note/${id}`);
    expect(res.statusCode).toBe(200);
    const embedRes = await supertest(app).get(
      `/api/note/${id}/embeds/EMBED_ID`
    );
    expect(embedRes.statusCode).toBe(200);

    // run cleanup
    const nDeleted = await deleteExpiredNotes();
    expect(nDeleted).toBeGreaterThan(0);

    // if the note is added to the expire filter, it returns 410
    const res2 = await supertest(app).get(`/api/note/${id}`);
    expect(res2.statusCode).toBe(410);

    // check that the embed is not found
    const embedRes2 = await supertest(app).get(
      `/api/note/${id}/embeds/EMBED_ID`
    );
    expect(embedRes2.statusCode).toBe(404);
  });
});

function expectCodeOrThrowResponse(res: supertest.Response, expected: number) {
  try {
    expect(res.status).toBe(expected);
  } catch (e) {
    (e as Error).message = `
      Unexpected status ${res.status} (expected ${expected}): 
      
      Response body: ${res.text}`;
    throw e;
  }
}
