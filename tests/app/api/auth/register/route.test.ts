import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { POST } from "@/app/api/auth/register/route";

// Mock modul Prisma supaya test tidak menyentuh database sungguhan.
// vi.mock di-hoist oleh vitest, jadi fn-nya harus dibuat lewat vi.hoisted().
const { findFirst, create } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: (a: unknown) => findFirst(a),
      create: (a: unknown) => create(a),
    },
  },
}));

function req(body: unknown) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const payloadValid = {
  email: "0000000000000088@sitsomp.id",
  password: "SandiBagus-88",
  nik: "0000000000000088",
  nama_lengkap: "Warga Uji",
};

beforeEach(() => {
  findFirst.mockReset();
  create.mockReset();
});

describe("POST /api/auth/register — validasi", () => {
  it("400 kalau field wajib kosong", async () => {
    const res = await POST(req({ password: "12345678" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/wajib diisi/);
  });

  it("400 kalau password kurang dari 8 karakter", async () => {
    const res = await POST(req({ ...payloadValid, password: "pendek" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/minimal 8 karakter/);
  });

  it("400 kalau NIK bukan 16 digit angka", async () => {
    const res = await POST(req({ ...payloadValid, nik: "12345" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/16 digit/);
  });

  it("400 kalau nomor_hp formatnya tidak valid", async () => {
    const res = await POST(req({ ...payloadValid, nomor_hp: "bukan-nomor" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/telepon/);
  });
});

describe("POST /api/auth/register — duplikat & sukses", () => {
  it("409 + pesan NIK kalau NIK sudah terdaftar", async () => {
    findFirst.mockResolvedValue({ nik: payloadValid.nik, email: "lain@sitsomp.id" });
    const res = await POST(req(payloadValid));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/NIK ini sudah terdaftar/);
  });

  it("409 + pesan Email kalau email sudah terdaftar", async () => {
    findFirst.mockResolvedValue({ nik: "9999999999999999", email: payloadValid.email });
    const res = await POST(req(payloadValid));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/Email ini sudah terdaftar/);
  });

  it("201 sukses: hash bcrypt disimpan, role warga, aktif", async () => {
    findFirst.mockResolvedValue(null);
    create.mockImplementation(({ data }: { data: Record<string, string | boolean> }) =>
      Promise.resolve({ id: "uji-1", email: data.email })
    );

    const res = await POST(req(payloadValid));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.message).toMatch(/berhasil dibuat/);

    // create dipanggil sekali dengan data yang benar
    expect(create).toHaveBeenCalledTimes(1);
    const arg = create.mock.calls[0][0] as { data: { password_hash: string; role: string; is_active: boolean; nik: string; nama_lengkap: string } };
    expect(arg.data.nik).toBe(payloadValid.nik);
    expect(arg.data.nama_lengkap).toBe("Warga Uji");
    expect(arg.data.role).toBe("warga");
    expect(arg.data.is_active).toBe(true);

    // password benar-benar ter-hash dan bisa diverifikasi
    expect(arg.data.password_hash).not.toBe(payloadValid.password);
    const cocok = await bcrypt.compare(payloadValid.password, arg.data.password_hash);
    expect(cocok).toBe(true);
  });
});
