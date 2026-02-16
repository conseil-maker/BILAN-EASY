/**
 * Module de génération de questions
 * Gère la génération intelligente des questions du bilan de compétences
 */

import { Answer, Question, QuestionType, UserProfile, CoachingStyle } from '../../types';
import { QUESTION_CATEGORIES } from '../../constants';
import { geminiProxy } from '../geminiServiceProxy';
import { parseJsonResponse, getCoachingStyleInstruction, getCurrentLanguage, getLangInstruction } from './utils';
import { questionSchema, optionalModuleSchema, Type } from './schemas';
import { selectFallbackQuestion } from '../../data/fallbackQuestions';
import { generateSmartQuestion, generateOpeningQuestion } from '../smartQuestionGenerator';

const ai = geminiProxy;

/**
 * Extrait les éléments clés d'une réponse pour personnaliser la question suivante
 */
const extractKeyElements = (answer: string): string[] => {
  const elements: string[] = [];
  
  // Extraire les noms propres (personnes, entreprises, lieux)
  const properNouns = answer.match(/[A-Z][a-zéèêëàâäùûüôöîïçğışöü]+(?:\s+[A-Z][a-zéèêëàâäùûüôöîïçğışöü]+)*/g);
  if (properNouns) elements.push(...properNouns.slice(0, 3));
  
  // Extraire les chiffres significatifs (années, durées, montants)
  const numbers = answer.match(/\d+\s*(?:ans?|mois|années?|yıl|ay|€|euros?|%)/gi);
  if (numbers) elements.push(...numbers.slice(0, 2));
  
  // Extraire les mots émotionnels (FR + TR)
  const emotionPatterns = /(?:fier|frustré|passionné|motivé|déçu|heureux|stressé|épanoui|inquiet|confiant|satisfait|insatisfait|gurur|motive|hayal kırıklığı|mutlu|stresli|endişeli|güvenen|memnun)/gi;
  const emotions = answer.match(emotionPatterns);
  if (emotions) elements.push(...emotions.map(e => e.toLowerCase()));
  
  return [...new Set(elements)];
};

/**
 * Génère l'instruction système selon le style de coaching
 */
const getSystemInstruction = (style: CoachingStyle): string => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();
  
  const baseInstruction = lang === 'tr' 
    ? `Sen sertifikalı ve deneyimli bir yetkinlik değerlendirme danışmanısın.
Bir yararlanıcıyla kariyerini değerlendirmek için derinlemesine bir görüşme yürütüyorsun.
Genel bir anket değil, özgün ve kişiselleştirilmiş bir diyalog oluşturmalısın.

=== PROFESYONEL DURUŞ KURALLARI ===
1. YARDIMSEVER TARAFSIZLIK: Yararlanıcının yanıtlarını aşırıya kaçmadan değerlendiriyorsun.
   - YASAK: abartılı övgüler ("parlak", "olağanüstü", "muhteşem", "etkileyici")
   - TERCİH ET: pohpohlamadan tanıyan profesyonel ifadeler:
     * "Bu profilinizin yapılandırıcı bir noktası"
     * "Bu yetkinlik açıkça aktarılabilir"
     * "Bu, kariyerinizde güçlü bir eğilimi doğruluyor"
     * "Bu projeniz için somut bir avantaj"
     * "Bu alandaki deneyiminiz önemli"
   - Dalkavukluk yapmadan ilgi ve aktif dinleme gösterebilirsin.

2. SORU FORMATI:
   - BİR soru = BİR hedef = BİR beklenen yanıt
   - Aynı soruda ASLA birden fazla alt soru birleştirme
   - YASAK: "Güçlü yönleriniz neler VE bunları nasıl kullanıyorsunuz VE ne geliştirmek istersiniz?"
   - TERCİH ET: Bağlam gerektirse bile tek ve net bir hedefli soru
   - Sorudan önce bağlam veya geçiş cümlesi verebilirsin, ama soru tek ve net olmalı

3. ELEŞTİREL DENGE:
   - Belirlenen her güçlü yön için sınırları veya rahatsızlık alanlarını da keşfet
   - Düzenli olarak nüansa davet eden sorular sor: "Bunu engelleyebilecek ne olabilir...", "Risk ne olurdu...", "Bunda kaybedebileceğiniz ne..."
   - Yararlanıcının seçimlerini sistematik olarak onaylama: onları sorgulamasına yardımcı ol`
    : `Tu es un conseiller expert en bilan de compétences, certifié et expérimenté. 
Tu mènes un entretien approfondi avec un bénéficiaire pour l'aider à faire le point sur sa carrière.
Tu dois créer un dialogue authentique et personnalisé, pas un questionnaire générique.

=== RÈGLES DE POSTURE PROFESSIONNELLE ===
1. NEUTRALITÉ BIENVEILLANTE : Tu valorises les réponses du bénéficiaire sans excès.
   - INTERDIT : les superlatifs flatteurs ("brillant", "magistral", "remarquable", "exceptionnel", "impressionnant", "extraordinaire")
   - PRÉFÉRER : des formulations professionnelles qui reconnaissent sans flatter :
     * "C'est un point structurant de votre profil"
     * "Cette compétence est clairement transférable"
     * "Cela confirme une tendance forte dans votre parcours"
     * "C'est un atout concret pour votre projet"
     * "Votre expérience dans ce domaine est significative"
   - Tu peux montrer de l'intérêt et de l'écoute active sans tomber dans la flatterie.

2. FORMAT DES QUESTIONS :
   - UNE question = UN objectif = UNE réponse attendue
   - Ne combine JAMAIS plusieurs sous-questions dans une même question
   - INTERDIT : "Quelles sont vos forces ET comment les utilisez-vous ET qu'aimeriez-vous développer ?"
   - PRÉFÉRER : Une seule question ciblée, même si elle nécessite du contexte pour être bien comprise
   - Tu peux donner du contexte ou une phrase d'accroche avant la question, mais la question elle-même doit être unique et claire

3. ÉQUILIBRE CRITIQUE :
   - Pour chaque point fort identifié, explore aussi les limites ou les zones d'inconfort
   - Pose régulièrement des questions qui invitent à la nuance : "Qu'est-ce qui pourrait freiner...", "Quel serait le risque si...", "Qu'est-ce que vous pourriez perdre en..."
   - Ne valide pas systématiquement les choix du bénéficiaire : aide-le à les questionner`;

  return `${baseInstruction}\n\n${getCoachingStyleInstruction(style)}\n\n${langInstruction}`;
};

/**
 * Génère les conseils de transition de phase
 */
const getPhaseTransitionGuidance = (
  phaseKey: string, 
  answersCount: number, 
  userName: string
): string => {
  const lang = getCurrentLanguage();
  
  if (lang === 'tr') {
    if (phaseKey === 'phase1' && answersCount >= 8) {
      return `
🔄 2. AŞAMAYA GEÇİŞ YAKLAŞIYOR
${userName}'ın kariyer geçmişini keşfettin. Yetkinlik analizine geçişi hazırla.
Sonraki soru, belirlenen yetkinliklere köprü kurmalı.`;
    }
    if (phaseKey === 'phase2' && answersCount >= 15) {
      return `
🔄 3. AŞAMAYA GEÇİŞ YAKLAŞIYOR
Yetkinlikleri iyi analiz ettin. Mesleki projeye geçişi hazırla.
Sonraki soru, projeksiyon ve isteklere yönlendirmeli.`;
    }
    return '';
  }
  
  if (phaseKey === 'phase1' && answersCount >= 8) {
    return `
🔄 TRANSITION VERS PHASE 2 IMMINENTE
Tu as exploré le parcours de ${userName}. Prépare la transition vers l'analyse des compétences.
La prochaine question devrait commencer à faire le pont vers les compétences identifiées.`;
  }
  if (phaseKey === 'phase2' && answersCount >= 15) {
    return `
🔄 TRANSITION VERS PHASE 3 IMMINENTE
Tu as bien analysé les compétences. Prépare la transition vers le projet professionnel.
La prochaine question devrait orienter vers la projection et les aspirations.`;
  }
  return '';
};

/**
 * Génère une question personnalisée pour le bilan de compétences
 */
export const generateQuestion = async (
  phaseKey: 'phase1' | 'phase2' | 'phase3',
  categoryIndex: number,
  previousAnswers: Answer[],
  userName: string,
  coachingStyle: CoachingStyle,
  userProfile: UserProfile | null = null,
  options: { 
    useJoker?: boolean; 
    useGoogleSearch?: boolean; 
    searchTopic?: string; 
    isModuleQuestion?: { moduleId: string; questionNum: number }; 
    targetComplexity?: 'simple' | 'moyenne' | 'complexe' | 'reflexion'; 
    categoryId?: string;
  } = {}
): Promise<Question> => {
  const systemInstruction = getSystemInstruction(coachingStyle);
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();
  
  // Construire le contexte de conversation
  let conversationContext = buildConversationContext(
    previousAnswers, 
    userName, 
    userProfile
  );

  // Construire la description de la tâche
  const taskDescription = buildTaskDescription(phaseKey, categoryIndex, options);

  // Instructions spéciales
  const specialInstruction = buildSpecialInstruction(options, userName);

  const langReminder = lang === 'tr'
    ? `HATIRLATMA: Soru ${userName} için kişiselleştirilmiş, TÜRKÇE olmalı ve gerçek bir ilgi çekici diyalog oluşturmalıdır.
"description" alanı, önceki yanıtı değerlendiren bir geçiş veya giriş cümlesi içerebilir.`
    : `RAPPEL: La question doit être en FRANÇAIS, personnalisée pour ${userName}, et créer un vrai dialogue engageant.
Le champ "description" peut contenir une phrase d'accroche ou de transition qui valorise la réponse précédente.`;

  const generateInstr = lang === 'tr' ? 'Soruyu JSON formatında oluştur.' : 'Génère la question au format JSON.';

  const prompt = `${conversationContext}

${specialInstruction}

TÂCHE: ${taskDescription}

${getPhaseTransitionGuidance(phaseKey, previousAnswers.length, userName)}

${langReminder}

${generateInstr}

${langInstruction}`;

  const config: Record<string, unknown> = { 
    systemInstruction,
    responseMimeType: "application/json", 
    responseSchema: questionSchema,
  };

  if (options.useGoogleSearch) {
    config.tools = [{googleSearch: {}}];
  }

  // Timeout et retry pour éviter les blocages
  const generateWithTimeout = async (timeoutMs: number = 30000) => {
    return Promise.race([
      ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: config,
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout après ${timeoutMs/1000}s`)), timeoutMs)
      )
    ]);
  };

  let response;
  try {
    response = await generateWithTimeout(30000);
  } catch (error) {
    console.warn('[generateQuestion] Échec tentative 1:', error);
    try {
      response = await generateWithTimeout(20000);
    } catch (error2) {
      console.error('[generateQuestion] Échec tentative 2:', error2);
      return handleFallback(previousAnswers, userName, coachingStyle, options);
    }
  }

  const questionData = parseJsonResponse<Record<string, unknown>>(response.text ?? '', 'generateQuestion');
  return processQuestionResponse(questionData, previousAnswers, userName, coachingStyle);
};

/**
 * Construit le contexte de conversation
 */
function buildConversationContext(
  previousAnswers: Answer[], 
  userName: string, 
  userProfile: UserProfile | null
): string {
  if (previousAnswers.length === 0) {
    return buildFirstQuestionContext(userName, userProfile);
  }

  const lang = getCurrentLanguage();
  const lastAnswer = previousAnswers[previousAnswers.length - 1];
  if (!lastAnswer) return buildFirstQuestionContext(userName, userProfile);
  const keyElements = extractKeyElements(lastAnswer.value);
  
  const sentences = lastAnswer.value.split(/[.!?]+/).filter(s => s.trim().length > 20);
  const significantPhrases = sentences.slice(0, 2);
  
  if (lang === 'tr') {
    const profileContext = userProfile ? `
💼 ADAY PROFİLİ (CV'den):
- Mevcut rol: ${userProfile.currentRole}
- Temel yetkinlikler: ${userProfile.keySkills.join(', ')}
- Deneyimler: ${userProfile.pastExperiences.join(', ')}

Bu bilgileri sorularını kişiselleştirmek için kullan.` : '';

    return `
=== DİKKAT: KİŞİSELLEŞTİRME ZORUNLU ===${profileContext}

İşte ${userName}'ın az önce paylaştığı. Buna MUTLAKA değinmelisin:

"""
${lastAnswer.value}
"""

🎯 KULLANILACAK ANAHTAR UNSURLAR:
${keyElements.length > 0 ? keyElements.map(e => `- ${e}`).join('\n') : '- Kişisel bir açı bulmak için içeriği analiz et'}

${significantPhrases.length > 0 ? `💬 ALINACAK ÖNEMLİ İFADELER:
${significantPhrases.map(p => `"${p.trim()}"`).join('\n')}` : ''}

${previousAnswers.length > 1 ? `📝 ZATEN SORULAN SORULAR (TEKRARLAMA):
${previousAnswers.slice(-10, -1).map((a, i) => `${i + 1}. "${a.questionTitle || a.questionId}"`).join('\n')}` : ''}

🚨 TEKRAR UYARISI 🚨
Zaten sorulan soru sayısı: ${previousAnswers.length}
Öncekilerden TAMAMEN FARKLI bir soru sormalısın.

=== KESİN TALİMAT ===
Sorun MUTLAKA:
✅ ${userName}'ın az önce söylediğine AÇIK bir referansla başlamalı
✅ Yanıtından belirli bir unsuru alıntılamalı veya başka sözcüklerle ifade etmeli
✅ GERÇEKTEN dinlediğini ve anladığını göstermeli
✅ Belirli bir yönü derinleştirmeli, genelleştirmemeli

❌ KESİNLİKLE YASAK:
- "Bana ... hakkında anlatın" (çok genel)
- Onay soruları ("Doğru anlıyorsam...", "Bu doğru mu...")
- Önceki yanıtı okumadan sorulabilecek herhangi bir soru

${previousAnswers.length >= 8 ? `=== ÖNYARGI KARŞITI BLOK (R3) ===
🚩 Zaten ${previousAnswers.length} soru sordun. Sınama soruları ekleme zamanı:
- "Yön değiştirirseniz kaybedebileceğiniz ne olabilir?"
- "Bu yolu izlerseniz en zor senaryo ne olurdu?"
- "Mevcut pozisyonunuzda özleyeceğiniz yönler var mı?"
- "Hangi somut fedakarlıkları yapmaya hazırsınız?"
Bu tür eleştirel sorgulamayı bir sonraki soruna doğal olarak entegre et.
===========================` : ''}

${previousAnswers.length >= 12 ? `=== ÇOKLU YÖNTEM KEŞFİ (R2) ===
📍 ${previousAnswers.length} sorudan sonra ALTERNATİFLERİ keşfetmeye başlamalısın:
- ${userName} için en az 2-4 farklı mesleki yol belirle
- Tek bir yöne takılma: çeşitli senaryolar keşfet
- Her yol için belirle: aktarılabilir yetkinlikler, kapatılacak boşluklar, piyasa gerçekliği
===========================` : ''}

${previousAnswers.length >= 18 ? `=== PİYASA GERÇEKLİĞİ (R4) ===
📊 ${userName}'ın isteklerini piyasa gerçekliğiyle yüzleştirmeye başla:
- Profili ve istekleriyle bağlantılı somut hedef pozisyonlar öner
- Bu pozisyonlar için aranan temel yetkinlikleri belirt
- Olağan ücret seviyelerini ve gelişim perspektiflerini belirt
- ÖNEMLİ: Bu bilgilerin tahmin olduğunu ve kendi araştırmalarıyla doğrulaması gerektiğini belirt
===========================` : ''}
===================================`;
  }

  // Français (défaut)
  const profileContext = userProfile ? `
💼 PROFIL DU CANDIDAT (issu du CV):
- Rôle actuel: ${userProfile.currentRole}
- Compétences clés: ${userProfile.keySkills.join(', ')}
- Expériences: ${userProfile.pastExperiences.join(', ')}

Utilise ces informations pour personnaliser tes questions.` : '';

  return `
=== ATTENTION: PERSONNALISATION OBLIGATOIRE ===${profileContext}

Voici ce que ${userName} vient de te confier. Tu DOIS rebondir dessus:

"""
${lastAnswer.value}
"""

🎯 ÉLÉMENTS CLÉS À EXPLOITER:
${keyElements.length > 0 ? keyElements.map(e => `- ${e}`).join('\n') : '- Analyse le contenu pour trouver un angle personnel'}

${significantPhrases.length > 0 ? `💬 PHRASES IMPORTANTES À REPRENDRE:
${significantPhrases.map(p => `"${p.trim()}"`).join('\n')}` : ''}

${previousAnswers.length > 1 ? `📝 QUESTIONS DÉJÀ POSÉES (NE PAS RÉPÉTER):
${previousAnswers.slice(-10, -1).map((a, i) => `${i + 1}. "${a.questionTitle || a.questionId}"`).join('\n')}` : ''}

🚨 ALERTE ANTI-RÉPÉTITION 🚨
Nombre de questions déjà posées: ${previousAnswers.length}
Tu DOIS poser une question COMPLÈTEMENT DIFFÉRENTE des précédentes.

=== CONSIGNE ABSOLUE ===
Ta question DOIT:
✅ Commencer par une référence EXPLICITE à ce que ${userName} vient de dire
✅ Citer ou paraphraser un élément spécifique de sa réponse
✅ Montrer que tu as VRAIMENT écouté et compris
✅ Creuser un aspect précis, pas généraliser

❌ STRICTEMENT INTERDIT:
- "Parlez-moi de..." (trop générique)
- Questions de validation ("Si je comprends bien...", "Est-ce exact...")
- Toute question qui pourrait être posée sans avoir lu la réponse précédente

${previousAnswers.length >= 8 ? `=== BLOC ANTI-BIAIS (R3) ===
🚩 Tu as déjà posé ${previousAnswers.length} questions. Il est temps d'intégrer des questions de mise à l'épreuve :
- "Qu'est-ce que vous pourriez perdre en changeant de voie ?"
- "Quel serait le scénario le plus difficile si vous suivez cette piste ?"
- "Y a-t-il des aspects de votre poste actuel que vous regretteriez ?"
- "Quels sacrifices concrets êtes-vous prêt(e) à faire ?"
INTÈGRE naturellement ce type de questionnement critique dans ta prochaine question.
Ne pose pas ces questions mot pour mot, mais inspire-toi de cet esprit de mise à l'épreuve.
===========================` : ''}

${previousAnswers.length >= 12 ? `=== EXPLORATION MULTI-PISTES (R2) ===
📍 Après ${previousAnswers.length} questions, tu dois commencer à explorer des ALTERNATIVES :
- Identifie au moins 2-4 pistes professionnelles différentes pour ${userName}
- Ne te fixe pas sur une seule direction : explore des scénarios variés
- Pour chaque piste, aide à identifier : compétences transférables, gaps à combler, réalité du marché
- Pose des questions qui ouvrent de nouvelles perspectives : "Et si vous envisagiez...", "Avez-vous déjà pensé à..."
===========================` : ''}

${previousAnswers.length >= 18 ? `=== RÉALITÉ MARCHÉ (R4) ===
📊 Commence à confronter les aspirations de ${userName} avec la réalité du marché :
- Propose des postes cibles concrets en lien avec son profil et ses aspirations
- Mentionne les compétences clés recherchées pour ces postes
- Indique les niveaux de rémunération habituels et les perspectives d'évolution
- IMPORTANT : Précise toujours que ces informations sont des estimations et invite ${userName} à les valider par ses propres recherches (sites d'emploi, réseau professionnel, enquêtes métier)
- Formule : "D'après les tendances du marché, [proposition]. Je vous invite à vérifier ces informations par vos propres recherches."
===========================` : ''}
===================================`;
}

/**
 * Construit le contexte pour la première question
 */
function buildFirstQuestionContext(userName: string, userProfile: UserProfile | null): string {
  const lang = getCurrentLanguage();
  
  if (lang === 'tr') {
    if (userProfile) {
      return `
=== DEĞERLENDİRMENİN İLK SORUSU ===

${userName} ile değerlendirmeye başlıyorsun.
Profil: ${userProfile.currentRole}
Belirlenen yetkinlikler: ${userProfile.keySkills.join(', ')}

KİŞİSELLEŞTİRİLMİŞ bir açılış sorusu oluştur:
1. "${userName}" adını doğal olarak kullan
2. ${userProfile.currentRole} rolüne atıfta bulun
3. Kariyerini ilgi çekici bir şekilde paylaşmaya davet et
4. Hemen bir güven ortamı oluştur
===================================`;
    }
    return `
=== DEĞERLENDİRMENİN İLK SORUSU ===

${userName} ile değerlendirmeye başlıyorsun.
Önceden profil yok - tanışma fırsatı!

SICAK bir açılış sorusu oluştur:
1. "${userName}" adını doğal olarak kullan
2. Kendini özgürce tanıtmaya davet et
3. Hemen rahat hissettir
4. Paylaşma isteği uyandır
===================================`;
  }

  // Français (défaut)
  if (userProfile) {
    return `
=== PREMIÈRE QUESTION DU BILAN ===

Tu démarres le bilan avec ${userName}.
Profil: ${userProfile.currentRole}
Compétences identifiées: ${userProfile.keySkills.join(', ')}

Crée une question d'ouverture PERSONNALISÉE qui:
1. Utilise le prénom "${userName}" naturellement
2. Fait référence à son rôle de ${userProfile.currentRole}
3. Invite à partager son parcours de manière engageante
4. Crée immédiatement un climat de confiance
===================================`;
  }

  return `
=== PREMIÈRE QUESTION DU BILAN ===

Tu démarres le bilan avec ${userName}.
Aucun profil préalable - c'est l'occasion de faire connaissance !

Crée une question d'ouverture CHALEUREUSE qui:
1. Utilise le prénom "${userName}" naturellement
2. Invite à se présenter librement
3. Met immédiatement à l'aise
4. Donne envie de se confier
===================================`;
}

/**
 * Construit la description de la tâche
 */
function buildTaskDescription(
  phaseKey: string, 
  categoryIndex: number, 
  options: Record<string, unknown>
): string {
  const lang = getCurrentLanguage();
  
  if (options.isModuleQuestion) {
    const moduleInfo = options.isModuleQuestion as { moduleId: string; questionNum: number };
    return lang === 'tr'
      ? `İsteğe bağlı modül: ${moduleInfo.moduleId} (soru ${moduleInfo.questionNum}/3). Bu konu hakkında hedefli bir soru sor.`
      : `Module optionnel: ${moduleInfo.moduleId} (question ${moduleInfo.questionNum}/3). Pose une question ciblée sur ce thème.`;
  }

  const phaseInfo = QUESTION_CATEGORIES[phaseKey as keyof typeof QUESTION_CATEGORIES];
  const category = phaseInfo.categories[categoryIndex];
  
  let complexityGuidance = "";
  const targetComplexity = options.targetComplexity as string | undefined;
  if (targetComplexity) {
    const complexityMap: Record<string, Record<string, string>> = {
      'simple': {
        fr: "Question SIMPLE (1-2 min): factuelle, directe, facile à répondre.",
        tr: "BASİT soru (1-2 dk): olgusal, doğrudan, yanıtlaması kolay."
      },
      'moyenne': {
        fr: "Question MOYENNE (3-5 min): invite à la réflexion, demande des exemples.",
        tr: "ORTA soru (3-5 dk): düşünmeye davet eder, örnekler ister."
      },
      'complexe': {
        fr: "Question COMPLEXE (5-10 min): analyse approfondie, mise en perspective.",
        tr: "KARMAŞIK soru (5-10 dk): derinlemesine analiz, perspektife koyma."
      },
      'reflexion': {
        fr: "Question de RÉFLEXION PROFONDE (10-15 min): introspection, projection, vision.",
        tr: "DERİN DÜŞÜNCE sorusu (10-15 dk): içe bakış, projeksiyon, vizyon."
      }
    };
    complexityGuidance = complexityMap[targetComplexity]?.[lang] || "";
  }
  
  return lang === 'tr'
    ? `A\u015fama: ${phaseInfo.name} | Kategori: ${category?.name || ''}
${complexityGuidance}
\u00d6nceki yan\u0131tlara de\u011finerek bu kategoriyi ke\u015ffeden bir soru olu\u015ftur.`
    : `Phase: ${phaseInfo.name} | Catégorie: ${category?.name || ''}
${complexityGuidance}
Génère une question qui explore cette catégorie tout en rebondissant sur les réponses précédentes.`;
}

/**
 * Construit les instructions spéciales
 */
function buildSpecialInstruction(options: Record<string, unknown>, userName: string): string {
  const lang = getCurrentLanguage();
  
  if (options.useJoker) {
    return lang === 'tr'
      ? `
=== JOKER MODU AKTİF ===
${userName}'ın yanıtlamak için yardıma ihtiyacı var. Önceki soruyu şu şekilde yeniden formüle et:
- Daha basit ve erişilebilir
- Farklı bir açıdan
- Yönlendirmek için somut bir örnekle
"Sorun değil, bunu başka bir şekilde keşfedelim..." gibi rahatlatıcı bir cümleyle başla
===========================`
      : `
=== MODE JOKER ACTIVÉ ===
${userName} a besoin d'aide pour répondre. Reformule la question précédente de manière:
- Plus simple et accessible
- Sous un angle différent
- Avec un exemple concret pour guider
Commence par une phrase rassurante comme "Pas de souci, explorons cela autrement..."
===========================`;
  }
  
  if (options.useGoogleSearch && options.searchTopic) {
    return lang === 'tr'
      ? `
=== BAĞLAMSAL ZENGİNLEŞTİRME ===
${userName} "${options.searchTopic}" konusuna ilgi gösterdi.
Zenginleştirilmiş bir soru sormak için arama sonuçlarını kullan.
===========================`
      : `
=== ENRICHISSEMENT CONTEXTUEL ===
${userName} a mentionné un intérêt pour "${options.searchTopic}".
Utilise les résultats de recherche pour poser une question enrichie.
===========================`;
  }
  
  return "";
}

/**
 * Gère le fallback en cas d'échec de génération
 */
function handleFallback(
  previousAnswers: Answer[], 
  userName: string, 
  coachingStyle: CoachingStyle,
  options: Record<string, unknown>
): Question {
  console.warn('[generateQuestion] Fallback: utilisation de questions pré-générées');
  
  if (previousAnswers.length === 0) {
    return generateOpeningQuestion(userName, coachingStyle);
  }
  
  const smartQuestion = generateSmartQuestion(previousAnswers, userName, coachingStyle);
  if (smartQuestion) {
    return smartQuestion;
  }
  
  const categoryId = (options.categoryId as string) || 'parcours_professionnel';
  const fallbackQuestion = selectFallbackQuestion(
    categoryId,
    options.isModuleQuestion ? 2 : 1,
    previousAnswers.map(a => a.questionId)
  );
  
  if (fallbackQuestion) {
    return fallbackQuestion;
  }
  
  const lang = getCurrentLanguage();
  throw new Error(lang === 'tr' 
    ? '2 denemeden sonra soru oluşturulamadı. Lütfen tekrar deneyin.'
    : 'Impossible de générer la question après 2 tentatives. Veuillez réessayer.');
}

/**
 * Traite et nettoie la réponse de génération de question
 */
function processQuestionResponse(
  questionData: Record<string, unknown>,
  previousAnswers: Answer[],
  userName: string,
  coachingStyle: CoachingStyle
): Question {
  const question: Question = {
    id: (questionData.id as string) || `q-${Date.now()}`,
    title: (questionData.title as string) || '',
    description: (questionData.description as string) || '',
    type: ((questionData.type as string) || 'open') as QuestionType,
    theme: (questionData.category as string) || 'general',
    choices: (questionData.options as string[]) || undefined,
    options: (questionData.options as string[]) || undefined,
    category: (questionData.category as string) || 'general',
    phase: (questionData.phase as string) || 'phase1',
    required: true,
    isRequired: true,
    order: previousAnswers.length + 1,
  };

  // Vérification de qualité
  if (!question.title || question.title.length < 10) {
    console.warn('[processQuestionResponse] Question trop courte, fallback');
    return handleFallback(previousAnswers, userName, coachingStyle, {});
  }

  return question;
}
