// Типы для системы переводов ShakeDown

export type Language = 'en' | 'ru' | 'uk' | 'pl' | 'tr' | 'kz'

export interface TranslationStructure {
  nav: {
    services: string
    video: string
    dashboard: string
    home: string
    admin: string
    logout: string
    login: string
    register: string
  }
  hero: {
    title: string
    subtitle: string
    cta: string
    learnMore: string
  }
  video: {
    title: string
    subtitle: string
  }
  services: {
    title: string
    popular: string
    discount: string
    pay: string
  }
  features: {
    ourAdvantages: string
    ourAdvantagesDesc: string
    performance: string
    performanceDesc: string
    bypass: string
    bypassDesc: string
    interface: string
    interfaceDesc: string
    interfaceDescFull: string
    customization: string
    customizationDesc: string
    optimization: string
    optimizationDesc: string
    updates: string
    updatesDesc: string
    updatesDescFull: string
    richFunctionality: string
    richFunctionalityDesc: string
    security: string
    securityDesc: string
    community: string
    communityDesc: string
    support: string
    supportDesc: string
    supportDescFull: string
  }
  footer: {
    rights: string
    personalData: string
    userAgreement: string
    usageRules: string
  }
  dashboard: {
    title: string
    uid: string
    login: string
    group: string
    regDate: string
    lastLogin: string
    email: string
    hwid: string
    hwidPlaceholder: string
    reset: string
    activateKey: string
    enterKey: string
    activate: string
    buyClient: string
    downloadLauncher: string
    changePassword: string
    user: string
    premium: string
    alpha: string
    // Новые ключи для расширенного Dashboard
    welcome: string
    manageAccount: string
    overview: string
    profile: string
    subscription: string
    settings: string
    status: string
    registration: string
    emailStatus: string
    verified: string
    notVerified: string
    notLinked: string
    quickActions: string
    profileInfo: string
    myProfile: string
    setupProfile: string
    avatarSection: string
    displayName: string
    displayNameHint: string
    basicInfo: string
    profileSaved: string
    nameTaken: string
    avatarUpdated: string
    fileTooLarge: string
    subscriptionManagement: string
    currentPlan: string
    upgradeForFeatures: string
    activeSubscription: string
    keyActivation: string
    keyPlaceholder: string
    keyHint: string
    keyActivated: string
    keyNotFound: string
    keyAlreadyUsed: string
    enterKeyToActivate: string
    security: string
    changePasswordDesc: string
    change: string
    resetHwid: string
    resetHwidDesc: string
    account: string
    adminPanel: string
    forever: string
    forDays: string
    // Additional dashboard translations
    subscriptionTill: string
    activateLicenseKey: string
    enterKeyPlaceholder: string
    accountTab: string
    launcherTab: string
    friends: string
    soon: string
    system: string
    processor: string
    windowsInfo: string
    processorInfo: string
    ramInfo: string
    downloadLauncherText: string
    launcherDownloadStarted: string
    // Settings tab translations
    addFriend: string
    addFriendDesc: string
    send: string
    theme: string
    dark: string
    light: string
    auto: string
    snowEffect: string
    enterFriendUsername: string
    // Messenger translations
    online: string
    offline: string
    typeMessage: string
    friendRequests: string
    pendingRequests: string
    requestSent: string
    wantsToBeYourFriend: string
    noFriendsYet: string
    addFriendHint: string
    removeFriend: string
    selectFriendToChat: string
  }
  payment: {
    title: string
    selectProduct: string
    selectPlaceholder: string
    promo: string
    promoPlaceholder: string
    toPay: string
    paymentMethod: string
    continue: string
    note: string
    cards: string
    gameMarket: string
  }
  auth: {
    login: string
    register: string
    loginOrEmail: string
    enterLoginOrEmail: string
    password: string
    enterPassword: string
    rememberMe: string
    loginBtn: string
    username: string
    createUsername: string
    email: string
    enterEmail: string
    createPassword: string
    confirmPassword: string
    repeatPassword: string
    agreeTerms: string
    registerBtn: string
    backToHome: string
    orContinueWith: string
    emailVerification: string
    verificationSent: string
    confirm: string
    verifying: string
    resendCode: string
    enterFullCode: string
    passwordsNotMatch: string
    passwordMinLength: string
    mustAgreeTerms: string
    welcome: string
    fillAllFields: string
    processing: string
    continue: string
    backToMain: string
    checkingAuth: string
    pleaseWait: string
    enterCode: string
    codeVerification: string
    sendCodeAgain: string
    verificationComplete: string
    errorUserNotFound: string
    authError: string
    serverError: string
    loginSuccess: string
    accountCreated: string
    codeSent: string
    incorrectPassword: string,
    loginError: string,
    loginSuccessMessage: string
    // Forgot password
    forgotPassword: string
    forgotPasswordTitle: string
    enterCodeTitle: string
    newPasswordTitle: string
    forgotPasswordDesc: string
    enterCodeDesc: string
    newPasswordDesc: string
    sendCode: string
    verifyCode: string
    resendCodeBtn: string
    newPassword: string
    confirmNewPassword: string
    resetPassword: string
    codeSentToEmail: string
    codeVerified: string
    passwordChanged: string
    backToLogin: string
    // Password validation
    passwordTooCommon: string
    passwordTooShort: string
    passwordRepeatingDigits: string
    passwordSimpleSequence: string
    passwordNeedsLetterAndNumber: string
    errors: {
      auth_failed: string
      google_failed: string
      discord_failed: string
      no_code: string
      invalid_state: string
    }
  }
  products: {
    client30: string
    client30Desc: string
    client90: string
    client90Desc: string
    clientLifetime: string
    clientLifetimeDesc: string
    hwidReset: string
    hwidResetDesc: string
    premium30: string
    premium30Desc: string
    alpha: string
    alphaDesc: string
    fullFeatures: string
    updates: string
    support: string
    prioritySupport: string
    allUpdates: string
    instantReset: string
    newBinding: string
    exclusiveFeatures: string
    priorityQueue: string
    uniqueFeatures: string
  }
  currency: {
    symbol: string
    code: string
    priceLabel: string
    prices: {
      client30: number
      client90: number
      clientLifetime: number
      hwidReset: number
      premium30: number
      alpha: number
    }
  }
  legal: {
    usageRules: {
      title: string
      subtitle: string
      sections: {
        title: string
        paragraphs: string[]
        list?: { title: string; text: string }[]
      }[]
    }
    privacyPolicy: {
      title: string
      subtitle: string
      sections: {
        title: string
        paragraphs: string[]
        list?: string[]
      }[]
    }
    userAgreement: {
      title: string
      subtitle: string
      sections: {
        title: string
        paragraphs: string[]
        list?: { title: string; text: string }[]
      }[]
    }
  }
  devteam: {
    members: {
      nihmadev: {
        name: string
        role: string
        description: string
      }
      dkdajw: {
        name: string
        role: string
        description: string
      }
      killer: {
        name: string
        role: string
        description: string
      }
    }
    skills: {
      frontend: string
      backend: string
      webDesign: string
      launcherDev: string
      serverManagement: string
      cheatDevelopment: string
      testing: string
      qualityAssurance: string
      serverArchitecture: string
      bugHunting: string
      betaTesting: string
      stressTesting: string
    }
  }
}
