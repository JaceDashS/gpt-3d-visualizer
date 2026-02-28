export interface AppItem {
  id: number;
  file: string;
}

export interface HomePhotoItem {
  id: number;
  variant: 'large' | 'small';
  file: string;
}

export interface CertificationDocument {
  type: 'pdf' | 'image';
  file: string;
}

export interface CertificationItem {
  basePath: string;
  icon: {
    file: string;
  };
  documents: CertificationDocument[];
}

export interface DataFile {
  basePath: string;
  file: string;
}

export interface AssetsManifest {
  version: number;
  generatedAt: string;
  sets: {
    apps?: {
      basePath: string;
      items: AppItem[];
    };
    homePhotos?: {
      basePath: string;
      items: HomePhotoItem[];
    };
    certifications?: {
      [key: string]: CertificationItem;
    };
    data?: {
      profileOverview?: DataFile;
    };
  };
}

export interface ProfileOverviewData {
  [key: string]: { // language code (en, ko, ja, zh)
    name: string;
    description: string;
    links?: { [key: string]: string };
  };
}

