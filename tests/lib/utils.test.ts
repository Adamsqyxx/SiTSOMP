import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("menggabungkan beberapa class", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("menangani nilai falsy (kondisional)", () => {
    const aktif = false;
    expect(cn("base", aktif && "aktif", "lain")).toBe("base lain");
  });

  it("class berikutnya menimpa class tailwind yang konflik", () => {
    // twMerge: padding terakhir yang menang, py tetap dipertahankan
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("tidak menggabungkan string kosong jadi spasi tak perlu", () => {
    expect(cn("", "", "")).toBe("");
  });
});
