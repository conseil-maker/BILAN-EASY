import jsPDF from 'jspdf';
import { organizationConfig, getFullAddress } from '../config/organization';
import i18n from '../i18n';

const tDoc = (fr: string, tr: string): string => (i18n.language || 'fr') === 'tr' ? tr : fr;
const dateFmt = (): string => (i18n.language || 'fr') === 'tr' ? 'tr-TR' : 'fr-FR';

export interface ConventionData {
  clientName: string;
  clientEmail: string;
  clientAddress?: string;
  packageName: string;
  packageDuration: number; // en heures
  packagePrice: number;
  startDate: string;
  consultantName: string;
  consultantEmail: string;
  organizationName: string;
  organizationAddress: string;
  organizationSiret: string;
}

export interface AttestationData {
  clientName: string;
  packageName: string;
  packageDuration: number;
  startDate: string;
  endDate: string;
  consultantName: string;
  organizationName: string;
}

export const qualiopiDocuments = {
  /**
   * Génère la convention de prestation conforme Qualiopi
   */
  generateConvention(data: ConventionData): Blob {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    // Helper pour ajouter du texte
    const addText = (text: string, fontSize: number = 11, isBold: boolean = false, align: 'left' | 'center' | 'right' = 'left') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        if (align === 'center') {
          doc.text(line, pageWidth / 2, y, { align: 'center' });
        } else if (align === 'right') {
          doc.text(line, pageWidth - margin, y, { align: 'right' });
        } else {
          doc.text(line, margin, y);
        }
        
        y += fontSize * 0.5;
      });
      y += 3;
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y - 5, maxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
    };

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc('CONVENTION DE PRESTATION', 'HİZMET SÖZLEŞMESİ'), pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(tDoc('Bilan de Compétences', 'Yetkinlik Değerlendirmesi'), pageWidth / 2, 25, { align: 'center' });
    
    y = 45;
    doc.setTextColor(0, 0, 0);

    // Article 1 : Objet
    addSection(tDoc('ARTICLE 1 : OBJET DE LA CONVENTION', 'MADDE 1: SÖZLEŞMENİN KONUSU'));
    addText(tDoc(`La présente convention a pour objet la réalisation d'un bilan de compétences conformément aux articles L.6313-1 et suivants du Code du travail.`, `Bu sözleşme, İş Kanunu'nun L.6313-1 ve devamı maddeleri uyarınca yetkinlik değerlendirmesi gerçekleştirilmesini konu almaktadır.`));
    addText(tDoc(`Parcours choisi : ${data.packageName}`, `Seçilen paket: ${data.packageName}`));
    addText(tDoc(`Durée totale : ${data.packageDuration} heures maximum`, `Toplam süre: Maksimum ${data.packageDuration} saat`));
    addText(tDoc(`Date de début : ${data.startDate}`, `Başlangıç tarihi: ${data.startDate}`));

    // Article 2 : Parties
    addSection(tDoc('ARTICLE 2 : PARTIES CONTRACTANTES', 'MADDE 2: SÖZLEŞME TARAFLARI'));
    addText(tDoc('Entre :', 'Taraflar:'), 11, true);
    addText(`${data.organizationName}`);
    addText(`${tDoc('Adresse', 'Adres')} : ${data.organizationAddress}`);
    addText(`SIRET : ${data.organizationSiret}`);
    addText(`${tDoc('Représenté par', 'Temsil eden')} : ${data.consultantName}`);
    addText(`Email : ${data.consultantEmail}`);
    y += 5;
    addText(tDoc('Et :', 'Ve:'), 11, true);
    addText(`${data.clientName}`);
    addText(`Email : ${data.clientEmail}`);
    if (data.clientAddress) {
      addText(`${tDoc('Adresse', 'Adres')} : ${data.clientAddress}`);
    }

    // Article 3 : Déroulement
    addSection(tDoc('ARTICLE 3 : DÉROULEMENT DU BILAN', 'MADDE 3: DEĞERLENDİRME SÜRECİ'));
    addText(tDoc('Le bilan de compétences comprend obligatoirement trois phases :', 'Yetkinlik değerlendirmesi zorunlu olarak üç aşamadan oluşur:'));
    addText(tDoc('1. Phase préliminaire : Analyse du besoin et définition des objectifs (environ 17% du temps)', '1. Ön aşama: İhtiyaç analizi ve hedeflerin belirlenmesi (sürenin yaklaşık %17\'si)'));
    addText(tDoc('2. Phase d\'investigation : Élaboration du projet professionnel (environ 50% du temps)', '2. Araştırma aşaması: Mesleki projenin oluşturulması (sürenin yaklaşık %50\'si)'));
    addText(tDoc('3. Phase de conclusion : Restitution et plan d\'action (environ 17% du temps)', '3. Sonuç aşaması: Sonuçların sunulması ve eylem planı (sürenin yaklaşık %17\'si)'));
    y += 3;
    addText(tDoc('Le bénéficiaire peut interrompre le bilan à tout moment. Les résultats sont confidentiels et ne peuvent être communiqués à un tiers qu\'avec l\'accord du bénéficiaire.', 'Yararlanıcı değerlendirmeyi istediği zaman durdurabilir. Sonuçlar gizlidir ve yararlanıcının onayı olmadan üçüncü taraflara iletilemez.'));

    // Article 4 : Moyens
addSection(tDoc('ARTICLE 4 : MOYENS MIS EN ŒUVRE', 'MADDE 4: SAĞLANAN KAYNAKLAR'));
    addText(tDoc('Le prestataire met à disposition :', 'Hizmet sağlayıcı aşağıdakileri sunar:'));
    addText(tDoc('- Un consultant certifié en bilan de compétences', '- Sertifikalı yetkinlik değerlendirme danışmanı'));
    addText(tDoc('- Une plateforme numérique sécurisée (Bilan-Easy)', '- Güvenli dijital platform (Bilan-Easy)'));
    addText(tDoc('- Des outils d\'\u00e9valuation et d\'analyse', '- Değerlendirme ve analiz araçları'));
    addText(tDoc('- Une base de données métiers et formations', '- Meslek ve eğitim veritabanı'));
    addText(tDoc('- Un document de synthèse personnalisé', '- Kişisel özet belgesi'));

    // Article 5 : Livrables
addSection(tDoc('ARTICLE 5 : LIVRABLES', 'MADDE 5: TESLİMATLAR'));
    addText(tDoc('\u00c0 l\'issue du bilan, le bénéficiaire recevra :', 'Değerlendirme sonunda yararlanıcıya verilecekler:'));
    addText(tDoc('- Un document de synthèse détaillé', '- Ayrıntılı özet belgesi'));
    addText(tDoc('- Un plan d\'action personnalisé', '- Kişisel eylem planı'));
    addText(tDoc('- Une attestation de présence', '- Katılım belgesi'));
    addText(tDoc('- L\'accès à l\'historique complet de son parcours', '- Sürecin tam geçmişine erişim'));

    // Article 6 : Tarifs
    addSection(tDoc('ARTICLE 6 : TARIFS ET MODALITÉS DE PAIEMENT', 'MADDE 6: ÜCRETLER VE ÖDEME KOŞULLARI'));
    addText(tDoc(`Coût total du bilan : ${data.packagePrice}€ TTC`, `Toplam ücret: ${data.packagePrice}€ (KDV dahil)`));
    addText(tDoc('Modalités de paiement : Selon les conditions convenues avec le financeur (CPF, OPCO, employeur, etc.)', 'Ödeme koşulları: Finansman sağlayıcı ile kararlaştırılan koşullara göre (CPF, OPCO, işveren vb.)'));

    // Article 7 : Confidentialité
    addSection(tDoc('ARTICLE 7 : CONFIDENTIALITÉ', 'MADDE 7: GİZLİLİK'));
    addText(tDoc('Les résultats du bilan sont la propriété exclusive du bénéficiaire. Ils ne peuvent être communiqués à un tiers (employeur, financeur, etc.) qu\'avec l\'accord écrit du bénéficiaire.', 'Değerlendirme sonuçları yalnızca yararlanıcıya aittir. Yararlanıcının yazılı onayı olmadan üçüncü taraflara (işveren, finansman sağlayıcı vb.) iletilemez.'));
    addText(tDoc('Le prestataire s\'engage à respecter la confidentialité des échanges et des données personnelles conformément au RGPD.', 'Hizmet sağlayıcı, KVKK kapsamında görüşmelerin ve kişisel verilerin gizliliğine uymayı taahhüt eder.'));

    // Article 8 : Annulation
    addSection(tDoc('ARTICLE 8 : ANNULATION ET INTERRUPTION', 'MADDE 8: İPTAL VE KESME'));
    addText(tDoc('Le bénéficiaire peut interrompre le bilan à tout moment. En cas d\'interruption, seules les heures effectivement réalisées seront facturées.', 'Yararlanıcı değerlendirmeyi istediği zaman durdurabilir. Kesme durumunda yalnızca gerçekleştirilen saatler faturalandırılır.'));
    addText(tDoc('En cas d\'absence non justifiée à deux rendez-vous consécutifs, le prestataire se réserve le droit de mettre fin à la prestation.', 'Ardı ardına iki randevuya mazeretsiz katılmama durumunda, hizmet sağlayıcı hizmeti sonlandırma hakkını saklı tutar.'));

    // Signatures
    y += 10;
    addText(tDoc('Fait en deux exemplaires originaux', 'İki asıl nüsha olarak düzenlendi'), 11, false, 'center');
    addText(`${tDoc('Le', '')} ${new Date().toLocaleDateString(dateFmt())}`, 11, false, 'center');
    
    y += 15;
    const signatureY = y;
    
    // Signature prestataire
    doc.text(tDoc('Le prestataire', 'Hizmet sağlayıcı'), margin + 20, signatureY);
    doc.text(data.consultantName, margin + 20, signatureY + 20);
    doc.line(margin, signatureY + 15, margin + 60, signatureY + 15);
    
    // Signature bénéficiaire
    doc.text(tDoc('Le bénéficiaire', 'Yararlanıcı'), pageWidth - margin - 60, signatureY);
    doc.text(data.clientName, pageWidth - margin - 60, signatureY + 20);
    doc.line(pageWidth - margin - 60, signatureY + 15, pageWidth - margin, signatureY + 15);

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(tDoc('Convention de prestation - Bilan de compétences conforme Qualiopi', 'Hizmet sözleşmesi - Qualiopi uyumlu yetkinlik değerlendirmesi'), pageWidth / 2, 285, { align: 'center' });

    return doc.output('blob');
  },

  /**
   * Génère l'attestation de présence conforme Qualiopi
   */
  generateAttestation(data: AttestationData): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 60;

    // Bordure décorative
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc('ATTESTATION DE PRÉSENCE', 'KATILIM BELGESİ'), pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text(tDoc('Bilan de Compétences', 'Yetkinlik Değerlendirmesi'), pageWidth / 2, 35, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    y = 70;

    // Corps de l'attestation
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const text1 = tDoc(`Je soussigné(e), ${data.consultantName}, consultant(e) en bilan de compétences pour ${data.organizationName},`, `Aşağıda imzası bulunan ${data.consultantName}, ${data.organizationName} yetkinlik değerlendirme danışmanı,`);
    const lines1 = doc.splitTextToSize(text1, pageWidth - 60);
    lines1.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 7;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc('ATTESTE QUE', 'TASDİK EDER Kİ'), pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const text2 = tDoc(`a suivi et complété un bilan de compétences dans le cadre du parcours "${data.packageName}"`, `"${data.packageName}" paketi kapsamında yetkinlik değerlendirmesini takip etmiş ve tamamlamıştır`);
    const lines2 = doc.splitTextToSize(text2, pageWidth - 60);
    lines2.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 7;
    });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc(`Durée totale : ${data.packageDuration} heures`, `Toplam süre: ${data.packageDuration} saat`), pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.text(tDoc(`Période : du ${data.startDate} au ${data.endDate}`, `Dönem: ${data.startDate} - ${data.endDate}`), pageWidth / 2, y, { align: 'center' });

    y += 20;
    doc.setFont('helvetica', 'normal');
    const text3 = tDoc('Ce bilan de compétences a été réalisé conformément aux articles L.6313-1 et suivants du Code du travail et au référentiel national qualité Qualiopi.', 'Bu yetkinlik değerlendirmesi, İş Kanunu\'nun L.6313-1 ve devamı maddeleri ile Qualiopi ulusal kalite referansına uygun olarak gerçekleştirilmiştir.');
    const lines3 = doc.splitTextToSize(text3, pageWidth - 60);
    lines3.forEach((line: string) => {
      doc.text(line, pageWidth / 2, y, { align: 'center' });
      y += 7;
    });

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc('Le bénéficiaire a reçu :', 'Yararlanıcıya teslim edilenler:'), pageWidth / 2, y, { align: 'center' });
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text(tDoc('- Un document de synthèse détaillé', '- Ayrıntılı özet belgesi'), pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.text(tDoc('- Un plan d\'action personnalisé', '- Kişisel eylem planı'), pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.text(tDoc('- L\'accès à son historique complet', '- Tam geçmişe erişim'), pageWidth / 2, y, { align: 'center' });

    // Signature
    y += 30;
    doc.setFont('helvetica', 'normal');
    doc.text(tDoc(`Fait à ${data.organizationName}`, `${data.organizationName}'de düzenlendi`), pageWidth / 2, y, { align: 'center' });
    y += 7;
    doc.text(`${tDoc('Le', '')} ${new Date().toLocaleDateString(dateFmt(), { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, y, { align: 'center' });

    y += 20;
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc('Le consultant', 'Danışman'), pageWidth / 2, y, { align: 'center' });
    y += 15;
    doc.line(pageWidth / 2 - 40, y, pageWidth / 2 + 40, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(data.consultantName, pageWidth / 2, y, { align: 'center' });

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(tDoc('Attestation de présence - Bilan de compétences conforme Qualiopi', 'Katılım belgesi - Qualiopi uyumlu yetkinlik değerlendirmesi'), pageWidth / 2, pageHeight - 15, { align: 'center' });

    return doc.output('blob');
  },

  /**
   * Génère le livret d'accueil
   */
  generateLivretAccueil(): Blob {
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - 2 * margin;

    const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += fontSize * 0.5;
      });
      y += 3;
    };

    const addSection = (title: string) => {
      y += 5;
      doc.setFillColor(79, 70, 229);
      doc.rect(margin, y - 5, maxWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 2, y);
      y += 10;
      doc.setTextColor(0, 0, 0);
    };

    // En-tête
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(tDoc('LIVRET D\'ACCUEIL', 'HOŞ GELDİNİZ KİTAPÇIĞI'), pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(14);
    doc.text(tDoc('Bilan de Compétences', 'Yetkinlik Değerlendirmesi'), pageWidth / 2, 28, { align: 'center' });
    
    y = 50;
    doc.setTextColor(0, 0, 0);

    // Bienvenue
    addSection(tDoc('BIENVENUE', 'HOŞ GELDİNİZ'));
    addText(tDoc('Nous sommes heureux de vous accompagner dans votre bilan de compétences. Ce livret vous présente le déroulement de votre parcours, vos droits et nos engagements.', 'Yetkinlik değerlendirmenizde size eşlik etmekten mutluluk duyuyoruz. Bu kitapçık sürecinizi, haklarınızı ve taahhütlerimizi sunar.'));

    // Qu'est-ce qu'un bilan de compétences
    addSection(tDoc('QU\'EST-CE QU\'UN BILAN DE COMPÉTENCES ?', 'YETKİNLİK DEĞERLENDİRMESİ NEDİR?'));
    addText(tDoc('Le bilan de compétences est une démarche d\'accompagnement qui vous permet de :', 'Yetkinlik değerlendirmesi, aşağıdakileri yapmanızı sağlayan bir eşlik sürecidir:'));
    addText(tDoc('• Analyser vos compétences professionnelles et personnelles', '• Mesleki ve kişisel yetkinliklerinizi analiz etmek'));
    addText(tDoc('• Identifier vos aptitudes et motivations', '• Yeteneklerinizi ve motivasyonlarınızı belirlemek'));
    addText(tDoc('• Définir un projet professionnel ou de formation', '• Bir mesleki veya eğitim projesi tanımlamak'));
    addText(tDoc('• Élaborer un plan d\'action concret', '• Somut bir eylem planı oluşturmak'));

    // Les 3 phases
    addSection(tDoc('LES 3 PHASES DU BILAN', 'DEĞERLENDİRMENİN 3 AŞAMASI'));
    addText(tDoc('1. Phase préliminaire (17% du temps)', '1. Ön aşama (sürenin %17\'si)'), 11, true);
    addText(tDoc('Analyse de votre besoin, définition de vos objectifs et présentation de la méthodologie.', 'İhtiyacınızın analizi, hedeflerinizin belirlenmesi ve metodolojinin sunulması.'));
    y += 3;
    addText(tDoc('2. Phase d\'investigation (50% du temps)', '2. Araştırma aşaması (sürenin %50\'si)'), 11, true);
    addText(tDoc('Exploration approfondie de vos compétences, valeurs, motivations et construction de votre projet professionnel.', 'Yetkinliklerinizin, değerlerinizin, motivasyonlarınızın derinlemesine keşfi ve mesleki projenizin oluşturulması.'));
    y += 3;
    addText(tDoc('3. Phase de conclusion (17% du temps)', '3. Sonuç aşaması (sürenin %17\'si)'), 11, true);
    addText(tDoc('Synthèse des résultats, validation de votre projet et élaboration d\'un plan d\'action détaillé.', 'Sonuçların özeti, projenizin doğrulanması ve ayrıntılı eylem planının hazırlanması.'));

    // Vos droits
    addSection(tDoc('VOS DROITS', 'HAKLARINIZ'));
    addText(tDoc('• Confidentialité : Les résultats du bilan vous appartiennent. Ils ne peuvent être communiqués à un tiers qu\'avec votre accord écrit.', '• Gizlilik: Değerlendirme sonuçları size aittir. Yazılı onayınız olmadan üçüncü taraflara iletilemez.'));
    addText(tDoc('• Interruption : Vous pouvez interrompre le bilan à tout moment.', '• Kesme: Değerlendirmeyi istediğiniz zaman durdurabilirsiniz.'));
    addText(tDoc('• Accès aux données : Vous avez un droit d\'accès, de rectification et de suppression de vos données personnelles (RGPD).', '• Veri erişimi: Kişisel verilerinize erişim, düzeltme ve silme hakkınız vardır (KVKK).'));

    // Nos engagements
addSection(tDoc('NOS ENGAGEMENTS QUALITÉ', 'KALİTE TAAHHÜTLERİMİZ'));
    addText(tDoc('• Certification Qualiopi : Nous sommes certifiés Qualiopi, gage de qualité de nos prestations.', '• Qualiopi sertifikası: Hizmetlerimizin kalite güvencesi olan Qualiopi sertifikasına sahibiz.'));
    addText(tDoc('• Consultants qualifiés : Nos consultants sont formés et expérimentés en bilan de compétences.', '• Nitelikli danışmanlar: Danışmanlarımız yetkinlik değerlendirmesi konusunda eğitimli ve deneyimlidir.'));
    addText(tDoc('• Outils professionnels : Nous utilisons des outils d\'\u00e9valuation reconnus et une plateforme numérique sécurisée.', '• Profesyonel araçlar: Tanınmış değerlendirme araçları ve güvenli dijital platform kullanıyoruz.'));
    addText(tDoc('• Accompagnement personnalisé : Chaque bilan est unique et adapté à votre situation.', '• Kişisel eşlik: Her değerlendirme benzersizdir ve durumunuza uyarlanır.'));

    // Modalités pratiques
    addSection(tDoc('MODALITÉS PRATIQUES', 'PRATİK BİLGİLER'));
    addText(tDoc('• Durée : Maximum 24 heures réparties sur plusieurs semaines', '• Süre: Birkaç haftaya yayılmış maksimum 24 saat'));
    addText(tDoc('• Format : Entretiens individuels + travail personnel sur plateforme', '• Format: Bireysel görüşmeler + platformda kişisel çalışma'));
    addText(tDoc('• Livrables : Document de synthèse, plan d\'action, attestation de présence', '• Teslimatlar: Özet belgesi, eylem planı, katılım belgesi'));
    addText(tDoc('• Suivi : Accès à votre espace personnel pendant et après le bilan', '• Takip: Değerlendirme sırasında ve sonrasında kişisel alanınıza erişim'));

    // Contact
    addSection(tDoc('CONTACT', 'İLETİŞİM'));
    addText(tDoc('Pour toute question, vous pouvez contacter votre consultant via la plateforme Bilan-Easy ou par email.', 'Herhangi bir sorunuz için Bilan-Easy platformu veya e-posta aracılığıyla danışmanınızla iletişime geçebilirsiniz.'));
    y += 5;
    addText(tDoc('Nous vous souhaitons un excellent parcours !', 'Size harika bir süreç diliyoruz!'), 12, true);

    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(tDoc('Livret d\'accueil - Bilan de compétences conforme Qualiopi', 'Hoş geldiniz kitapçığı - Qualiopi uyumlu yetkinlik değerlendirmesi'), pageWidth / 2, 285, { align: 'center' });

    return doc.output('blob');
  }
};
