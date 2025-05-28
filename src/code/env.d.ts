declare global {
  interface ImportMetaEnv {
    // VITE_FIREBASE_API_KEY: string;
  }
}

export declare namespace NodeJS {
  interface ProcessEnv {
    readonly FIREBASE_API_KEY: string;
    readonly CLOUDINARY_CLOUD_NAME: string;
    readonly CLOUDINARY_API_KEY: string;
    readonly CLOUDINARY_API_SECRET: string;
  }
}

export {};
