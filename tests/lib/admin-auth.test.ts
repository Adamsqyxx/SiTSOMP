import { describe, expect, it } from "vitest";
import { ADMIN_ROLES, isAdminRole } from "@/lib/admin-auth";

describe("isAdminRole()", () => {
  it("mengenali semua role admin yang valid", () => {
    for (const role of ["super_admin", "lurah", "sekretaris", "petugas"]) {
      expect(isAdminRole(role)).toBe(true);
    }
  });

  it("menolak role warga", () => {
    expect(isAdminRole("warga")).toBe(false);
  });

  it("menolak role tak dikenal", () => {
    expect(isAdminRole("hackerman")).toBe(false);
  });

  it("menolak null / undefined / string kosong", () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
    expect(isAdminRole("")).toBe(false);
  });
});

describe("ADMIN_ROLES", () => {
  it("berisi tepat 4 role dan tidak menyertakan warga", () => {
    expect(ADMIN_ROLES).toHaveLength(4);
    expect(ADMIN_ROLES).not.toContain("warga");
  });
});
