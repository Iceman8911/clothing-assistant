declare global {
  interface ImportMetaEnv {
    // VITE_FIREBASE_API_KEY: string;
  }
}

export declare namespace NodeJS {
  interface ProcessEnv {
    readonly FIREBASE_API_KEY: string;
    readonly CLOUDINARY_URL: string;
  }
}

export {};
