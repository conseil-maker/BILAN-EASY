/**
 * Traductions turques des questions de fallback
 * Mapping: ID de question FR → { title, description, theme, category }
 * 
 * Utilisé par selectFallbackQuestion quand la langue est 'tr'
 */

export interface FallbackTranslation {
  title: string;
  description: string;
  theme?: string;
  category?: string;
}

export const FALLBACK_TRANSLATIONS_TR: Record<string, FallbackTranslation> = {
  // ============================================
  // PHASE 1 - ÖN AŞAMA
  // ============================================

  // Kariyer yolculuğu
  fallback_parcours_1: {
    title: "Kariyer yolculuğunuzu birkaç cümleyle anlatabilir misiniz?",
    description: "Kariyeriniz, önemli aşamalar ve sizi buraya getiren süreç hakkında bilgi verin.",
    theme: "Kariyer yolculuğu",
    category: "Kariyer yolculuğu"
  },
  fallback_parcours_2: {
    title: "Mevcut pozisyonunuz nedir ve başlıca sorumluluklarınız nelerdir?",
    description: "Mevcut rolünüzü, günlük görevlerinizi ve üzerinde çalıştığınız projeleri anlatın.",
    theme: "Kariyer yolculuğu",
    category: "Kariyer yolculuğu"
  },
  fallback_parcours_3: {
    title: "Sizi mevcut faaliyet alanınıza çeken ne oldu?",
    description: "Mesleğinizde sizi tutkuyla bağlayan ve bu yolu seçmenize neden olan şeylerden bahsedin.",
    theme: "Kariyer yolculuğu",
    category: "Kariyer yolculuğu"
  },
  fallback_parcours_4: {
    title: "Kariyerinizdeki önemli geçişler nelerdi?",
    description: "Yön değiştirdiğiniz, şirket veya sektör değiştirdiğiniz dönüm noktalarını anlatın.",
    theme: "Kariyer yolculuğu",
    category: "Kariyer yolculuğu"
  },
  fallback_parcours_5: {
    title: "Hangi eğitimi aldınız ve bu eğitim kariyerinizi nasıl etkiledi?",
    description: "Eğitiminiz ve mesleki tercihleriniz üzerindeki etkisinden bahsedin.",
    theme: "Kariyer yolculuğu",
    category: "Kariyer yolculuğu"
  },

  // Teknik yetkinlikler
  fallback_competences_1: {
    title: "Başlıca teknik yetkinlikleriniz nelerdir?",
    description: "En iyi bildiğiniz ve düzenli olarak kullandığınız teknik yetkinlikleri listeleyin.",
    theme: "Teknik yetkinlikler",
    category: "Teknik yetkinlikler"
  },
  fallback_competences_2: {
    title: "Yetkinlikleriniz arasında hangilerini daha fazla geliştirmek istersiniz?",
    description: "Mesleki gelişiminiz için derinleştirmek veya edinmek istediğiniz yetkinlikleri belirleyin.",
    theme: "Teknik yetkinlikler",
    category: "Teknik yetkinlikler"
  },
  fallback_competences_3: {
    title: "Alanınızda hangi araç veya yazılımları kullanıyorsunuz?",
    description: "Günlük olarak kullandığınız dijital araçları, yazılımları veya teknolojileri listeleyin.",
    theme: "Teknik yetkinlikler",
    category: "Teknik yetkinlikler"
  },
  fallback_competences_4: {
    title: "Sertifikalarınız veya ek eğitimleriniz var mı?",
    description: "Aldığınız sürekli eğitimler, sertifikalar veya diplomalardan bahsedin.",
    theme: "Teknik yetkinlikler",
    category: "Teknik yetkinlikler"
  },
  fallback_competences_5: {
    title: "Uzmanlık alanınızdaki yetkinlik seviyenizi nasıl değerlendirirsiniz?",
    description: "Başlangıçtan uzmana kadar bir ölçekte kendinizi nerede konumlandırıyorsunuz ve neden?",
    theme: "Teknik yetkinlikler",
    category: "Teknik yetkinlikler"
  },

  // Değerlendirme beklentileri
  fallback_attentes_1: {
    title: "Bu yetkinlik değerlendirmesinden ne bekliyorsunuz?",
    description: "Hedeflerinizi ve bu değerlendirme sonucunda elde etmeyi umduğunuz şeyleri anlatın.",
    theme: "Beklentiler",
    category: "Değerlendirme beklentileri"
  },
  fallback_attentes_2: {
    title: "Bu değerlendirmeyi şimdi yapmaya sizi ne motive etti?",
    description: "Bu süreci başlatmanıza neden olan bağlam ve nedenlerden bahsedin.",
    theme: "Beklentiler",
    category: "Değerlendirme beklentileri"
  },
  fallback_attentes_3: {
    title: "Mesleki durumunuzun keşfetmek istediğiniz belirli yönleri var mı?",
    description: "Sizi özellikle ilgilendiren konuları veya soruları belirleyin.",
    theme: "Beklentiler",
    category: "Değerlendirme beklentileri"
  },

  // ============================================
  // PHASE 2 - ARAŞTIRMA
  // ============================================

  // Motivasyonlar
  fallback_motivations_1: {
    title: "Günlük işinizde sizi en çok motive eden ne?",
    description: "Size enerji veren ve sizi tatmin eden iş yönlerinden bahsedin.",
    theme: "Motivasyonlar",
    category: "Motivasyonlar"
  },
  fallback_motivations_2: {
    title: "İdeal bir pozisyon için temel kriterleriniz nelerdir?",
    description: "Bir sonraki pozisyonunuzda veya mesleki projenizde aradığınız vazgeçilmez unsurları anlatın.",
    theme: "Motivasyonlar",
    category: "Motivasyonlar"
  },
  fallback_motivations_3: {
    title: "Mevcut işinizde sizi ne demotive ediyor veya hayal kırıklığına uğratıyor?",
    description: "Mesleki durumunuzun sizi zorlayan veya engelleyen yönlerini belirleyin.",
    theme: "Motivasyonlar",
    category: "Motivasyonlar"
  },
  fallback_motivations_4: {
    title: "Size en uygun çalışma ortamı nasıl olurdu?",
    description: "İdeal atmosfer, şirket kültürü ve çalışma koşullarını anlatın.",
    theme: "Motivasyonlar",
    category: "Motivasyonlar"
  },
  fallback_motivations_5: {
    title: "Ekip halinde mi yoksa bağımsız mı çalışmayı tercih edersiniz?",
    description: "Tercih ettiğiniz çalışma şeklinizi açıklayın ve örnekler verin.",
    theme: "Motivasyonlar",
    category: "Motivasyonlar"
  },

  // Değerler
  fallback_valeurs_1: {
    title: "Sizin için en önemli mesleki değerler nelerdir?",
    description: "Mesleki tercihlerinizi ve çalışma şeklinizi yönlendiren değerleri belirleyin.",
    theme: "Değerler",
    category: "Değerler"
  },
  fallback_valeurs_2: {
    title: "Bu değerler mevcut işinize nasıl yansıyor?",
    description: "Değerlerinizin kararlarınızı veya eylemlerinizi yönlendirdiği somut durumlardan örnekler verin.",
    theme: "Değerler",
    category: "Değerler"
  },
  fallback_valeurs_3: {
    title: "Mesleki hayatınızda daha fazla ifade etmek istediğiniz değerler var mı?",
    description: "Şu anda tam olarak yaşayamadığınız değerleri belirleyin.",
    theme: "Değerler",
    category: "Değerler"
  },
  fallback_valeurs_4: {
    title: "İş-yaşam dengesine ne kadar önem veriyorsunuz?",
    description: "Bu dengeyi nasıl yönettiğinizi ve neleri iyileştirmek istediğinizi anlatın.",
    theme: "Değerler",
    category: "Değerler"
  },
  fallback_valeurs_5: {
    title: "Bir işveren seçerken etik ve sosyal sorumluluk sizin için önemli mi?",
    description: "Bu konulardaki tutumunuzu ve mesleki tercihleriniz üzerindeki etkisini açıklayın.",
    theme: "Değerler",
    category: "Değerler"
  },

  // Başarılar
  fallback_realisations_1: {
    title: "En çok gurur duyduğunuz mesleki başarınız hangisi?",
    description: "Sizi özellikle etkileyen ve gurur duyduğunuz bir proje veya başarıyı anlatın.",
    theme: "Başarılar",
    category: "Başarılar"
  },
  fallback_realisations_2: {
    title: "Kariyerinizde hangi zorlukların üstesinden geldiniz?",
    description: "Karşılaştığınız engelleri ve bunları nasıl aştığınızı anlatın.",
    theme: "Başarılar",
    category: "Başarılar"
  },
  fallback_realisations_3: {
    title: "Baştan sona yönettiğiniz bir projeyi anlatabilir misiniz?",
    description: "Aşamaları, karşılaşılan zorlukları ve elde edilen sonuçları detaylandırın.",
    theme: "Başarılar",
    category: "Başarılar"
  },
  fallback_realisations_4: {
    title: "Hiç bir kriz veya acil durum yönetmek zorunda kaldınız mı? Nasıl yönettiniz?",
    description: "Zor bir durumu ve aldığınız aksiyonları anlatın.",
    theme: "Başarılar",
    category: "Başarılar"
  },
  fallback_realisations_5: {
    title: "Ekibinize veya şirketinize yaptığınız ve özellikle memnun olduğunuz katkı nedir?",
    description: "Çalışma ortamınız üzerinde yarattığınız olumlu bir etkiden bahsedin.",
    theme: "Başarılar",
    category: "Başarılar"
  },

  // Profesyonel proje
  fallback_projet_1: {
    title: "2-3 yıl sonra kendinizi mesleki olarak nerede görüyorsunuz?",
    description: "Orta vadeli mesleki gelişim vizyonunuzu anlatın.",
    theme: "Profesyonel proje",
    category: "Profesyonel proje"
  },
  fallback_projet_2: {
    title: "Mesleki projenizi gerçekleştirmenin önündeki potansiyel engeller nelerdir?",
    description: "Gelişiminizde karşılaşabileceğiniz frenleri veya zorlukları belirleyin.",
    theme: "Profesyonel proje",
    category: "Profesyonel proje"
  },
  fallback_projet_3: {
    title: "Kariyer değişikliği düşündünüz mü? Evetse, hangi alana doğru?",
    description: "Olası bir kariyer değişikliği hakkındaki düşüncelerinizden bahsedin.",
    theme: "Profesyonel proje",
    category: "Profesyonel proje"
  },
  fallback_projet_4: {
    title: "Projenizi gerçekleştirmek için hangi kaynaklara sahipsiniz?",
    description: "Avantajlarınızı belirleyin: ağ, yetkinlikler, finans, zaman, aile desteği...",
    theme: "Profesyonel proje",
    category: "Profesyonel proje"
  },
  fallback_projet_5: {
    title: "Hiçbir kısıtlamanız olmasaydı ideal mesleğiniz ne olurdu?",
    description: "Hayal gücünüzü serbest bırakın ve hayalinizdeki işi anlatın.",
    theme: "Profesyonel proje",
    category: "Profesyonel proje"
  },

  // Yatay yetkinlikler
  fallback_transversales_1: {
    title: "Farklı muhataplarla iletişim kurma becerinizi nasıl tanımlarsınız?",
    description: "İletişiminizi uyarlamanız gereken durumlardan örnekler verin.",
    theme: "Yatay yetkinlikler",
    category: "Yatay yetkinlikler"
  },
  fallback_transversales_2: {
    title: "İşte stres ve baskıyı nasıl yönetiyorsunuz?",
    description: "Zor anlarda etkili kalma stratejilerinizi anlatın.",
    theme: "Yatay yetkinlikler",
    category: "Yatay yetkinlikler"
  },
  fallback_transversales_3: {
    title: "Hiç bir ekip yönetmek zorunda kaldınız mı? Yönetim tarzınızı nasıl tanımlarsınız?",
    description: "Liderlik deneyiminizden ve yaklaşımınızdan bahsedin.",
    theme: "Yatay yetkinlikler",
    category: "Yatay yetkinlikler"
  },
  fallback_transversales_4: {
    title: "Çalışma ortamınızdaki değişikliklere nasıl uyum sağlıyorsunuz?",
    description: "Hızla uyum sağlamanız gereken durumlardan örnekler verin.",
    theme: "Yatay yetkinlikler",
    category: "Yatay yetkinlikler"
  },
  fallback_transversales_5: {
    title: "İşinizi nasıl organize ediyorsunuz ve önceliklerinizi nasıl yönetiyorsunuz?",
    description: "Organizasyon ve zaman yönetimi yöntemlerinizi anlatın.",
    theme: "Yatay yetkinlikler",
    category: "Yatay yetkinlikler"
  },

  // İlgi alanları ve tutkular
  fallback_interets_1: {
    title: "İş dışındaki ilgi alanlarınız nelerdir?",
    description: "Hobilerinden, tutkularınızdan ve boş zaman aktivitelerinizden bahsedin.",
    theme: "İlgi alanları",
    category: "İlgi alanları ve tutkular"
  },
  fallback_interets_2: {
    title: "Hobilerinde geliştirdiğiniz ve mesleki olarak faydalı olabilecek yetkinlikler var mı?",
    description: "Tutkularınız ve mesleki hayatınız arasındaki bağlantıları belirleyin.",
    theme: "İlgi alanları",
    category: "İlgi alanları ve tutkular"
  },
  fallback_interets_3: {
    title: "Hangi konular veya alanlar sizi tutkuyla bağlıyor ve eğitim almayı seviyorsunuz?",
    description: "Entelektüel merakınızdan ve son öğrenmelerinizden bahsedin.",
    theme: "İlgi alanları",
    category: "İlgi alanları ve tutkular"
  },

  // ============================================
  // PHASE 3 - SONUÇ
  // ============================================

  // Özet
  fallback_synthese_1: {
    title: "Bu değerlendirmeden şu ana kadar çıkardığınız başlıca dersler nelerdir?",
    description: "Kendiniz hakkında keşfettiğiniz veya doğruladığınız şeyleri değerlendirin.",
    theme: "Özet",
    category: "Özet"
  },
  fallback_synthese_2: {
    title: "Bu değerlendirme sonrasında hangi somut eylemleri hayata geçirmeyi düşünüyorsunuz?",
    description: "Projenizi somutlaştırmak için atmak istediğiniz ilk adımları belirleyin.",
    theme: "Özet",
    category: "Özet"
  },
  fallback_synthese_3: {
    title: "Belirlediğiniz ve öne çıkarmak istediğiniz güçlü yönleriniz nelerdir?",
    description: "Katma değerinizi oluşturan başlıca avantajlarınızı listeleyin.",
    theme: "Özet",
    category: "Özet"
  },
  fallback_synthese_4: {
    title: "Üzerinde çalışmak istediğiniz gelişim alanları nelerdir?",
    description: "Hedeflerinize ulaşmak için iyileştirilmesi gereken yetkinlikleri veya yönleri belirleyin.",
    theme: "Özet",
    category: "Özet"
  },
  fallback_synthese_5: {
    title: "Hedeflerinize doğru ilerlemenizi nasıl ölçeceksiniz?",
    description: "İlerlemenizi takip etmek için somut göstergeler belirleyin.",
    theme: "Özet",
    category: "Özet"
  },

  // Eylem planı
  fallback_plan_1: {
    title: "Önümüzdeki ay içinde atacağınız ilk üç adım nedir?",
    description: "Kısa vadede somut ve gerçekleştirilebilir eylemler belirleyin.",
    theme: "Eylem planı",
    category: "Eylem planı"
  },
  fallback_plan_2: {
    title: "Projenizi başarıyla gerçekleştirmek için hangi destek veya eşliğe ihtiyacınız olurdu?",
    description: "Size yardımcı olabilecek dış kaynakları belirleyin.",
    theme: "Eylem planı",
    category: "Eylem planı"
  },
  fallback_plan_3: {
    title: "Potansiyel riskler nelerdir ve bunları nasıl öngörmeyi planlıyorsunuz?",
    description: "Olası engelleri ve bunları aşma stratejilerinizi belirleyin.",
    theme: "Eylem planı",
    category: "Eylem planı"
  },
  fallback_plan_4: {
    title: "Önümüzdeki 6 ay için öngörülen takviminiz nedir?",
    description: "Projenizin büyük aşamalarını içeren bir plan oluşturun.",
    theme: "Eylem planı",
    category: "Eylem planı"
  },
  fallback_plan_5: {
    title: "Bu süreç boyunca motivasyonunuzu nasıl koruyacaksınız?",
    description: "Motivasyon kaynaklarınızı ve bağlı kalma stratejilerinizi belirleyin.",
    theme: "Eylem planı",
    category: "Eylem planı"
  },

  // Son değerlendirme
  fallback_bilan_1: {
    title: "Mesleki projenizi tek bir cümleyle nasıl özetlersiniz?",
    description: "Hedefinizi net ve özlü bir şekilde formüle edin.",
    theme: "Son değerlendirme",
    category: "Son değerlendirme"
  },
  fallback_bilan_2: {
    title: "Bu değerlendirme sayesinde kendiniz hakkında ne öğrendiniz?",
    description: "Önemli keşiflerinizi veya farkındalıklarınızı paylaşın.",
    theme: "Son değerlendirme",
    category: "Son değerlendirme"
  },
  fallback_bilan_3: {
    title: "Yetkinlik değerlendirmesine başlayan birine ne tavsiye edersiniz?",
    description: "Deneyiminizi ve önerilerinizi paylaşın.",
    theme: "Son değerlendirme",
    category: "Son değerlendirme"
  }
};
