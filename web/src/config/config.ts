
export interface MushroomConfig {
  env: string;
  aws: {
    region: string;
    telemetryTableName: string;
    commandTableName: string;
    // Devices to read telemetry and commands for; defaults to ["d1"] when absent
    deviceIds?: string[];
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

let Config: MushroomConfig = require('./config.json');

export default Config;
