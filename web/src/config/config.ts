import  Config from './config.json'

export interface MushroomConfig {
  env: string;
  aws: {
    region: string;
    telemetryTableName: string;
    commandTableName: string;
  };
  cognito: {
    authority: string;
    userPoolId: string;
    userPoolClientId: string;
    cognitoDomain: string;
    redirectUri: string;
    logoutUri: string;
    identityPoolId: string;
  };
}

export default Config as MushroomConfig;
