declare global {
  interface ImportMetaEnv {
    // VITE_FIREBASE_API_KEY: string;
  }
}

declare namespace NodeJS {
  interface Process {
    readonly FIREBASE_API_KEY: string;
  }
}

export {};
