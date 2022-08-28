import { describe, it, expect } from "vitest";
import {
  addDays,
  arrayBufferToBase64,
  base64ToArrayBuffer,
  getConnectingIp,
} from "./util";

describe("addDays()", () => {
  it("Should add n days to the input date", () => {
    const date = new Date("2022-01-01");
    const expectedDate = new Date("2022-01-31");
    expect(addDays(date, 30)).toEqual(expectedDate);
  });
});

describe("converting to/from base64", () => {
  it("Should convert a base64 string to an array buffer", () => {
    const base64 = "EjRWeJA=";
    const expectedBuffer = new Uint8Array([18, 52, 86, 120, 144]);
    expect(new Uint8Array(base64ToArrayBuffer(base64))).toStrictEqual(
      expectedBuffer
    );
  });

  it("Should convert an array buffer to a base64 string", () => {
    const buffer = new Uint8Array([18, 52, 86, 120, 144]);
    const expectedBase64 = "EjRWeJA=";
    expect(arrayBufferToBase64(buffer)).toEqual(expectedBase64);
  });
});
