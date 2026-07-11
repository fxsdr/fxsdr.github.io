CARA GANTI MUSIK LATAR
=======================
Taruh file musik Anda di folder ini (assets/audio/) dengan NAMA FILE PERSIS:

    backsound.mp3

Format harus .mp3 (jika ingin pakai nama/format lain, ganti juga bagian
<source src="assets/audio/..."> di file index.html).

Catatan:
- Browser modern memblokir autoplay audio dengan suara sebelum ada interaksi
  pengguna. Musik akan otomatis mulai diputar saat tamu menekan tombol
  "BUKA UNDANGAN" di halaman sampul (ini sudah dianggap sebagai interaksi
  pengguna oleh browser, jadi biasanya berhasil).
- Tombol bulat kecil di pojok kanan bawah layar juga bisa dipakai tamu untuk
  memutar/menjeda musik secara manual kapan saja.
- Usahakan ukuran file musik tidak terlalu besar (idealnya di bawah 4-5 MB)
  agar halaman tetap cepat dibuka, terutama di jaringan seluler.
