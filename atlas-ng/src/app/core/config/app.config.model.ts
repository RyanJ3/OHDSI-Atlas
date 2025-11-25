export interface AuthProvider {
  name: string;
  url: string;
  ajax: boolean;
  icon: string;
  isUseCredentialsForm?: boolean;
}

export interface AppConfig {
  api: {
    name: string;
    url: string;
  };
  userAuthenticationEnabled: boolean;
  authProviders: AuthProvider[];
  cohortComparisonResultsEnabled: boolean;
  plpResultsEnabled: boolean;
  disableBrowserCheck: boolean;
  enablePermissionManagement: boolean;
  cacheSources: boolean;
  enableSkipLogin: boolean;
  useExecutionEngine: boolean;
  viewProfileDates: boolean;
  enableCosts: boolean;
  supportUrl: string;
  supportMail: string;
  feedbackContacts: string;
  feedbackCustomHtmlTemplate: string;
  companyInfoCustomHtmlTemplate: string;
  showCompanyInfo: boolean;
  defaultLocale: string;
  pollInterval: number;
  enableTermsAndConditions: boolean;
  enablePersonCount: boolean;
  enableTaggingSection: boolean;
  refreshTokenThreshold: number;
}

export const defaultConfig: AppConfig = {
  api: {
    name: 'OHDSI',
    url: '/WebAPI/',
  },
  userAuthenticationEnabled: false,
  authProviders: [],
  cohortComparisonResultsEnabled: false,
  plpResultsEnabled: false,
  disableBrowserCheck: false,
  enablePermissionManagement: true,
  cacheSources: false,
  enableSkipLogin: false,
  useExecutionEngine: false,
  viewProfileDates: false,
  enableCosts: false,
  supportUrl: 'https://github.com/ohdsi/atlas/issues',
  supportMail: 'atlasadmin@your.org',
  feedbackContacts: '',
  feedbackCustomHtmlTemplate: '',
  companyInfoCustomHtmlTemplate: '',
  showCompanyInfo: true,
  defaultLocale: 'en',
  pollInterval: 60000,
  enableTermsAndConditions: true,
  enablePersonCount: true,
  enableTaggingSection: false,
  refreshTokenThreshold: 240000,
};
