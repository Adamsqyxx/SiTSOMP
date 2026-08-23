// Data statistik kependudukan Kelurahan Tiro Sompe — sumber resmi:
// BPS Kota Parepare, "Kecamatan Bacukiki Barat Dalam Angka 2020"
// (https://pareparekota.bps.go.id). Angka proyeksi penduduk 2019;
// agama dari Dinas Kependudukan dan Pencatatan Sipil Kota Parepare.
//
// Statik by design: data BPS terbit tahunan; update manual di file ini
// saat publikasi baru keluar.

export interface PendudukStatistik {
  jumlah_penduduk: number;
  laki_laki: number;
  perempuan: number;
  rasio_jenis_kelamin: number;
  laju_pertumbuhan_persen: string;
  distribusi_persen_kcamatan: number;
  kepadatan_per_km2: number;
  luas_km2: number;
  tinggi_mdpl: number;
  jarak_ibukota_kecamatan_km: number;
  wilayah_pantai: boolean;
  rt: number;
  rw: number;
  proyeksi_tahunan: { tahun: number; jumlah: number }[];
  agama: { islam: number; protestan: number; katolik: number; hindu: number; budha: number; lainnya: number };
}

export const TIRO_SOMPE_STATISTIK: PendudukStatistik = {
  jumlah_penduduk: 6980,
  laki_laki: 3525,
  perempuan: 3455,
  rasio_jenis_kelamin: 102,
  laju_pertumbuhan_persen: "0,59% per tahun (2018–2019)",
  distribusi_persen_kcamatan: 15.67,
  kepadatan_per_km2: 18368,
  luas_km2: 0.38,
  tinggi_mdpl: 32.73,
  jarak_ibukota_kecamatan_km: 2.4,
  wilayah_pantai: true,
  rt: 21,
  rw: 5,
  proyeksi_tahunan: [
    { tahun: 2015, jumlah: 6766 },
    { tahun: 2016, jumlah: 6830 },
    { tahun: 2017, jumlah: 6888 },
    { tahun: 2018, jumlah: 6939 },
    { tahun: 2019, jumlah: 6980 },
  ],
  agama: { islam: 7060, protestan: 44, katolik: 28, hindu: 0, budha: 14, lainnya: 3 },
};

export const KECAMATAN_BACUKIKI_BARAT = {
  jumlah_penduduk: 44541,
  laki_laki: 21954,
  perempuan: 22587,
  kelurahan_count: 6,
  luas_km2: 13.0,
};

export const SUMBER_DATA = {
  publikasi: "Kecamatan Bacukiki Barat Dalam Angka 2020",
  penerbit: "Badan Pusat Statistik Kota Parepare",
  url: "https://pareparekota.bps.go.id",
  catatan:
    "Angka merupakan hasil Proyeksi Penduduk BPS tahun 2019. Data agama dari Dinas Kependudukan dan Pencatatan Sipil Kota Parepare.",
};
