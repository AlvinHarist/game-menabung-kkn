
        const synth = new Tone.PolySynth(Tone.Synth).toDestination();
        synth.volume.value = -10;

        const soundEffects = {
            click: () => synth.triggerAttackRelease("C5", "32n"),
            drop: () => synth.triggerAttackRelease("G4", "32n"),
            remove: () => synth.triggerAttackRelease("E4", "16n"),
            run: () => {
                const now = Tone.now();
                synth.triggerAttackRelease("C4", "8n", now);
                synth.triggerAttackRelease("E4", "8n", now + 0.2);
                synth.triggerAttackRelease("G4", "8n", now + 0.4);
            },
            stepTick: () => synth.triggerAttackRelease("C5", "32n"),
            success: () => {
                const now = Tone.now();
                synth.triggerAttackRelease("C5", "8n", now);
                synth.triggerAttackRelease("E5", "8n", now + 0.15);
                synth.triggerAttackRelease("G5", "4n", now + 0.3);
                synth.triggerAttackRelease("C6", "2n", now + 0.5);
            },
            error: () => {
                const now = Tone.now();
                synth.triggerAttackRelease("G3", "8n", now);
                synth.triggerAttackRelease("C3", "2n", now + 0.2);
            },
            star: () => synth.triggerAttackRelease("E5", "8n")
        };

        let state = {
            level: 0,
            dompet: 0,
            tabungan: 0,
            program: [], // Array objects: {id: blockId, uid: uniqueId}
            isExecuting: false
        };

        const formatRp = (angka) => `Rp ${angka.toLocaleString('id-ID')}`;
        
        // Highlight Rp in text
        const formatScenarioText = (text) => {
            return text.replace(/(Rp ?\d+(?:\.\d+)*)/g, '<span class="highlight-money">$1</span>');
        };

        // Angka Menggulung
        function animateValue(obj, start, end, duration) {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                // easeOutQuad
                const easeOut = progress * (2 - progress);
                obj.innerHTML = formatRp(Math.floor(easeOut * (end - start) + start));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    obj.innerHTML = formatRp(end);
                }
            };
            window.requestAnimationFrame(step);
        }
// Skenario dirancang untuk mengajarkan sekuens logis (CT) dan prioritas keuangan.
        const levels = [
            {
                id: 1,
                title: "Uang Saku Mingguan",
                scenario: "Kamu mendapat uang saku mingguan Rp 20.000. Pisahkan uang untuk ditabung dan uang untuk jajan di dompet agar kamu tidak boros.",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#bbf7d0" opacity="0.6"/>
                    <g transform="translate(0, -5)">
                        <path d="M20,100 C20,70 40,60 50,60 C60,60 80,70 80,100" fill="#fca5a5" stroke="#ef4444" stroke-width="4"/>
                        <path d="M50,60 C50,45 35,45 25,55" fill="none" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
                        <circle cx="50" cy="30" r="25" fill="#fbbf24" stroke="#d97706" stroke-width="4"/>
                        <text x="50" y="37" font-size="18" font-weight="900" font-family="system-ui" fill="#d97706" text-anchor="middle">Rp</text>
                    </g>
                </svg>`,
                blocks: [
                    { id: 'terima_uang', text: 'Terima Uang Rp20.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '💵' },
                    { id: 'simpan_tabung', text: 'Simpan Rp10.000 ke Tabungan', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' },
                    { id: 'simpan_dompet', text: 'Simpan Rp10.000 ke Dompet', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '👛' },
                    { id: 'jajan_semua', text: 'Jajankan Semua Rp20.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🧸' }
                ],
                validate: (prog) => {
                    let tempCash = 0; let dom = 0; let tab = 0;
                    if (prog.length === 0 || prog[0] !== 'terima_uang') return {ok: false, msg: "Kamu harus menerima uang saku terlebih dahulu sebelum mengelolanya!"};
                    for (let id of prog) {
                        if (id === 'terima_uang') tempCash += 20000;
                        else if (id === 'simpan_tabung') { 
                            if(tempCash < 10000) return {ok: false, msg: "Sisa uang yang diterima tidak cukup untuk ditabung Rp10.000!"}; 
                            tempCash -= 10000; tab += 10000; 
                        }
                        else if (id === 'simpan_dompet') { 
                            if(tempCash < 10000) return {ok: false, msg: "Sisa uang yang diterima tidak cukup untuk dompet Rp10.000!"}; 
                            tempCash -= 10000; dom += 10000; 
                        }
                        else if (id === 'jajan_semua') {
                            return {ok: false, msg: "Membelanjakan semua uang saku berarti kamu tidak menabung. Belajarlah menahan diri!"};
                        }
                    }
                    if (tempCash > 0) return {ok: false, msg: "Uangmu belum dialokasikan semua! Jangan biarkan uang tidak jelas tempatnya."};
                    if (prog.join(',') === 'terima_uang,simpan_tabung,simpan_dompet' || prog.join(',') === 'terima_uang,simpan_dompet,simpan_tabung') {
                        return {ok: true, dompet: dom, tabung: tab, msg: "Bagus! Kamu berhasil membagi rata uang sakumu untuk ditabung dan uang jajan."};
                    }
                    return {ok: false, msg: "Urutan langkah belum benar!"};
                }
            },
            {
                id: 2,
                title: "Kebutuhan Sekolah",
                scenario: "Pulpen dan pensilmu habis. Di koperasi harganya Rp 5.000. Di kantin ada jajanan baru (Rp 10.000). Uang di dompetmu cukup. Apa yang kamu beli?",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#e0f2fe" opacity="0.6"/>
                    <rect x="15" y="25" width="45" height="55" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="4"/>
                    <rect x="20" y="25" width="5" height="55" fill="#0284c7"/>
                    <line x1="30" y1="40" x2="50" y2="40" stroke="#bae6fd" stroke-width="4" stroke-linecap="round"/>
                    <line x1="30" y1="55" x2="50" y2="55" stroke="#bae6fd" stroke-width="4" stroke-linecap="round"/>
                    <line x1="30" y1="70" x2="40" y2="70" stroke="#bae6fd" stroke-width="4" stroke-linecap="round"/>
                    <path d="M55 20 Q 90 20 90 45 Q 90 70 70 70 L 60 80 L 60 70 Q 55 70 55 45 Z" fill="#fee2e2" stroke="#ef4444" stroke-width="3"/>
                    <text x="73" y="53" font-size="28" font-weight="900" font-family="system-ui" fill="#ef4444" text-anchor="middle">!</text>
                </svg>`,
                blocks: [
                    { id: 'beli_alat_tulis', text: 'Beli Alat Tulis Rp5.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '✏️' },
                    { id: 'beli_jajanan', text: 'Beli Jajanan Baru Rp10.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🍦' },
                    { id: 'simpan_sisa', text: 'Simpan Sisa Rp5.000 ke Tabungan', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' }
                ],
                validate: (prog) => {
                    let d = 0; let t = 0;
                    for (let id of prog) {
                        if (id === 'beli_alat_tulis') {
                            if(state.dompet + d < 5000) return {ok: false, msg: "Uang dompet tidak cukup!"};
                            d -= 5000;
                        } else if (id === 'beli_jajanan') {
                            if(state.dompet + d < 10000) return {ok: false, msg: "Uang dompet tidak cukup!"};
                            return {ok: false, msg: "Jajanan memang enak, tapi alat tulis adalah KEBUTUHAN utama sekolahmu. Prioritaskan kebutuhan sekolahmu!"};
                        } else if (id === 'simpan_sisa') {
                            if(state.dompet + d < 5000) return {ok: false, msg: "Uang sisa di dompet tidak cukup Rp5.000!"};
                            d -= 5000;
                            t += 5000;
                        }
                    }
                    if (prog.join(',') === 'beli_alat_tulis,simpan_sisa') {
                        return {ok: true, dompet: d, tabung: t, msg: "Hebat! Kebutuhan sekolah terpenuhi, dan kamu bahkan menambah isi tabunganmu dari uang sisa."};
                    }
                    return {ok: false, msg: "Langkahmu kurang tepat atau belum selesai. Beli kebutuhan utama lalu simpan sisanya!"};
                }
            },
            {
                id: 3,
                title: "Godaan Diskon (Keinginan)",
                scenario: "Diskon mainan jadi Rp 15.000. Tabunganmu ada banyak! Mainan di rumah masih menumpuk. Apa yang sebaiknya dilakukan?",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#fecaca" opacity="0.6"/>
                    <rect x="20" y="20" width="60" height="30" rx="5" fill="#ef4444" stroke="#b91c1c" stroke-width="4"/>
                    <text x="50" y="42" font-size="20" font-weight="900" font-family="system-ui" fill="white" text-anchor="middle">50%</text>
                    <path d="M30 65 L40 55 L60 55 L70 65 L75 65 L75 75 L25 75 L25 65 Z" fill="#3b82f6" stroke="#1d4ed8" stroke-width="3"/>
                    <circle cx="35" cy="75" r="7" fill="#1e293b"/>
                    <circle cx="65" cy="75" r="7" fill="#1e293b"/>
                </svg>`,
                blocks: [
                    { id: 'ambil_tabungan', text: 'Ambil Tabungan Rp15.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '🏧' },
                    { id: 'beli_mainan', text: 'Beli Mainan Diskon Rp15.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🏎️' },
                    { id: 'abaikan_mainan', text: 'Abaikan Mainan (Tidak Beli)', color: 'bg-green-100 border-green-300 text-green-800', emoji: '🛑' },
                    { id: 'rapikan_mainan', text: 'Rapikan Mainan Lama', color: 'bg-purple-100 border-purple-300 text-purple-800', emoji: '🧸' }
                ],
                validate: (prog) => {
                    let d = 0; let t = 0;
                    for (let id of prog) {
                        if (id === 'ambil_tabungan') {
                            if (state.tabungan + t < 15000) return {ok: false, msg: "Tabunganmu tidak cukup!"};
                            t -= 15000; d += 15000;
                        } else if (id === 'beli_mainan') {
                            if (state.dompet + d < 15000) return {ok: false, msg: "Uang tidak cukup! Harus ambil tabungan dulu."};
                            return {ok: false, msg: "Jangan tergoda diskon! Membeli barang yang tidak kamu butuhkan hanyalah pemborosan."};
                        } else if (id === 'abaikan_mainan') {
                        } else if (id === 'rapikan_mainan') {
                        }
                    }
                    if (prog.join(',') === 'abaikan_mainan,rapikan_mainan') {
                        return {ok: true, dompet: d, tabung: t, msg: "Keputusan jenius! Kamu menahan keinginan impulsif dan menyadari kamu masih punya banyak mainan untuk dimainkan."};
                    }
                    return {ok: false, msg: "Abaikan saja godaannya dan rawatlah barang-barang lamamu!"};
                }
            },
            {
                id: 4,
                title: "Dana Darurat (Kebutuhan)",
                scenario: "Lupa bawa bekal dan kamu sangat lapar. Makan siang di sekolah Rp 10.000. Dompetmu kosong, tapi ada tabungan. Apa keputusanmu?",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#dcfce7" opacity="0.6"/>
                    <rect x="35" y="40" width="30" height="40" rx="5" fill="white" stroke="#16a34a" stroke-width="4"/>
                    <rect x="40" y="30" width="20" height="10" fill="#16a34a"/>
                    <path d="M45 55 L55 55 M50 50 L50 60" stroke="#16a34a" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="75" cy="30" r="8" fill="#86efac" opacity="0.7"/>
                    <circle cx="85" cy="20" r="4" fill="#86efac" opacity="0.7"/>
                </svg>`,
                blocks: [
                    { id: 'ambil_tabung', text: 'Ambil Tabungan Rp10.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '🏧' },
                    { id: 'beli_makan', text: 'Beli Makan Siang Rp10.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '🍱' },
                    { id: 'tahan_lapar', text: 'Tahan Lapar Sampai Sakit', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🤕' },
                    { id: 'pinjam_teman', text: 'Pinjam Uang Teman Rp10.000', color: 'bg-orange-100 border-orange-300 text-orange-800', emoji: '🤝' }
                ],
                validate: (prog) => {
                    let d = 0; let t = 0;
                    for (let id of prog) {
                        if (id === 'ambil_tabung') {
                            if (state.tabungan + t < 10000) return {ok: false, msg: "Tabunganmu tidak cukup!"};
                            t -= 10000; d += 10000;
                        } else if (id === 'beli_makan') {
                            if (state.dompet + d < 10000) return {ok: false, msg: "Uang dompet tidak cukup, ambil tabungan dulu!"};
                            d -= 10000;
                        } else if (id === 'tahan_lapar') {
                            return {ok: false, msg: "Kesehatan itu kebutuhan utama! Jangan menyiksa diri jika kamu punya tabungan untuk kondisi darurat."};
                        } else if (id === 'pinjam_teman') {
                            return {ok: false, msg: "Jangan berhutang pada orang lain jika kamu sendiri masih memiliki uang tabungan!"};
                        }
                    }
                    if (prog.join(',') === 'ambil_tabung,beli_makan') {
                        return {ok: true, dompet: d, tabung: t, msg: "Tepat sekali! Fungsi tabungan salah satunya adalah menjadi dana darurat untuk kebutuhan mendesak."};
                    }
                    return {ok: false, msg: "Langkah kurang tepat. Ambil tabungan lalu belikan makan!"};
                }
            },
            {
                id: 5,
                title: "Tambahan Uang",
                scenario: "Membantu ibu membersihkan halaman, kamu dapat hadiah Rp 15.000.",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#fce7f3" opacity="0.6"/>
                    <rect x="25" y="15" width="50" height="30" rx="2" fill="#86efac" stroke="#16a34a" stroke-width="4"/>
                    <circle cx="50" cy="30" r="10" fill="#16a34a" opacity="0.4"/>
                    <text x="50" y="34" font-size="12" font-weight="bold" font-family="system-ui" fill="white" text-anchor="middle">Rp</text>
                    <rect x="15" y="35" width="70" height="45" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="4"/>
                    <path d="M15 35 L50 60 L85 35" fill="none" stroke="#ca8a04" stroke-width="4" stroke-linejoin="round"/>
                    <path d="M15 80 L40 60 M85 80 L60 60" fill="none" stroke="#ca8a04" stroke-width="3" stroke-linecap="round"/>
                </svg>`,
                blocks: [
                    { id: 'terima_hadiah', text: 'Terima Hadiah Rp15.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '💵' },
                    { id: 'beli_buku', text: 'Beli Buku Cerita Edukasi Rp5.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '📖' },
                    { id: 'beli_game', text: 'Beli Diamond Game Rp15.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '💎' },
                    { id: 'simpan_sisa', text: 'Simpan Sisa ke Tabungan Rp10.000', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' }
                ],
                validate: (prog) => {
                    let cash = 0; let t = 0; let d = 0;
                    if(prog.length === 0 || prog[0] !== 'terima_hadiah') return {ok: false, msg: "Terima uangnya dulu sebelum digunakan!"};
                    for (let id of prog) {
                        if (id === 'terima_hadiah') cash += 15000;
                        else if (id === 'beli_buku') {
                            if (cash < 5000) return {ok: false, msg: "Uang hadiah belum dialokasikan, error."};
                            cash -= 5000;
                        } else if (id === 'beli_game') {
                            return {ok: false, msg: "Diamond game hanya hiburan sesaat. Gunakan hadiahmu untuk hal bermanfaat dan tabungan."};
                        } else if (id === 'simpan_sisa') {
                            if (cash < 10000) return {ok: false, msg: "Sisa hadiah tidak cukup Rp10.000!"};
                            cash -= 10000; t += 10000;
                        }
                    }
                    if (cash !== 0) return {ok: false, msg: "Gunakan uang hadiahmu dengan bijak sampai dialokasikan dengan benar."};
                    if (prog.join(',') === 'terima_hadiah,beli_buku,simpan_sisa') {
                        return {ok: true, dompet: d, tabung: t, msg: "Luar biasa! Kamu mendapatkan ilmu dari buku dan juga memperbanyak tabunganmu."};
                    }
                    return {ok: false, msg: "Urutan langkah masih salah."};
                }
            },
            {
                id: 6,
                title: "Bisnis Kecil",
                scenario: "Kamu menjual buku cerita bekas yang sudah selesai dibaca kepada temanmu seharga Rp 20.000.",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#fef08a" opacity="0.6"/>
                    <rect x="25" y="30" width="30" height="45" rx="3" fill="#ef4444" stroke="#991b1b" stroke-width="3" transform="rotate(-15 40 50)"/>
                    <rect x="30" y="35" width="20" height="20" fill="#fca5a5" transform="rotate(-15 40 50)"/>
                    <path d="M60 40 Q75 35 75 50 Q75 65 60 60" fill="none" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
                    <polygon points="58,35 50,40 58,45" fill="#eab308"/>
                    <polygon points="62,55 70,60 62,65" fill="#eab308"/>
                    <circle cx="75" cy="50" r="10" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
                    <text x="75" y="54" font-size="10" font-weight="bold" font-family="system-ui" fill="#d97706" text-anchor="middle">Rp</text>
                </svg>`,
                blocks: [
                    { id: 'jual_komik', text: 'Jual Buku Bekas', color: 'bg-purple-100 border-purple-300 text-purple-800', emoji: '📕' },
                    { id: 'terima_uang', text: 'Terima Uang Rp20.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '💵' },
                    { id: 'beli_mainan_mahal', text: 'Beli Mainan Mahal Rp20.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🏎️' },
                    { id: 'simpan_hasil', text: 'Simpan Hasil ke Tabungan Rp20.000', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' }
                ],
                validate: (prog) => {
                    let hasJual = false; let cash = 0; let t = 0;
                    for(let id of prog) {
                        if (id === 'jual_komik') hasJual = true;
                        else if (id === 'terima_uang') {
                            if(!hasJual) return {ok: false, msg: "Kamu harus memberikan komik tersebut dulu sebelum menerima uang (Jual Komik)."};
                            cash += 20000;
                        }
                        else if (id === 'beli_mainan_mahal') {
                            return {ok: false, msg: "Uang hasil jualan jangan langsung dihabiskan impulsif. Tabung untuk impian yang lebih besar!"};
                        }
                        else if (id === 'simpan_hasil') {
                            if(cash < 20000) return {ok: false, msg: "Uang tunai tidak cukup, terima uang dulu!"};
                            cash -= 20000; t += 20000;
                        }
                    }
                    if (prog.join(',') === 'jual_komik,terima_uang,simpan_hasil') {
                        return {ok: true, dompet: 0, tabung: t, msg: "Keren! Kamu seorang wirausahawan pintar yang tahu pentingnya menabung hasil usahamu."};
                    }
                    return {ok: false, msg: "Urutan langkah belum benar!"};
                }
            },
            {
                id: 7,
                title: "Kebutuhan & Berbagi",
                scenario: "Sepatu sekolah jebol (butuh Rp 25.000). Ada donasi bencana alam di sekolah (Rp 5.000).",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#f3e8ff" opacity="0.6"/>
                    <path d="M20 60 Q 30 55 40 60 L 40 70 L 20 70 Z" fill="#94a3b8" stroke="#64748b" stroke-width="2"/>
                    <path d="M35 60 L35 50" stroke="#64748b" stroke-width="2" stroke-dasharray="2,2"/>
                    <path d="M50 50 Q 65 40 80 55 L 80 70 L 45 70 Q 45 60 50 50 Z" fill="#a855f7" stroke="#7e22ce" stroke-width="3"/>
                    <circle cx="75" cy="45" r="4" fill="#fcd34d"/>
                    <path d="M50 70 L80 70" stroke="white" stroke-width="3"/>
                </svg>`,
                blocks: [
                    { id: 'ambil_tabung', text: 'Ambil Tabungan Rp30.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '🏧' },
                    { id: 'beli_sepatu', text: 'Beli Sepatu Baru Rp25.000', color: 'bg-purple-100 border-purple-300 text-purple-800', emoji: '👟' },
                    { id: 'beli_jaket', text: 'Beli Jaket Keren Rp35.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🧥' },
                    { id: 'sumbangkan', text: 'Sumbangkan Rp5.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '❤️' }
                ],
                validate: (prog) => {
                    let d = 0; let t = 0;
                    for (let id of prog) {
                        if (id === 'ambil_tabung') {
                            if (state.tabungan + t < 30000) return {ok: false, msg: "Tabunganmu tidak cukup!"};
                            t -= 30000; d += 30000;
                        } else if (id === 'beli_jaket') {
                            return {ok: false, msg: "Kamu butuh sepatu, bukan jaket keren. Uangmu juga tidak cukup jika ditotal dengan sepatu."};
                        } else if (id === 'beli_sepatu') {
                            if (d < 25000) return {ok: false, msg: "Uang tidak cukup, ambil tabungan dulu!"};
                            d -= 25000;
                        } else if (id === 'sumbangkan') {
                            if (d < 5000) return {ok: false, msg: "Uang tidak cukup, ambil tabungan dulu!"};
                            d -= 5000;
                        }
                    }
                    if (prog.join(',') === 'ambil_tabung,beli_sepatu,sumbangkan' || prog.join(',') === 'ambil_tabung,sumbangkan,beli_sepatu') {
                        return {ok: true, dompet: d, tabung: t, msg: "Mulia sekali! Kamu mengurus kebutuhanmu (sepatu) dan tetap menyisihkan untuk membantu sesama."};
                    }
                    return {ok: false, msg: "Langkahmu belum lengkap atau urutannya salah."};
                }
            },
            {
                id: 8,
                title: "Tujuan Besar (Sepeda)",
                scenario: "Ingin beli sepeda bekas (Rp 50.000) agar hemat ongkos angkot. Kamu dapat angpao tahun baru Rp 60.000.",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#fce7f3" opacity="0.6"/>
                    <rect x="15" y="35" width="70" height="45" rx="4" fill="#ef4444" stroke="#b91c1c" stroke-width="4"/>
                    <path d="M15 35 L50 60 L85 35" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linejoin="round"/>
                    <path d="M15 80 L40 60 M85 80 L60 60" fill="none" stroke="#b91c1c" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="8" fill="#fbbf24"/>
                </svg>`,
                blocks: [
                    { id: 'terima_angpao', text: 'Terima Angpao Rp60.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '🧧' },
                    { id: 'beli_sepeda', text: 'Beli Sepeda Bekas Rp50.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '🚲' },
                    { id: 'beli_sepatu_roda', text: 'Beli Sepatu Roda Mahal Rp60.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🛼' },
                    { id: 'simpan_sisa', text: 'Simpan Sisa ke Tabungan Rp10.000', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' }
                ],
                validate: (prog) => {
                    let cash = 0; let t = 0;
                    for (let id of prog) {
                        if (id === 'terima_angpao') {
                            cash += 60000;
                        } else if (id === 'beli_sepatu_roda') {
                            return {ok: false, msg: "Sepatu roda mahal hanya untuk bermain. Sepeda akan membantumu hemat ongkos angkot (investasi)!"};
                        } else if (id === 'beli_sepeda') {
                            if(cash < 50000) return {ok: false, msg: "Terima angpao dulu!"};
                            cash -= 50000;
                        } else if (id === 'simpan_sisa') {
                            if (cash < 10000) return {ok: false, msg: "Uang tidak cukup!"};
                            cash -= 10000; t += 10000;
                        }
                    }
                    if (prog.join(',') === 'terima_angpao,beli_sepeda,simpan_sisa') {
                        return {ok: true, dompet: 0, tabung: t, msg: "Sempurna! Kamu sukses mencapai mimpimu membeli barang produktif berkat kesabaran."};
                    }
                    return {ok: false, msg: "Urutan langkah belum benar!"};
                }
            },
            {
                id: 9,
                title: "Manajemen Anggaran (HOTS)",
                scenario: "Kamu diberi uang spesial Rp 30.000 dari Ayah ke Pasar Malam. Syarat mutlak: MENGUTAMAKAN PENDIDIKAN, HIBURAN WAJAR, DAN WAJIB MENABUNG!",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#fef08a" opacity="0.6"/>
                    <path d="M20 70 L80 70 L80 80 L20 80 Z" fill="#b45309"/>
                    <path d="M30 40 L70 40 L50 20 Z" fill="#fb923c"/>
                    <rect x="40" y="40" width="20" height="30" fill="#fcd34d"/>
                </svg>`,
                blocks: [
                    { id: 'terima_ayah', text: 'Terima Uang Ayah Rp30.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '💵' },
                    { id: 'beli_wahana', text: 'Beli Tiket Wahana Rp10.000', color: 'bg-pink-100 border-pink-300 text-pink-800', emoji: '🎢' },
                    { id: 'beli_jajanan', text: 'Beli Jajanan Favorit Rp10.000', color: 'bg-orange-100 border-orange-300 text-orange-800', emoji: '🍡' },
                    { id: 'beli_buku', text: 'Beli Buku Pengetahuan Murah Rp15.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '📚' },
                    { id: 'beli_mainan', text: 'Beli Mainan Koleksi Rp20.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🤖' },
                    { id: 'simpan_sisa', text: 'Simpan Sisa Uang ke Tabungan', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' }
                ],
                validate: (prog) => {
                    if (prog.length === 0 || prog[0] !== 'terima_ayah') return {ok: false, msg: "Mulai dengan menerima uang dari Ayah!"};
                    if (prog[prog.length-1] !== 'simpan_sisa') return {ok: false, msg: "Langkah terakhir harus menyimpan sisa uang ke tabungan!"};
                    if (prog.length === 2) return {ok: false, msg: "Kamu ke pasar malam masa tidak membeli apa-apa? Coba belilah sesuatu secara bijak."};
                    
                    let cash = 30000; let t = 0;
                    let boughtBuku = false, boughtMainan = false, boughtWahana = false, boughtJajanan = false;
                    for (let i = 1; i < prog.length - 1; i++) {
                        let id = prog[i];
                        if (id === 'beli_wahana') { cash -= 10000; boughtWahana = true; }
                        else if (id === 'beli_jajanan') { cash -= 10000; boughtJajanan = true; }
                        else if (id === 'beli_buku') { cash -= 15000; boughtBuku = true; }
                        else if (id === 'beli_mainan') { cash -= 20000; boughtMainan = true; }
                        else if (id === 'terima_ayah' || id === 'simpan_sisa') { return {ok: false, msg: "Langkah terima/simpan tidak boleh ganda!"}; }
                        
                        if (cash < 0) return {ok: false, msg: "Uang Ayah hanya Rp30.000, belanjaanmu melebihi batas. Defisit anggaran!"};
                    }
                    
                    if (cash === 0) return {ok: false, msg: "Gagal! Uangmu habis tanpa sisa untuk ditabung. Pengelolaan yang buruk!"};
                    t += cash;
                    
                    if (boughtMainan) {
                        return {ok: true, dompet: 0, tabung: t, msg: "Kamu berhasil menabung, namun uang banyak terkuras untuk mainan koleksi. Buku pengetahuan terlewat!"};
                    }
                    if (boughtBuku) {
                        if (boughtWahana || boughtJajanan) {
                            return {ok: true, dompet: 0, tabung: t, msg: "Luar Biasa! Belajar (Buku) dapat, bersenang-senang dapat, menabung pun berjalan. Keputusan yang sangat seimbang!"};
                        }
                        return {ok: true, dompet: 0, tabung: t, msg: "Pilihan yang sangat dewasa! Kamu mendahulukan ilmu dan menabung paling banyak. Tapi sekali-sekali kamu boleh bersenang-senang kok!"};
                    }
                    return {ok: true, dompet: 0, tabung: t, msg: "Kamu menabung cukup banyak, tapi sayang kamu melewatkan kesempatan membeli buku yang bagus demi makanan atau hiburan semata."};
                }
            },
            {
                id: 10,
                title: "Dilema Empati (HOTS)",
                scenario: "Kakak butuh uang Rp 25.000 MENDADAK HARI INI! Bersamaan, Jaket Impian diskon HARI INI dari Rp 60.000 jadi Rp 25.000! Kamu hanya mau ambil Rp 30.000 dari celengan. Apa keputusanmu?",
                illustration: `<svg viewBox="0 0 100 100" class="h-full drop-shadow-md">
                    <circle cx="50" cy="50" r="45" fill="#e0e7ff" opacity="0.6"/>
                    <!-- Brother icon -->
                    <circle cx="35" cy="40" r="8" fill="#4f46e5"/>
                    <path d="M25 60 C 25 50, 45 50, 45 60 Z" fill="#4f46e5"/>
                    <!-- Jacket -->
                    <path d="M60 40 L70 35 L80 40 L80 60 L60 60 Z" fill="#db2777"/>
                    <path d="M65 40 L65 60 M75 40 L75 60" stroke="#be185d" stroke-width="2"/>
                    <!-- Exclamation -->
                    <text x="50" y="30" font-size="20" font-weight="900" fill="#dc2626">!?</text>
                </svg>`,
                blocks: [
                    { id: 'ambil_tabungan', text: 'Ambil Tabungan Rp30.000', color: 'bg-blue-100 border-blue-300 text-blue-800', emoji: '🏧' },
                    { id: 'bantu_kakak', text: 'Bantu Kakak Rp25.000', color: 'bg-green-100 border-green-300 text-green-800', emoji: '👨‍👩‍👧‍👦' },
                    { id: 'beli_jaket', text: 'Beli Jaket Impian Rp25.000', color: 'bg-red-100 border-red-300 text-red-800', emoji: '🧥' },
                    { id: 'simpan_sisa', text: 'Simpan Sisa Uang ke Tabungan', color: 'bg-yellow-100 border-yellow-300 text-yellow-800', emoji: '🐷' }
                ],
                validate: (prog) => {
                    let t = 0;
                    if (prog.length === 0 || prog[0] !== 'ambil_tabungan') return {ok: false, msg: "Mulai dengan mengambil uang tabungan!"};
                    if (prog[prog.length-1] !== 'simpan_sisa') return {ok: false, msg: "Langkah terakhir harus menyimpan sisa uang!"};
                    
                    let bantuKakak = false, beliJaket = false;
                    let cash = 30000;
                    
                    for (let i = 1; i < prog.length - 1; i++) {
                        let id = prog[i];
                        if (id === 'bantu_kakak') { cash -= 25000; bantuKakak = true; }
                        else if (id === 'beli_jaket') { cash -= 25000; beliJaket = true; }
                        else return {ok: false, msg: "Pilihan langkah tidak valid."};
                    }
                    
                    if (cash < 0) return {ok: false, msg: "Error! Uang yang kamu ambil hanya Rp30.000, tidak cukup untuk KEDUANYA (butuh Rp 50.000). Kamu harus merelakan salah satu!"};
                    
                    if (!bantuKakak && !beliJaket) {
                        return {ok: false, msg: "Mengambil uang tabungan lalu dikembalikan lagi tanpa melakukan apa-apa? Bantulah kakakmu atau belilah sesuatu."};
                    }
                    
                    t = -30000 + cash; 
                    
                    if (bantuKakak) {
                        return {ok: true, dompet: 0, tabung: t, msg: "🌟 KEPUTUSAN EMAS! Jaket impian bisa ditabung lagi nanti, namun menolong keluarga di saat genting adalah prioritas sejati. Kamu pahlawan finansial hari ini!"};
                    } else if (beliJaket) {
                        return {ok: true, dompet: 0, tabung: t, msg: "🥉 KEPUTUSAN PERUNGGU! Secara finansial sah karena memakai uangmu sendiri untuk barang diskon. Namun, kakakmu sedih tugasnya terancam gagal. Empati kadang lebih penting daripada keinginan."};
                    }
                    
                    return {ok: false, msg: "Strategi tidak dapat diproses."};
                }
            }
        ];
        
        
        const elStart = document.getElementById('startScreen');
        const elBtnStart = document.getElementById('btnStart');
        const elLevel = document.getElementById('levelDisplay');
        const elDompet = document.getElementById('dompetDisplay');
        const elTabungan = document.getElementById('tabunganDisplay');
        const elScenario = document.getElementById('scenarioText');
        const elAvailable = document.getElementById('availableBlocks');
        const elProgram = document.getElementById('programArea');
        const elEmptyMsg = document.getElementById('emptyProgramMsg');
        const elBtnClear = document.getElementById('btnClear');
        const elBtnRun = document.getElementById('btnRun');
        
        const elModal = document.getElementById('feedbackModal');
        const elModalContent = document.getElementById('modalContent');
        const elModalIcon = document.getElementById('modalIcon');
        const elModalTitle = document.getElementById('modalTitle');
        const elModalText = document.getElementById('modalText');
        const elBtnNext = document.getElementById('btnNextLevel');
        const elBtnRetry = document.getElementById('btnRetry');
        const elModalStats = document.getElementById('modalStats');
        const elModalDompet = document.getElementById('modalDompet');
        const elModalTabung = document.getElementById('modalTabungan');

        const elRobot = document.getElementById('robotCharacter');
        const elRobotFace = document.getElementById('robotFace');
        const elRobotChat = document.getElementById('robotChat');
        
        let sortableAvailable = null;
        let sortableProgram = null;

        elBtnStart.addEventListener('click', async () => {
            await Tone.start(); 
            soundEffects.click();
            elStart.style.opacity = '0';
            setTimeout(() => {
                elStart.style.display = 'none';
                initSortable();
                loadLevel(0);
            }, 500);
        });
        
        function updateProgressBar() {
            const pb = document.getElementById('progressBar');
            pb.innerHTML = '';
            for(let i=0; i<10; i++) {
                const dot = document.createElement('div');
                dot.className = `w-2 h-2 rounded-full ${i <= state.level ? 'bg-yellow-300 shadow-[0_0_5px_#fde047]' : 'bg-blue-800 bg-opacity-50'}`;
                pb.appendChild(dot);
            }
        }

        function initSortable() {
            sortableAvailable = new Sortable(elAvailable, {
                group: {
                    name: 'shared',
                    pull: 'clone',
                    put: false
                },
                animation: 150,
                sort: false,
                onStart: function (evt) {
                    soundEffects.click();
                }
            });

            sortableProgram = new Sortable(elProgram, {
                group: 'shared',
                animation: 150,
                ghostClass: 'sortable-ghost',
                dragClass: 'sortable-drag',
                filter: '#emptyProgramMsg',
                onAdd: function (evt) {
                    soundEffects.drop();
                    const blockId = evt.item.dataset.id;
                    evt.item.remove(); // Hapus clone DOM bawaan sortable
                    state.program.splice(evt.newIndex, 0, {id: blockId, uid: Date.now() + Math.random()});
                    renderProgram();
                    setRobotState('thinking', "Menerima langkah baru... 📝");
                },
                onUpdate: function (evt) {
                    soundEffects.drop();
                    const movedItem = state.program.splice(evt.oldIndex, 1)[0];
                    state.program.splice(evt.newIndex, 0, movedItem);
                    renderProgram();
                }
            });
        }

        function loadLevel(index) {
            if (index >= levels.length) {
                showEndScreen();
                return;
            }
            
            state.level = index;
            state.program = [];
            const levelData = levels[index];
            
            elLevel.innerText = levelData.id;
            updateProgressBar();
            
            elScenario.innerHTML = formatScenarioText(levelData.scenario);
            
            const prevDompet = parseInt(elDompet.innerText.replace(/\D/g, '')) || 0;
            const prevTabung = parseInt(elTabungan.innerText.replace(/\D/g, '')) || 0;
            animateValue(elDompet, prevDompet, state.dompet, 500);
            animateValue(elTabungan, prevTabung, state.tabungan, 500);
            checkRobotMood();
            
            const elIllustration = document.getElementById('scenarioIllustration');
            elIllustration.style.opacity = '0';
            elIllustration.style.transform = 'scale(0.8)';
            setTimeout(() => {
                elIllustration.innerHTML = levelData.illustration;
                elIllustration.style.opacity = '1';
                elIllustration.style.transform = 'scale(1)';
            }, 150);
            
            elAvailable.innerHTML = '';
            levelData.blocks.forEach(block => {
                const btn = document.createElement('div');
                btn.className = `puzzle-block code-block-available ${block.color} border-x-2 border-b-4 border-t-2 border-opacity-70 border-b-black/20 cursor-grab flex items-center gap-2 font-bold text-sm shadow-md !mb-2`;
                btn.dataset.id = block.id;
                btn.innerHTML = `<span class="text-xl">${block.emoji}</span> <span>${block.text}</span>`;
                // Untuk klik langsung nambah ke program:
                btn.onclick = () => {
                    if(state.isExecuting) return;
                    soundEffects.click();
                    state.program.push({id: block.id, uid: Date.now() + Math.random()});
                    renderProgram();
                    setRobotState('thinking', "Menerima langkah baru... 📝");
                };
                elAvailable.appendChild(btn);
            });
            
            renderProgram();
            setRobotState('idle', "Bip Bop! Seret langkah ke area bawah...");
        }

        function removeBlockFromProgram(index) {
            if(state.isExecuting) return;
            soundEffects.remove();
            state.program.splice(index, 1);
            renderProgram();
        }

        function renderProgram() {
            const levelData = levels[state.level];
            
            // Remove existing blocks
            Array.from(elProgram.children).forEach(child => {
                if(child.id !== 'emptyProgramMsg') child.remove();
            });
            
            if (state.program.length === 0) {
                elEmptyMsg.style.display = 'flex';
                return;
            }
            
            elEmptyMsg.style.display = 'none';
            
            state.program.forEach((itemData, index) => {
                const blockInfo = levelData.blocks.find(b => b.id === itemData.id);
                const item = document.createElement('div');
                item.className = `puzzle-block code-block ${blockInfo.color} border-x-2 border-b-4 border-t-2 border-opacity-70 border-b-black/20 cursor-grab flex justify-between items-center w-full shadow-md z-[${50-index}]`;
                item.dataset.uid = itemData.uid;
                
                const leftPart = document.createElement('div');
                leftPart.className = "flex items-center gap-2";
                leftPart.innerHTML = `<span class="bg-white bg-opacity-70 w-6 h-6 flex items-center justify-center rounded-full font-black text-xs shadow-inner">${index + 1}</span>
                                      <span class="text-xl">${blockInfo.emoji}</span>
                                      <span class="font-bold text-sm">${blockInfo.text}</span>`;
                
                const rightPart = document.createElement('div');
                rightPart.innerHTML = `<button class="text-slate-500 hover:text-red-500 hover:bg-white hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl px-2 transition-colors">×</button>`;
                rightPart.onclick = (e) => { e.stopPropagation(); removeBlockFromProgram(index); };
                
                item.appendChild(leftPart);
                item.appendChild(rightPart);
                
                elProgram.appendChild(item);
            });
        }

        elBtnClear.addEventListener('click', () => {
            if(state.isExecuting || state.program.length === 0) return;
            soundEffects.remove();
            state.program = [];
            renderProgram();
            setRobotState('idle', "Urutan dihapus. Mari coba lagi!");
        });

        elBtnRun.addEventListener('click', () => {
            if (state.program.length === 0) {
                setRobotState('error', "Bip Bop! Area langkah kosong!");
                soundEffects.error();
                return;
            }
            if (state.isExecuting) return;
            
            state.isExecuting = true;
            soundEffects.run();
            setRobotState('thinking', "Memeriksa urutan... ⚙️");
            
            sortableProgram.option("disabled", true);
            sortableAvailable.option("disabled", true);
            
            const blocks = Array.from(elProgram.children).filter(c => c.id !== 'emptyProgramMsg');
            let i = 0;
            
            function animateNextBlock() {
                if (i < blocks.length) {
                    blocks.forEach(b => {
                        b.classList.remove('glow-yellow', 'glow-green', 'glow-red');
                    });
                    
                    blocks[i].classList.add('glow-yellow');
                    soundEffects.stepTick();
                    
                    // Cek simulasi intermediate jika mau, tapi saat ini kita cek di validate akhir.
                    // Untuk efek memukau, biarkan glow saja.
                    
                    i++;
                    setTimeout(animateNextBlock, 600);
                } else {
                    evaluateProgram(blocks);
                }
            }
            animateNextBlock();
        });

        function evaluateProgram(domBlocks) {
            const levelData = levels[state.level];
            const progIds = state.program.map(p => p.id);
            const result = levelData.validate(progIds);
            
            setTimeout(() => {
                if (result.ok) {
                    // Berhasil
                    domBlocks.forEach(b => { b.classList.remove('glow-yellow'); b.classList.add('glow-green'); });
                    
                    const prevDompet = state.dompet;
                    const prevTabung = state.tabungan;
                    state.dompet += result.dompet || 0;
                    state.tabungan += result.tabung || 0;
                    
                    animateValue(elDompet, prevDompet, state.dompet, 1000);
                    animateValue(elTabungan, prevTabung, state.tabungan, 1000);
                    
                    soundEffects.success();
                    checkRobotMood();
                    
                    let stars = result.stars !== undefined ? result.stars : 3;
                    showModal(true, "Berhasil!", result.msg, result.dompet, result.tabung, stars);
                } else {
                    // Gagal: kedipkan merah di blok terakhir atau semua
                    domBlocks.forEach(b => { b.classList.remove('glow-yellow'); });
                    domBlocks[domBlocks.length-1].classList.add('glow-red');
                    
                    soundEffects.error();
                    setRobotState('error', "Wah, ada yang salah! 🤯");
                    showModal(false, "Urutan Salah 🐛", result.msg, 0, 0, 0);
                }
                state.isExecuting = false;
                sortableProgram.option("disabled", false);
                sortableAvailable.option("disabled", false);
            }, 500);
        }

        function checkRobotMood() {
            if (state.dompet === 0 && state.tabungan === 0) {
                setRobotState('idle', "Aku siap membantu!");
            } else if (state.dompet === 0 && state.level > 1) {
                setRobotState('idle', "Dompet kosong! Untung ada tabungan.");
                elRobotFace.innerText = '😰';
            } else if (state.tabungan > 30000) {
                setRobotState('success', "Tabungan kita banyak sekali!");
                elRobotFace.innerText = '😎';
            } else {
                setRobotState('idle', "Lanjutkan menabung!");
            }
        }

        function setRobotState(condition, message) {
            elRobot.className = 'text-6xl lg:text-8xl filter drop-shadow-xl transition-all duration-300 relative';
            
            if(condition === 'idle') {
                elRobotFace.innerText = '🤖';
                elRobot.classList.add('robot-idle');
            } else if (condition === 'thinking') {
                elRobotFace.innerText = '🧐';
                elRobot.classList.add('animate-pulse');
            } else if (condition === 'success') {
                elRobotFace.innerText = (state.tabungan > 30000) ? '😎' : '🤩';
                elRobot.classList.add('robot-success');
            } else if (condition === 'error') {
                elRobotFace.innerText = '🤯';
                elRobot.classList.add('robot-error');
            }

            elRobotChat.innerHTML = message + 
            `<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-slate-200 rotate-45 hidden lg:block"></div>
             <div class="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-white border-b-2 border-l-2 border-slate-200 rotate-45 lg:hidden"></div>`;
            
            elRobotChat.style.opacity = '1';
            
            if(condition === 'error' || condition === 'success') {
                setTimeout(() => elRobotChat.style.opacity = '0', 4000);
            }
        }

        function showModal(isSuccess, title, text, diffDompet, diffTabung, starsCount) {
            elModal.classList.remove('hidden');
            setTimeout(() => {
                elModalContent.classList.remove('scale-90', 'opacity-0');
                elModalContent.classList.add('scale-100', 'opacity-100');
            }, 10);

            elModalTitle.innerText = title;
            elModalText.innerHTML = formatScenarioText(text);
            
            const starCont = document.getElementById('starContainer');
            const star1 = document.getElementById('star1');
            const star2 = document.getElementById('star2');
            const star3 = document.getElementById('star3');
            
            star1.className = 'text-slate-300 transition-colors duration-500';
            star2.className = 'text-slate-300 transition-colors duration-500 delay-150';
            star3.className = 'text-slate-300 transition-colors duration-500 delay-300';

            if (isSuccess) {
                elModalIcon.classList.add('hidden');
                starCont.classList.remove('hidden');
                
                // Animate stars
                setTimeout(() => {
                    if(starsCount >= 1) { star1.classList.replace('text-slate-300', 'text-yellow-400'); soundEffects.star(); }
                }, 300);
                setTimeout(() => {
                    if(starsCount >= 2) { star2.classList.replace('text-slate-300', 'text-yellow-400'); soundEffects.star(); }
                }, 700);
                setTimeout(() => {
                    if(starsCount >= 3) { star3.classList.replace('text-slate-300', 'text-yellow-400'); soundEffects.star(); }
                }, 1100);

                elModalTitle.className = "font-heading text-2xl text-center mb-2 text-green-600";
                elBtnNext.classList.remove('hidden');
                elBtnRetry.classList.add('hidden');
                
                if((diffDompet && diffDompet !== 0) || (diffTabung && diffTabung !== 0)) {
                    elModalStats.classList.remove('hidden');
                    elModalDompet.innerText = (diffDompet > 0 ? '+' : '') + formatRp(diffDompet);
                    elModalDompet.className = diffDompet >= 0 ? 'text-green-600 text-lg font-bold' : 'text-red-600 text-lg font-bold';
                    elModalTabung.innerText = (diffTabung > 0 ? '+' : '') + formatRp(diffTabung);
                    elModalTabung.className = diffTabung >= 0 ? 'text-green-600 text-lg font-bold' : 'text-red-600 text-lg font-bold';
                } else {
                    elModalStats.classList.add('hidden');
                }
                
                // Show and Animate Map
                const mapEl = document.getElementById('modalLevelMap');
                const dotsEl = document.getElementById('modalMapDots');
                const progEl = document.getElementById('modalMapProgress');
                const avatarEl = document.getElementById('modalMapAvatar');
                
                mapEl.classList.remove('hidden');
                if(dotsEl.children.length === 0) {
                    for(let i=0; i<10; i++) {
                        const dot = document.createElement('div');
                        dotsEl.appendChild(dot);
                    }
                }
                
                // Set initial position
                const startRatio = state.level / 9;
                progEl.style.transition = 'none';
                avatarEl.style.transition = 'none';
                progEl.style.width = `calc(${startRatio * 100}% - ${startRatio * 2}rem)`;
                avatarEl.style.left = `calc(1rem + ${startRatio * 100}% - ${startRatio * 2}rem)`;
                avatarEl.innerText = '🚶';
                
                // Color dots up to current
                Array.from(dotsEl.children).forEach((d, i) => {
                    d.className = `w-3 h-3 rounded-full border-2 border-white transition-colors duration-500 ${i <= state.level ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-300'}`;
                });
                
                // Animate to next level (if not last)
                if (state.level < 9) {
                    setTimeout(() => {
                        progEl.style.transition = 'all 1s ease-in-out';
                        avatarEl.style.transition = 'all 1s ease-in-out';
                        avatarEl.innerText = '🏃';
                        
                        const endRatio = (state.level + 1) / 9;
                        progEl.style.width = `calc(${endRatio * 100}% - ${endRatio * 2}rem)`;
                        avatarEl.style.left = `calc(1rem + ${endRatio * 100}% - ${endRatio * 2}rem)`;
                        
                        setTimeout(() => {
                            dotsEl.children[state.level + 1].classList.replace('bg-slate-300', 'bg-green-500');
                            dotsEl.children[state.level + 1].classList.add('shadow-[0_0_5px_#22c55e]');
                            avatarEl.innerText = '🎉';
                        }, 900);
                    }, 1500); // Wait for stars animation
                }
            } else {
                elModalIcon.classList.remove('hidden');
                starCont.classList.add('hidden');
                elModalIcon.innerText = '🐛';
                elModalTitle.className = "font-heading text-2xl text-center mb-2 text-red-600";
                elBtnNext.classList.add('hidden');
                elBtnRetry.classList.remove('hidden');
                elModalStats.classList.add('hidden');
            }
        }

        function hideModal() {
            elModalContent.classList.remove('scale-100');
            elModalContent.classList.add('scale-90');
            setTimeout(() => {
                elModal.classList.add('hidden');
            }, 300);
        }

        elBtnNext.addEventListener('click', () => {
            soundEffects.click();
            hideModal();
            loadLevel(state.level + 1);
        });

        elBtnRetry.addEventListener('click', () => {
            soundEffects.click();
            hideModal();
            setRobotState('idle', "Ayo perbaiki urutan langkahnya! 🤖");
        });
        
        function showEndScreen() {
            elStart.style.display = 'flex';
            elStart.style.opacity = '1';
            elStart.innerHTML = `
            <div class="text-center bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-4 border-yellow-400">
                <div class="text-8xl mb-4 robot-success">🏆</div>
                <h1 class="text-3xl text-yellow-600 mb-2 font-heading">TAMAT!</h1>
                <p class="text-slate-600 mb-6 font-bold">Kamu telah lulus ujian pengelolaan keuangan dan menabung dengan total tabungan ${formatRp(state.tabungan)}!</p>
                <button onclick="location.reload()" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-heading text-xl py-4 rounded-2xl shadow-[0_6px_0_#1e3a8a] active:shadow-none active:translate-y-[6px] transition-all">
                    MAIN LAGI ↻
                </button>
            </div>`;
        }
    