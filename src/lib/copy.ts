/**
 * Toutes les chaînes visibles de l'application, groupées par écran.
 *
 * Aucun texte visible n'est écrit ailleurs. C'est ce qui permet de retoucher les
 * mots — ce qui compte le plus dans ce projet — sans jamais toucher au code.
 *
 * Le ton est fixé par docs/design-system.md §7 : tutoiement, pas d'exclamation,
 * pas d'emoji (le ♡ typographique excepté), phrases courtes, aucun mot technique.
 */

/** L'app est symétrique : la plupart des textes dépendent de qui regarde. */
export const copy = {
  header: {
    /**
     * Le header est une dédicace à CELUI QUI REGARDE : Charleen lit
     * « Pour Charleen ». C'est la signature, plus bas, qui porte le nom de l'autre.
     */
    title: (viewerName: string) => `Pour ${viewerName}`,
  },

  counter: {
    lead: "Je t'aime depuis",
    future: ["Notre histoire n'a pas encore commencé…", "elle t'attend."],
    unitYear: 'an',
    unitYears: 'ans',
    unitMonths: 'mois',
    unitDay: 'jour',
    unitDays: 'jours',
    hours: 'h',
    minutes: 'min',
    seconds: 's',
    /** Lu par les lecteurs d'écran, jamais affiché. */
    speech: (phrase: string) => `Je t'aime depuis : ${phrase}.`,
    speechFuture: "Notre histoire n'a pas encore commencé.",
  },

  ask: {
    button: "Est-ce que tu m'aimes ?",
    /** Quand l'autre a posé la question, le bouton principal change de rôle. */
    answerButton: (partnerName: string) => `Répondre à ${partnerName}`,
    incoming: (partnerName: string) => `${partnerName} te demande si tu l'aimes.`,
    /** Le lien discret sous la signature, pour écrire sans qu'on ait rien demandé. */
    note: 'Écrire un mot',
    buttonLabel: (partnerName: string) =>
      `Poser la question à ${partnerName} : est-ce que tu m'aimes ?`,
    empty: 'Pose-moi la question…',
    waiting: (partnerName: string) => `${partnerName} n'a pas encore répondu…`,
    /** Affiché quand la question est partie mais que le réseau manquait. */
    queued: 'La question partira dès que le réseau revient.',
    /** Appui pendant l'attente, avant le délai de relance. */
    tooSoon: 'La question est déjà partie.',
  },

  compose: {
    heading: (partnerName: string) => `${partnerName} te demande si tu l'aimes.`,
    headingNote: (partnerName: string) => `Un mot pour ${partnerName}`,
    placeholder: 'Écris-lui quelque chose…',
    send: 'Envoyer',
    sending: 'Envoi…',
    quickTitle: 'Ou choisis :',
    /**
     * Cinq phrases, une par SITUATION — pas cinq façons de dire la même chose.
     * Dans l'ordre : la tendresse simple, la promesse, la réponse qui arrive
     * tard, le moment où l'on n'est pas disponible, et l'invitation.
     *
     * Chacune tient sur une ligne à 17 px : au-delà, le bouton passe à deux
     * lignes et la liste ne tient plus au-dessus du clavier. Les garder courtes.
     * Un appui les insère dans le champ, où elles restent modifiables.
     */
    quickReplies: [
      "Oui. Chaque matin un peu plus qu'hier.",
      'Oui, et je te le redirai demain.',
      'Toujours. Même quand je réponds tard.',
      'Pas dispo là. Mais oui, évidemment.',
      'Oui. Et rentre vite.',
    ],
    remaining: (n: number) => `${n}`,
    tooLong: 'Il faudra faire un peu plus court.',
  },

  /** L'écran de lecture d'un message long. */
  message: {
    from: (partnerName: string) => `De ${partnerName}`,
    back: 'Revenir',
  },

  history: {
    title: "Tout ce qu'on s'est dit",
    open: 'Voir tout',
    close: 'Fermer',
    empty: 'Rien encore. Ça commence maintenant.',
    asked: (name: string) => `${name} a posé la question`,
    replied: (name: string) => `${name} a répondu`,
    noted: (name: string) => `${name} a écrit`,
    today: "Aujourd'hui",
    yesterday: 'Hier',
  },

  install: {
    title: 'Encore une étape',
    body: [
      "Pour que les notifications arrivent, l'app doit vivre sur l'écran d'accueil.",
      'Touche le bouton Partager, en bas, puis « Sur l’écran d’accueil ».',
      'Ensuite, ouvre-la depuis sa nouvelle icône.',
    ],
    wrongBrowser:
      "Ouvre ce lien dans Safari — les autres navigateurs ne savent pas installer l'app.",
  },

  notifications: {
    title: 'Être prévenue',
    body: 'Pour recevoir un mot même quand l’app est fermée.',
    enable: 'Activer',
    later: 'Plus tard',
    denied: [
      'Les notifications sont refusées pour le moment.',
      'Réglages → Notifications → BCGlove',
    ],
    ready: 'C’est bon. Tu seras prévenue.',
  },

  /** Ce qui part dans les notifications elles-mêmes (EF-5.2). */
  push: {
    askTitle: (name: string) => `${name} te demande ♡`,
    askBody: "Est-ce que tu m'aimes ?",
    replyTitle: (name: string) => `${name} a répondu ♡`,
    noteTitle: (name: string) => `${name} t'a écrit ♡`,
    firstOpenTitle: (name: string) => `${name} vient d'ouvrir ♡`,
    firstOpenBody: 'Le compteur a démarré.',
  },

  /** La séquence de première ouverture (EF-10). */
  firstOpen: {
    line: 'Il y a une date que je compte depuis longtemps.',
    skip: 'Continuer',
  },

  settings: {
    title: 'Réglages',
    who: (name: string) => `Tu es ${name}.`,
    notifications: 'Notifications',
    myLink: 'Mon lien',
    myLinkHelp: 'Garde-le ailleurs que dans l’app. C’est ta seule clé.',
    copy: 'Copier',
    copied: 'Copié',
  },

  invalid: {
    title: 'Ce lien ne mène nulle part.',
  },

  errors: {
    offline: 'Pas de réseau. Ça repartira tout seul.',
    failed: "Le message n'est pas parti. On réessaie ?",
    retry: 'Réessayer',
  },

  signature: (partnerName: string) => `— ${partnerName}`,
} as const;
