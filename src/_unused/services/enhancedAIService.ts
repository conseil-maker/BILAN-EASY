/**
 * Service d'amélioration de l'expérience IA
 * 
 * Ce service ajoute des fonctionnalités avancées pour personnaliser
 * les interactions avec l'IA et améliorer la qualité des réponses.
 */

import { Answer, CoachingStyle, UserProfile } from '../types';
import { organizationConfig } from '../config/organization';
import i18n from '../i18n';

const tAI = (fr: string, tr: string): string => (i18n.language || 'fr') === 'tr' ? tr : fr;

// Types pour les réponses enrichies
export interface EnrichedResponse {
  mainResponse: string;
  encouragement: string;
  nextStepHint: string;
  relevantInsight?: string;
  progressFeedback: string;
}

export interface PersonalizedContext {
  userName: string;
  coachingStyle: CoachingStyle;
  currentPhase: string;
  answersCount: number;
  identifiedStrengths: string[];
  areasToExplore: string[];
  emotionalTone: 'positive' | 'neutral' | 'supportive';
}

// Messages d'encouragement personnalisés par style de coaching
const getEncouragementsByStyle = (): Record<CoachingStyle, string[]> => ({
  collaborative: [
    tAI("C'est une excellente réflexion ! Continuons ensemble à explorer cette piste.", "Harika bir düşünce! Birlikte keşfetmeye devam edelim."),
    tAI("Merci pour ce partage sincère. Votre authenticité est précieuse.", "Samimi paylaşımınız için teşekkürler. Otantikliğiniz çok değerli."),
    tAI("Je sens que vous avez beaucoup à offrir. Approfondissons cela.", "Sunacak çok şeyiniz olduğunu hissediyorum. Bunu derinleştirelim."),
    tAI("Votre réponse montre une belle lucidité sur vous-même.", "Cevabınız kendinize dair güzel bir farkındalık gösteriyor."),
    tAI("Nous avançons bien ensemble. Votre implication fait la différence.", "Birlikte iyi ilerliyoruz. Katılımınız fark yaratıyor."),
  ],
  analytic: [
    tAI("Analyse pertinente. Examinons maintenant les implications concrètes.", "Yerinde bir analiz. Şimdi somut sonuçlarını inceleyelim."),
    tAI("Point bien structuré. Passons à l'étape suivante de notre analyse.", "İyi yapılandırılmış bir nokta. Analizimizin sonraki adımına geçelim."),
    tAI("Données intéressantes. Voyons comment les exploiter stratégiquement.", "İlginç veriler. Bunları stratejik olarak nasıl değerlendirebileceğimize bakalım."),
    tAI("Votre raisonnement est clair. Continuons à décortiquer les éléments.", "Mantığınız açık. Unsurları analiz etmeye devam edelim."),
    tAI("Bonne identification des facteurs clés. Approfondissons.", "Anahtar faktörlerin iyi tespiti. Derinleştirelim."),
  ],
  creative: [
    tAI("Quelle perspective originale ! Laissez-vous porter par cette idée.", "Ne orijinal bir bakış açısı! Bu fikre kendinizi bırakın."),
    tAI("J'aime cette façon de voir les choses. Et si on allait plus loin ?", "Bu bakış açınızı beğeniyorum. Daha ileri gitsek?"),
    tAI("Votre créativité transparaît. Explorons d'autres possibilités.", "Yaratıcılığınız ortaya çıkıyor. Diğer olasılıkları keşfedelim."),
    tAI("Belle intuition ! Voyons où elle nous mène.", "Güzel bir sezgi! Bizi nereye götüreceğine bakalım."),
    tAI("Vous ouvrez des portes intéressantes. Continuons l'exploration.", "İlginç kapılar açıyorsunuz. Keşfi sürdürelim."),
  ],
});

// Insights contextuels basés sur les thèmes détectés
const getThemeInsights = (): Record<string, string[]> => ({
  'reconversion': [
    tAI("La reconversion est un voyage, pas une destination. Chaque étape compte.", "Kariyer değişikliği bir yolculuktur, bir varış noktası değil. Her adım önemlidir."),
    tAI("80% des personnes en reconversion trouvent plus de sens dans leur nouveau métier.", "Kariyer değiştirenlerin %80'i yeni mesleklerinde daha fazla anlam buluyor."),
    tAI("Vos compétences transférables sont votre plus grand atout.", "Transfer edilebilir yetkinlikleriniz en büyük avantajınız."),
  ],
  'management': [
    tAI("Le leadership moderne repose sur l'écoute et l'empathie.", "Modern liderlik dinleme ve empatiye dayanır."),
    tAI("Les meilleurs managers sont ceux qui développent leurs équipes.", "En iyi yöneticiler ekiplerini geliştiren kişilerdir."),
    tAI("Votre expérience managériale est un capital précieux.", "Yönetim deneyiminiz değerli bir sermayedir."),
  ],
  'entrepreneuriat': [
    tAI("L'entrepreneuriat commence par une vision claire de sa valeur ajoutée.", "Girişimcilik, katma değerinizin net bir vizyonuyla başlar."),
    tAI("Les entrepreneurs qui réussissent sont ceux qui apprennent de leurs échecs.", "Başarılı girişimciler hatalarından öğrenenlerdir."),
    tAI("Votre projet mérite d'être exploré en profondeur.", "Projeniz derinlemesine keşfedilmeyi hak ediyor."),
  ],
  'équilibre': [
    tAI("L'équilibre vie pro/perso est un facteur clé de performance durable.", "İş-yaşam dengesi sürdürülebilir performansın anahtar faktörüdür."),
    tAI("Définir ses priorités est le premier pas vers l'harmonie.", "Önceliklerinizi belirlemek uyuma doğru ilk adımdır."),
    tAI("Votre bien-être est essentiel à votre réussite professionnelle.", "İyi oluşunuz mesleki başarınız için çok önemlidir."),
  ],
  'compétences': [
    tAI("Vos compétences sont le reflet de votre parcours unique.", "Yetkinlikleriniz benzersiz yolculuğunuzun yansımasıdır."),
    tAI("Chaque expérience a développé des savoir-faire précieux.", "Her deneyim değerli beceriler geliştirmiştir."),
    tAI("La conscience de ses forces est le socle de la confiance.", "Güçlü yönlerinizin farkındalığı güvenin temelidir."),
  ],
});

// Feedback de progression
const getProgressFeedbacks = (): Record<number, string[]> => ({
  25: [
    tAI("Nous avons bien démarré ! Continuons sur cette lancée.", "İyi başladık! Bu ivmeyle devam edelim."),
    tAI("Premier quart du parcours accompli. Vous êtes sur la bonne voie.", "Sürecin ilk çeyreği tamamlandı. Doğru yoldasınız."),
  ],
  50: [
    tAI("Mi-parcours atteint ! Vos réponses dessinent déjà un profil intéressant.", "Yarı yola geldiniz! Cevaplarınız ilginç bir profil çiziyor."),
    tAI("Nous sommes à mi-chemin. Les éléments clés commencent à émerger.", "Yarı yoldayız. Anahtar unsurlar ortaya çıkmaya başlıyor."),
  ],
  75: [
    tAI("Dernière ligne droite ! Votre profil se précise remarquablement.", "Son düzlük! Profiliniz dikkat çekici şekilde netleşiyor."),
    tAI("Presque terminé. Vos réponses forment un ensemble cohérent.", "Neredeyse bitti. Cevaplarınız tutarlı bir bütün oluşturuyor."),
  ],
  100: [
    tAI("Félicitations ! Vous avez complété cette phase avec brio.", "Tebrikler! Bu aşamayı başarıyla tamamladınız."),
    tAI("Bravo pour votre engagement tout au long de ce parcours.", "Süreç boyunca gösterdiğiniz özveri için tebrikler."),
  ],
});

/**
 * Génère un message d'encouragement personnalisé
 */
export const getPersonalizedEncouragement = (
  style: CoachingStyle,
  answersCount: number
): string => {
  const encouragements = getEncouragementsByStyle()[style];
  const index = answersCount % encouragements.length;
  return encouragements[index];
};

/**
 * Détecte les thèmes principaux dans les réponses
 */
export const detectThemes = (answers: Answer[]): string[] => {
  const themes: string[] = [];
  const allText = answers.map(a => a.value.toLowerCase()).join(' ');
  
  const isTr = (i18n.language || 'fr') === 'tr';
  const themeKeywords: Record<string, string[]> = isTr ? {
    'reconversion': ['kariyer değişikliği', 'değiştirmek', 'yeni meslek', 'geçiş', 'yön değiştirme'],
    'management': ['yönetici', 'ekip', 'liderlik', 'yönetmek', 'denetlemek', 'çalışanlar'],
    'entrepreneuriat': ['girişimcilik', 'kurmak', 'bağımsız', 'serbest', 'startup', 'proje'],
    'équilibre': ['denge', 'kişisel yaşam', 'stres', 'iyi oluş', 'zaman', 'aile'],
    'compétences': ['yetkinlik', 'beceri', 'uzmanlık', 'eğitim', 'öğrenme'],
  } : {
    'reconversion': ['reconversion', 'changer', 'nouveau métier', 'transition', 'réorientation'],
    'management': ['manager', 'équipe', 'leadership', 'diriger', 'encadrer', 'collaborateurs'],
    'entrepreneuriat': ['entreprendre', 'créer', 'indépendant', 'freelance', 'startup', 'projet'],
    'équilibre': ['équilibre', 'vie personnelle', 'stress', 'bien-être', 'temps', 'famille'],
    'compétences': ['compétences', 'savoir-faire', 'expertise', 'formation', 'apprentissage'],
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      themes.push(theme);
    }
  }
  
  return themes;
};

/**
 * Génère un insight contextuel basé sur les thèmes détectés
 */
export const getContextualInsight = (themes: string[]): string | undefined => {
  if (themes.length === 0) return undefined;
  
  const primaryTheme = themes[0];
  const insights = getThemeInsights()[primaryTheme];
  
  if (!insights) return undefined;
  
  return insights[Math.floor(Math.random() * insights.length)];
};

/**
 * Génère un feedback de progression
 */
export const getProgressFeedback = (
  currentQuestion: number,
  totalQuestions: number
): string => {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);
  
  let feedbackLevel = 25;
  if (progress >= 75) feedbackLevel = 75;
  else if (progress >= 50) feedbackLevel = 50;
  else if (progress >= 25) feedbackLevel = 25;
  else return tAI("C'est parti ! Prenez le temps de bien réfléchir à chaque question.", "Hadi başlayalım! Her soruyu düşünmek için zamanınızı alın.");
  
  const feedbacks = getProgressFeedbacks()[feedbackLevel];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
};

/**
 * Génère une réponse enrichie avec contexte personnalisé
 */
export const generateEnrichedResponse = (
  context: PersonalizedContext,
  answers: Answer[]
): EnrichedResponse => {
  const themes = detectThemes(answers);
  
  return {
    mainResponse: '',
    encouragement: getPersonalizedEncouragement(context.coachingStyle, context.answersCount),
    nextStepHint: getNextStepHint(context.currentPhase, context.answersCount),
    relevantInsight: getContextualInsight(themes),
    progressFeedback: getProgressFeedback(context.answersCount, 20),
  };
};

/**
 * Génère un indice sur la prochaine étape
 */
const getNextStepHint = (currentPhase: string, answersCount: number): string => {
  const hints: Record<string, string[]> = {
    'phase1': [
      tAI("Nous allons maintenant explorer vos motivations profondes.", "Şimdi derin motivasyonlarınızı keşfedeceğiz."),
      tAI("La prochaine question portera sur votre parcours.", "Sonraki soru geçmişinizle ilgili olacak."),
      tAI("Continuons à découvrir ce qui vous anime.", "Sizi motive eden şeyleri keşfetmeye devam edelim."),
    ],
    'phase2': [
      tAI("Passons à l'analyse de vos compétences clés.", "Temel yetkinliklerinizin analizine geçelim."),
      tAI("Explorons maintenant vos savoir-faire.", "Şimdi becerilerinizi keşfedelim."),
      tAI("Voyons comment valoriser votre expérience.", "Deneyiminizi nasıl değerlendirebileceğimize bakalım."),
    ],
    'phase3': [
      tAI("Construisons ensemble votre projet professionnel.", "Birlikte mesleki projenizi oluşturalım."),
      tAI("Définissons les prochaines étapes concrètes.", "Somut sonraki adımları belirleyelim."),
      tAI("Finalisons votre plan d'action.", "Eylem planınızı tamamlayalım."),
    ],
  };
  
  const phaseHints = hints[currentPhase] || hints['phase1'];
  return phaseHints[answersCount % phaseHints.length];
};

/**
 * Génère un message de bienvenue personnalisé
 */
export const generateWelcomeMessage = (
  userName: string,
  style: CoachingStyle,
  packageName: string
): string => {
  const consultant = organizationConfig.defaultConsultant.name;
  
  const welcomeByStyle: Record<CoachingStyle, string> = {
    collaborative: tAI(
      `Bonjour ${userName} ! Je suis ravi de vous accompagner dans ce bilan de compétences. Ensemble, nous allons explorer votre parcours et construire votre projet professionnel. N'hésitez pas à prendre votre temps pour répondre, chaque réflexion compte.`,
      `Merhaba ${userName}! Yetkinlik değerlendirmenizde size eşlik etmekten mutluluk duyuyorum. Birlikte geçmişinizi keşfedecek ve mesleki projenizi oluşturacağız. Cevaplamak için zamanınızı alın, her düşünce önemlidir.`
    ),
    analytic: tAI(
      `Bonjour ${userName}. Bienvenue dans votre bilan de compétences. Notre approche structurée va nous permettre d'analyser méthodiquement votre profil et d'identifier les opportunités qui s'offrent à vous. Commençons par les fondamentaux.`,
      `Merhaba ${userName}. Yetkinlik değerlendirmenize hoş geldiniz. Yapılandırılmış yaklaşımımız profilinizi sistematik olarak analiz etmemizi ve önünüzdeki fırsatları belirlememizi sağlayacak. Temellerle başlayalım.`
    ),
    creative: tAI(
      `Bonjour ${userName} ! Prêt(e) pour un voyage de découverte ? Ce bilan est une invitation à explorer de nouvelles perspectives et à imaginer votre avenir professionnel. Laissez-vous guider par votre intuition et vos aspirations profondes.`,
      `Merhaba ${userName}! Keşif yolculuğuna hazır mısınız? Bu değerlendirme yeni bakış açılarını keşfetmek ve mesleki geleceğinizi hayal etmek için bir davet. Sezgilerinize ve derin isteklerinize kulak verin.`
    ),
  };
  
  return welcomeByStyle[style];
};

/**
 * Génère un message de transition entre phases
 */
export const generatePhaseTransitionMessage = (
  fromPhase: string,
  toPhase: string,
  userName: string,
  style: CoachingStyle
): string => {
  const transitions: Record<string, Record<CoachingStyle, string>> = {
    'phase1-phase2': {
      collaborative: tAI(
        `Excellent travail ${userName} ! Nous avons bien exploré votre parcours et vos motivations. Passons maintenant à l'analyse de vos compétences. Cette étape est essentielle pour identifier vos atouts.`,
        `Harika çalışma ${userName}! Geçmişinizi ve motivasyonlarınızı iyi keşfettik. Şimdi yetkinliklerinizin analizine geçelim. Bu aşama güçlü yönlerinizi belirlemek için çok önemli.`
      ),
      analytic: tAI(
        `Phase d'investigation terminée. Les données recueillies sont riches. Passons à l'analyse des compétences pour affiner notre diagnostic.`,
        `Araştırma aşaması tamamlandı. Toplanan veriler zengin. Teşhisimizi iyileştirmek için yetkinlik analizine geçelim.`
      ),
      creative: tAI(
        `Belle exploration ${userName} ! Vous avez ouvert de nombreuses portes. Maintenant, découvrons les trésors que vous portez en vous : vos compétences uniques.`,
        `Güzel keşif ${userName}! Birçok kapı açtınız. Şimdi içinizdeki hazineleri keşfedelim: benzersiz yetkinlikleriniz.`
      ),
    },
    'phase2-phase3': {
      collaborative: tAI(
        `Formidable ${userName} ! Vos compétences sont maintenant clairement identifiées. Construisons ensemble votre projet professionnel et votre plan d'action.`,
        `Harika ${userName}! Yetkinlikleriniz artık açıkça belirlendi. Birlikte mesleki projenizi ve eylem planınızı oluşturalım.`
      ),
      analytic: tAI(
        `Analyse des compétences complète. Nous disposons de tous les éléments pour élaborer un plan d'action stratégique et réaliste.`,
        `Yetkinlik analizi tamamlandı. Stratejik ve gerçekçi bir eylem planı hazırlamak için tüm unsurlara sahibiz.`
      ),
      creative: tAI(
        `Vos talents sont révélés ${userName} ! Il est temps de dessiner l'avenir que vous méritez. Laissez libre cours à vos ambitions.`,
        `Yetenekleriniz ortaya çıktı ${userName}! Hak ettiğiniz geleceği çizme zamanı. Hedeflerinize serbestçe yönelin.`
      ),
    },
  };
  
  const key = `${fromPhase}-${toPhase}`;
  return transitions[key]?.[style] || tAI(`Passons à la phase suivante, ${userName}.`, `Sonraki aşamaya geçelim, ${userName}.`);
};

/**
 * Génère un message de conclusion personnalisé
 */
export const generateConclusionMessage = (
  userName: string,
  style: CoachingStyle,
  strengths: string[],
  projectType: string
): string => {
  const strengthsList = strengths.slice(0, 3).join(', ');
  
  const conclusions: Record<CoachingStyle, string> = {
    collaborative: tAI(
      `Félicitations ${userName} ! Nous avons accompli un beau travail ensemble. Vos forces (${strengthsList}) sont de véritables atouts pour votre projet de ${projectType}. Je suis confiant(e) dans votre capacité à réussir. L'équipe de ${organizationConfig.name} reste à votre disposition pour vous accompagner.`,
      `Tebrikler ${userName}! Birlikte harika bir iş başardık. Güçlü yönleriniz (${strengthsList}) ${projectType} projeniz için gerçek birer avantaj. Başarı kapasitenize güveniyorum. ${organizationConfig.name} ekibi size eşlik etmeye devam edecek.`
    ),
    analytic: tAI(
      `Bilan terminé ${userName}. L'analyse révèle un profil solide avec des compétences clés en ${strengthsList}. Votre projet de ${projectType} est cohérent avec votre profil. Les prochaines étapes sont clairement définies.`,
      `Değerlendirme tamamlandı ${userName}. Analiz, ${strengthsList} alanlarında güçlü yetkinliklere sahip sağlam bir profil ortaya koyuyor. ${projectType} projeniz profilinizle tutarlı. Sonraki adımlar açıkça belirlenmiştir.`
    ),
    creative: tAI(
      `Quel voyage ${userName} ! Vous avez découvert des facettes insoupçonnées de vous-même. Vos talents en ${strengthsList} sont prêts à s'épanouir dans votre projet de ${projectType}. L'avenir vous appartient !`,
      `Ne güzel bir yolculuk ${userName}! Kendinizin bilinmeyen yönlerini keşfettiniz. ${strengthsList} alanlarındaki yetenekleriniz ${projectType} projenizde çiçek açmaya hazır. Gelecek sizin!`
    ),
  };
  
  return conclusions[style];
};

export default {
  getPersonalizedEncouragement,
  detectThemes,
  getContextualInsight,
  getProgressFeedback,
  generateEnrichedResponse,
  generateWelcomeMessage,
  generatePhaseTransitionMessage,
  generateConclusionMessage,
};
