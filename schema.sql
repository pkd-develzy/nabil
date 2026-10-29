-- ==========================================================
-- SUPABASE SCHEMA RESMI MULTI-TENANT UNDANGAN DIGITAL
-- Salin dan jalankan skrip ini di SQL Editor dashboard Supabase Anda.
-- ==========================================================

-- 1. Buat / Perbarui Tabel Konfigurasi Undangan (wedding_config)
CREATE TABLE IF NOT EXISTS public.wedding_config (
    id TEXT PRIMARY KEY DEFAULT 'nabil-izza', -- ID adalah Slug Undangan (misal: 'nabil-izza', 'ahmad-fatimah')
    config_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Seluruh konfigurasi dinamis JSON dari CMS
    admin_pin TEXT DEFAULT '123456', -- PIN Master default untuk login admin CMS
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Pastikan kolom config_data ada jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.wedding_config ADD COLUMN IF NOT EXISTS config_data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.wedding_config ADD COLUMN IF NOT EXISTS admin_pin TEXT DEFAULT '123456';
ALTER TABLE public.wedding_config ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. Buat / Perbarui Tabel Amplop Doa & Ucapan Tamu (wedding_wishes)
CREATE TABLE IF NOT EXISTS public.wedding_wishes (
    id BIGSERIAL PRIMARY KEY,
    wedding_slug TEXT NOT NULL DEFAULT 'nabil-izza', -- Filter multi-tenant berdasarkan slug undangan
    name TEXT NOT NULL,
    presence TEXT NOT NULL DEFAULT 'Hadir',
    pax TEXT DEFAULT '1 Orang',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Kompatibilitas mundur dengan versi skema sebelumnya:
    nama TEXT,
    hadir TEXT,
    pesan TEXT,
    tanggal TEXT
);

-- Pastikan kolom-kolom standar ada jika tabel sudah pernah dibuat sebelumnya
ALTER TABLE public.wedding_wishes ADD COLUMN IF NOT EXISTS wedding_slug TEXT NOT NULL DEFAULT 'nabil-izza';
ALTER TABLE public.wedding_wishes ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.wedding_wishes ADD COLUMN IF NOT EXISTS presence TEXT DEFAULT 'Hadir';
ALTER TABLE public.wedding_wishes ADD COLUMN IF NOT EXISTS pax TEXT DEFAULT '1 Orang';
ALTER TABLE public.wedding_wishes ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.wedding_wishes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Buat index pencarian ucapan per slug agar cepat
CREATE INDEX IF NOT EXISTS idx_wishes_slug ON public.wedding_wishes (wedding_slug, created_at DESC);

-- Masukkan ucapan default awal untuk nabil-izza jika belum ada
-- (ON CONFLICT DO NOTHING tidak berpengaruh tanpa unique constraint, sehingga
--  setiap kali skrip dijalankan ulang ucapan contoh jadi dobel. Pakai NOT EXISTS.)
INSERT INTO public.wedding_wishes (wedding_slug, name, presence, pax, message, created_at)
SELECT v.wedding_slug, v.name, v.presence, v.pax, v.message, v.created_at FROM (VALUES
('nabil-izza', 'Keluarga Besar H. Syatori', 'Hadir', '2 Orang', 'Barakallahu lakuma wa baraka ''alaikuma wa jama''a bainakuma fii khair. Selamat untuk Ananda Nabil dan Izza, semoga senantiasa dianugerahi keluarga yang sakinah, mawaddah, warahmah.', timezone('utc'::text, now())),
('nabil-izza', 'Fathur & Rina', 'Hadir', '2 Orang', 'Selamat menempuh hidup baru sahabatku Nabil & Izza! Masya Allah akhirnya sampai di pelaminan. Semoga Allah limpahkan berkah dan kebahagiaan tak bertepi dalam setiap langkah rumah tangga kalian.', timezone('utc'::text, now())),
('nabil-izza', 'Ustadz Abdullah Mansur', 'Hadir', '1 Orang', 'Alhamdulillah, barakallahu lakum. Semoga pernikahan Ahmad Nabil dan Fadilatul Izza menjadi ladang ibadah yang subur dan menjadi washilah terbukanya pintu rahmat dunia akhirat.', timezone('utc'::text, now())),
('nabil-izza', 'Rizky Ramadhan, S.Kom.', 'Berhalangan', '0 Orang', 'Baarakallaahu fiik Nabil & Izza. Mohon maaf qadarullah belum bisa hadir langsung karena dinas di luar kota. Doa tulus terbaik senantiasa kami panjatkan untuk kebahagiaan kalian berdua.', timezone('utc'::text, now()))
) AS v(wedding_slug, name, presence, pax, message, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.wedding_wishes w
  WHERE w.wedding_slug = v.wedding_slug AND w.name = v.name AND w.message = v.message
);

-- 3. Buat / Perbarui Tabel Buku Tamu Undangan (wedding_guests)
CREATE TABLE IF NOT EXISTS public.wedding_guests (
    id BIGSERIAL PRIMARY KEY,
    wedding_slug TEXT NOT NULL DEFAULT 'nabil-izza',
    name TEXT NOT NULL,
    phone TEXT,
    sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.wedding_guests ADD COLUMN IF NOT EXISTS wedding_slug TEXT NOT NULL DEFAULT 'nabil-izza';
ALTER TABLE public.wedding_guests ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.wedding_guests ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.wedding_guests ADD COLUMN IF NOT EXISTS sent BOOLEAN DEFAULT false;
ALTER TABLE public.wedding_guests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

CREATE INDEX IF NOT EXISTS idx_guests_slug ON public.wedding_guests (wedding_slug, id DESC);

-- 4. Atur Keamanan Data (Row Level Security / RLS)
ALTER TABLE public.wedding_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_guests ENABLE ROW LEVEL SECURITY;

-- Drop policies lama jika ada untuk mencegah duplikasi error
DROP POLICY IF EXISTS "Public read config" ON public.wedding_config;
DROP POLICY IF EXISTS "Public insert config" ON public.wedding_config;
DROP POLICY IF EXISTS "Public update config" ON public.wedding_config;
DROP POLICY IF EXISTS "Public read wishes" ON public.wedding_wishes;
DROP POLICY IF EXISTS "Public insert wishes" ON public.wedding_wishes;
DROP POLICY IF EXISTS "Public delete wishes" ON public.wedding_wishes;
DROP POLICY IF EXISTS "Public read guests" ON public.wedding_guests;
DROP POLICY IF EXISTS "Public insert guests" ON public.wedding_guests;
DROP POLICY IF EXISTS "Public update guests" ON public.wedding_guests;
DROP POLICY IF EXISTS "Public delete guests" ON public.wedding_guests;

-- Kebijakan Akses wedding_config
CREATE POLICY "Public read config" ON public.wedding_config FOR SELECT USING (true);
CREATE POLICY "Public insert config" ON public.wedding_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update config" ON public.wedding_config FOR UPDATE USING (true);

-- Kebijakan Akses wedding_wishes (Publik membaca & mengirim ucapan doa)
CREATE POLICY "Public read wishes" ON public.wedding_wishes FOR SELECT USING (true);
CREATE POLICY "Public insert wishes" ON public.wedding_wishes FOR INSERT WITH CHECK (true);

-- Kebijakan Akses wedding_guests (Buku Tamu Klien)
CREATE POLICY "Public read guests" ON public.wedding_guests FOR SELECT USING (true);
CREATE POLICY "Public insert guests" ON public.wedding_guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update guests" ON public.wedding_guests FOR UPDATE USING (true);
CREATE POLICY "Public delete guests" ON public.wedding_guests FOR DELETE USING (true);

-- 4. Storage Bucket untuk Media Foto Undangan (wedding-media)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wedding-media', 'wedding-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read storage" ON storage.objects;
DROP POLICY IF EXISTS "Public insert storage" ON storage.objects;
DROP POLICY IF EXISTS "Public update storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete storage" ON storage.objects;

CREATE POLICY "Public read storage" ON storage.objects FOR SELECT USING (bucket_id = 'wedding-media');
CREATE POLICY "Public insert storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'wedding-media');
CREATE POLICY "Public update storage" ON storage.objects FOR UPDATE USING (bucket_id = 'wedding-media');
CREATE POLICY "Public delete storage" ON storage.objects FOR DELETE USING (bucket_id = 'wedding-media');

-- 5. Seed Data Demo Resmi 4 Template Unggulan (Wajib Tersimpan dalam Database)
INSERT INTO public.wedding_config (id, config_data, admin_pin)
VALUES
(
  'demo-burgundy',
  '{
    "template": "template-burgundy",
    "theme": "burgundy",
    "title": "The Wedding of Mahardika & Aurelia",
    "soundtrack": "https://assets.mixkit.co/music/preview/mixkit-wedding-in-the-palace-484.mp3",
    "mempelai": {
      "pria": {
        "namaLengkap": "Raden Mahardika Daniswara, S.T.",
        "namaPanggilan": "Mahardika",
        "putraKe": "Putra Pertama",
        "ayah": "Bpk. Ir. Daniswara Adiningrat",
        "ibu": "Ibu Hj. Ratna Kencanawati",
        "alamat": "Kebayoran Baru, Jakarta Selatan",
        "foto": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
        "instagram": "mahardika.danis"
      },
      "wanita": {
        "namaLengkap": "Aurelia Maharani Putri, M.B.A.",
        "namaPanggilan": "Aurelia",
        "putraKe": "Putri Kedua",
        "ayah": "Bpk. H. Hendra Kusuma",
        "ibu": "Ibu Hj. Sri Wahyuni",
        "alamat": "Menteng, Jakarta Pusat",
        "foto": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        "instagram": "aurelia.maharani"
      }
    },
    "acara": {
      "akad": {
        "nama": "Akad Nikah Kerajaan",
        "tanggal": "Sabtu, 28 Agustus 2027",
        "jam": "08.00 - 10.00 WIB",
        "tempat": "The Grand Ballroom Ritz-Carlton Jakarta",
        "alamat": "Jl. DR. Ide Anak Agung Gde Agung Kav.E.1.1 No.1, Mega Kuningan, Jakarta Selatan",
        "mapsUrl": "https://maps.google.com/?q=The+Ritz-Carlton+Jakarta+Mega+Kuningan"
      },
      "resepsi": {
        "nama": "Resepsi Pernikahan Agung",
        "tanggal": "Sabtu, 28 Agustus 2027",
        "jam": "19.00 - 22.00 WIB",
        "tempat": "Royal Grand Ballroom Ritz-Carlton Jakarta",
        "alamat": "Jl. DR. Ide Anak Agung Gde Agung Kav.E.1.1 No.1, Mega Kuningan, Jakarta Selatan",
        "mapsUrl": "https://maps.google.com/?q=The+Ritz-Carlton+Jakarta+Mega+Kuningan"
      }
    },
    "rekening": [
      { "bank": "BCA", "nomor": "8830129481", "pemilik": "Mahardika Daniswara" },
      { "bank": "Mandiri", "nomor": "1370019283741", "pemilik": "Aurelia Maharani Putri" }
    ],
    "cerita": [
      { "tahun": "2022", "judul": "Awal Pertemuan di Zurich", "isi": "Bertemu saat menghadiri konferensi arsitektur dan bisnis internasional di Swiss." },
      { "tahun": "2025", "judul": "Komitmen & Lamaran", "isi": "Di bawah gemerlap langit malam Danau Como, dua hati mengikat janji untuk selamanya." },
      { "tahun": "2027", "judul": "Menuju Pelaminan", "isi": "Dengan ridho kedua orang tua dan rahmat Allah SWT, kami menyatukan cinta dalam ikatan pernikahan sakral." }
    ]
  }'::jsonb,
  '123456'
),
(
  'demo-fresh-magic',
  '{
    "template": "fresh-magic",
    "theme": "fresh-magic",
    "title": "The Wedding of Zain & Fathia",
    "soundtrack": "https://assets.mixkit.co/music/preview/mixkit-spring-wedding-soft-strings-1087.mp3",
    "mempelai": {
      "pria": {
        "namaLengkap": "Muhammad Zain Al-Fatih, S.Kom.",
        "namaPanggilan": "Zain",
        "putraKe": "Putra Pertama",
        "ayah": "Bpk. H. Ahmad Farhan",
        "ibu": "Ibu Hj. Siti Maryam",
        "alamat": "Dago Atas, Bandung",
        "foto": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
        "instagram": "zain.alfatih"
      },
      "wanita": {
        "namaLengkap": "Fathia Nur Ramadhani, S.Farm.",
        "namaPanggilan": "Fathia",
        "putraKe": "Putri Ketiga",
        "ayah": "Bpk. Drs. H. Usman Basri",
        "ibu": "Ibu Hj. Aisyah Wardani",
        "alamat": "Setiabudi, Bandung",
        "foto": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
        "instagram": "fathia.ramadhani"
      }
    },
    "acara": {
      "akad": {
        "nama": "Akad Nikah",
        "tanggal": "Ahad, 12 September 2027",
        "jam": "08.30 - 10.30 WIB",
        "tempat": "Glasshouse Sanctuary Pine Hill",
        "alamat": "Jl. Maribaya Timur No. 1, Cibodas, Lembang, Bandung Barat",
        "mapsUrl": "https://maps.google.com/?q=Pine+Hill+Cibodas"
      },
      "resepsi": {
        "nama": "Botanical Garden Reception",
        "tanggal": "Ahad, 12 September 2027",
        "jam": "11.30 - 14.30 WIB",
        "tempat": "Pine Hill Open Air Pavilion",
        "alamat": "Jl. Maribaya Timur No. 1, Cibodas, Lembang, Bandung Barat",
        "mapsUrl": "https://maps.google.com/?q=Pine+Hill+Cibodas"
      }
    },
    "rekening": [
      { "bank": "BSI", "nomor": "7149028371", "pemilik": "Muhammad Zain Al-Fatih" },
      { "bank": "Mandiri", "nomor": "1310098765432", "pemilik": "Fathia Nur Ramadhani" }
    ],
    "cerita": [
      { "tahun": "2023", "judul": "Taman Lembah Pinus", "isi": "Pandangan pertama dalam ketenangan alam pegunungan Lembang yang sejuk." },
      { "tahun": "2025", "judul": "Khitbah & Silaturahmi", "isi": "Dua keluarga besar berkumpul mempertemukan doa dan menyelaraskan langkah masa depan." },
      { "tahun": "2027", "judul": "Akad Suci & Walimah", "isi": "Mengucap ijab kabul di hadapan Sang Maha Kuasa, melangkah bersama dalam ridho-Nya." }
    ]
  }'::jsonb,
  '123456'
),
(
  'demo-adat-jawa',
  '{
    "template": "adat-jawa",
    "theme": "adat-jawa",
    "title": "Pawiwahan Ageng Danang & Sekar",
    "soundtrack": "https://assets.mixkit.co/music/preview/mixkit-relaxing-harp-695.mp3",
    "mempelai": {
      "pria": {
        "namaLengkap": "Bagus Danang Wijayanto, S.Sn.",
        "namaPanggilan": "Danang",
        "putraKe": "Putra Kakung Pambayun",
        "ayah": "Bpk. H. Djoko Wijoyo",
        "ibu": "Ibu Hj. Sri Mulyani",
        "alamat": "Laweyan, Surakarta Hadiningrat",
        "foto": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80",
        "instagram": "danang.wijayanto"
      },
      "wanita": {
        "namaLengkap": "Roro Sekar Prameswari, S.Pd.",
        "namaPanggilan": "Sekar",
        "putraKe": "Putri Genduk Pambayun",
        "ayah": "Bpk. Raden Mas Sutrisno",
        "ibu": "Ibu Raden Ajeng Kusuma Ningrum",
        "alamat": "Pasar Kliwon, Surakarta Hadiningrat",
        "foto": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
        "instagram": "sekar.prameswari"
      }
    },
    "acara": {
      "akad": {
        "nama": "Ijab Kabul Sakral",
        "tanggal": "Kemis Pahing, 18 November 2027",
        "jam": "08.00 - 10.00 WIB",
        "tempat": "Pendopo Ndalem Danarhadi",
        "alamat": "Jl. Slamet Riyadi No. 261, Sriwedari, Laweyan, Kota Surakarta",
        "mapsUrl": "https://maps.google.com/?q=House+of+Danar+Hadi+Solo"
      },
      "resepsi": {
        "nama": "Resepsi Pawiwahan Ageng",
        "tanggal": "Kemis Pahing, 18 November 2027",
        "jam": "18.30 - 21.30 WIB",
        "tempat": "Sasana Handrawina Ndalem Danarhadi",
        "alamat": "Jl. Slamet Riyadi No. 261, Sriwedari, Laweyan, Kota Surakarta",
        "mapsUrl": "https://maps.google.com/?q=House+of+Danar+Hadi+Solo"
      }
    },
    "rekening": [
      { "bank": "BCA", "nomor": "0158923412", "pemilik": "Bagus Danang Wijayanto" },
      { "bank": "BNI", "nomor": "0982341567", "pemilik": "Roro Sekar Prameswari" }
    ],
    "cerita": [
      { "tahun": "2021", "judul": "Wiwitan Pitepangan", "isi": "Pepanggihan ingkang sepisanan wonten pagelaran seni karawitan Surakarta." },
      { "tahun": "2024", "judul": "Ngangkat Janji", "isi": "Nyuwun pangestu para pinisepuh lan ngraketaken paseduluran kalih kulawarga ageng." },
      { "tahun": "2027", "judul": "Dadap Seta Palakrama", "isi": "Kanthi ridhaning Gusti Ingkang Maha Agung, nglangkahi pagesangan enggal ing sesrawungan balewisma." }
    ]
  }'::jsonb,
  '123456'
),
(
  'demo-modern-luxury',
  '{
    "template": "modern-luxury",
    "theme": "modern-luxury",
    "title": "The Wedding of Rayhan & Clarissa",
    "soundtrack": "https://assets.mixkit.co/music/preview/mixkit-cinematic-romance-577.mp3",
    "mempelai": {
      "pria": {
        "namaLengkap": "Rayhan Alfarezi Pratama, B.Eng.",
        "namaPanggilan": "Rayhan",
        "putraKe": "Putra Pertama",
        "ayah": "Bpk. Dr. H. Pratama Kusuma",
        "ibu": "Ibu Dr. Hj. Maya Indira",
        "alamat": "Pondok Indah, Jakarta Selatan",
        "foto": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
        "instagram": "rayhan.alfarezi"
      },
      "wanita": {
        "namaLengkap": "Clarissa Stephanie Valerie, B.A.",
        "namaPanggilan": "Clarissa",
        "putraKe": "Putri Bungsu",
        "ayah": "Bpk. Hendrawan Valerie",
        "ibu": "Ibu Caroline Gunawan",
        "alamat": "Senopati, Jakarta Selatan",
        "foto": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
        "instagram": "clarissa.valerie"
      }
    },
    "acara": {
      "akad": {
        "nama": "Holy Matrimony & Akad",
        "tanggal": "Sabtu, 16 Oktober 2027",
        "jam": "09.00 - 11.00 WIB",
        "tempat": "The Glass House at Plataran Hutan Kota",
        "alamat": "Gelora Bung Karno, Jl. Jend. Sudirman Kav 54-55, Jakarta Pusat",
        "mapsUrl": "https://maps.google.com/?q=Hutan+Kota+Plataran"
      },
      "resepsi": {
        "nama": "Haute Couture Wedding Gala",
        "tanggal": "Sabtu, 16 Oktober 2027",
        "jam": "18.30 - 22.00 WIB",
        "tempat": "Plataran Hutan Kota Grand Pavilion",
        "alamat": "Gelora Bung Karno, Jl. Jend. Sudirman Kav 54-55, Jakarta Pusat",
        "mapsUrl": "https://maps.google.com/?q=Hutan+Kota+Plataran"
      }
    },
    "rekening": [
      { "bank": "BCA", "nomor": "5420981245", "pemilik": "Rayhan Alfarezi Pratama" },
      { "bank": "Permata", "nomor": "7019283746", "pemilik": "Clarissa Stephanie Valerie" }
    ],
    "cerita": [
      { "tahun": "2023", "judul": "Editorial Love Story", "isi": "Bertemu dalam sebuah kolaborasi galeri desain kontemporer di Melbourne." },
      { "tahun": "2025", "judul": "The Sunset Proposal", "isi": "Momen hening nan magis di tebing Uluwatu saat sebuah cincin platinum disematkan." },
      { "tahun": "2027", "judul": "Eternity Vows", "isi": "Merayakan persatuan cinta elegan, abadi, dan dipenuhi berkah ilahi di hadapan orang terkasih." }
    ]
  }'::jsonb,
  '123456'
)
ON CONFLICT (id) DO UPDATE SET 
  config_data = EXCLUDED.config_data,
  updated_at = timezone('utc'::text, now());
