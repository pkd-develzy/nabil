# Perubahan: Alur Cerita, Bunga Berlapis & Gerak Premium

## Struktur
- **Salam dilebur ke Mempelai.** File `Salam.astro` dihapus. Kepala section Mempelai (latar marun) kini berisi kaligrafi salam emas dan kalimat memohon ridha. Label "Pembuka", transliterasi latin, dan "الْعَرُوسَانِ Mempelai" dihapus. Elemen salam tetap ber-`id="salam"`, jadi toggle dashboard `visibility.salam` masih berfungsi.
- **Urutan section:** Hero → Ayat → Mempelai → Acara → Lokasi → RSVP → Ucapan → Hadiah → Penutup. Warna kini bergantian gelap/terang dari atas sampai bawah.
- **Hadiah** pindah ke latar gading (kartu rekening tetap marun). Menu navigasi bawah ikut diurutkan ulang.

## Gerak (`35-motion-premium.css`)
- Satu easing (`--ease-lux`), durasi 0,9–1,1 dtk, jarak geser 12–22px untuk semua reveal.
- Animasi idle tanpa henti dimatikan (judul melayang, kaligrafi berdenyut dengan filter, paragraf "bernapas", kartu/form melayang, tombol mengambang). Teks jadi tajam dan hemat baterai di HP.
- Foto mempelai: zoom lambat sekali saat masuk, tidak lagi berulang terus.
- Kaligrafi salam "tertulis" dari kanan ke kiri (arah baca Arab), sekali saja.
- Sparkles hanya di Hero & Penutup.
- **Auto-scroll** kini berhenti begitu tamu menggeser, menggulir, atau mengetik di form. Sebelumnya scroll manual diblokir sampai tur selesai. Pengguna dengan "kurangi gerakan" tidak diajak tur.

## Bunga berlapis (`36-flora-layers.css`, `02-decor.js` → `FLORA_LAYERS`)
- 3 lapis kedalaman: **back** (spray bertepi lembut, redup, diam, parallax lambat), **mid** (rangkaian utama, tertiup angin), **front** (tangkai kecil, parallax sedikit lebih cepat).
- Kepadatan mengikuti cerita: Hero & **Mempelai** & **Penutup** paling rimbun, Acara/Lokasi/RSVP ringan demi keterbacaan, Ucapan/Hadiah sedang.
- Parallax hanya menggeser gambar bunga (layer kecil), dihitung untuk section yang terlihat saja.
- Ponsel < 360px: lapis belakang dilepas.

## Latar bercerita & benang emas (`37-story.css`)
- Palet tetap. Suasana per section: Ayat (cahaya dari atas), Mempelai (sorot hangat), Acara (gading hangat), Lokasi (garis rute emas), RSVP (kertas surat bergaris), Ucapan (cahaya lilin), Hadiah (linen), Penutup (cahaya emas naik dari bawah).
- Benang emas tipis di puncak setiap section, tergambar saat masuk layar, menyambung garis "Gulir ke bawah" di Hero.

## Merpati terbang (`38-doves.css`, `Penutup.astro`)
- Sepasang merpati emas dari aset klien (1 siluet dipakai 2x, dicerminkan agar saling berhadapan).
- Sayap dipisah dari badan dengan clipPath/mask (sayap depan & belakang berporos di bahu), jadi sayap benar-benar mengepak.
- Gerak: terbang masuk dari tepi kiri & kanan bawah dengan lintasan melengkung sambil mengepak cepat, lalu melayang di atas nama mempelai: dua kepakan, meluncur, berulang; badan naik-turun seirama kepakan. Merpati kanan sedikit tertunda agar tidak terlihat kembar.
- Hanya transform pada SVG kecil; berhenti saat section tidak terlihat; diam (tetap tampil) untuk pengguna "kurangi gerakan".
- Toggle dashboard: `visibility.doves`.

## Perbaikan kecil
- Error `Cannot set properties of null (setting 'scrollTop')` di `<head>` diperbaiki.

## Nama mempelai sebagai identitas (`39-couple-names.css`)
- "Nabil & Izza" dibesarkan menjadi satu lockup. Di HP 390px lebar "Nabil" kini ±50% layar (sebelumnya ±22%).
- Hierarki: Hero paling besar (identitas utama), kartu sampul "Buka Undangan" & Penutup sedikit lebih kecil.
- "&" mengecil dan diapit garis emas tipis agar nama tetap menjadi bintangnya.
- Hero tetap muat satu layar di HP 360–430px dan desktop; jarak bawah nama diberi ruang untuk ekor huruf "zz".
