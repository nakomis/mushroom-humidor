#!/bin/bash

# This script is intended to set the configuration for the mushroom humidor web application.
# It should be run before the build process to ensure that the application has the correct settings.

function setValue() {
    local key="$1"
    local value="$2"
    echo "Setting $key to $value"
    local file="$SCRIPT_DIR/../src/config/config.json"
    sed -i.bk "s|\"$key\": \".*\"|\"$key\": \"$value\"|g" "$file"
}

PARAM=$1
ENV="${PARAM:=sandbox}"
SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"

rm -rf $SCRIPT_DIR/../src/config/config.json
cp $SCRIPT_DIR/../src/config/config.json.template $SCRIPT_DIR/../src/config/config.json

setValue env $ENV

setValue region $(aws configure get region)

setValue tableName MushroomTelemetry

USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 60 | jq -r '.UserPools[] | select(.Name == "MushroomUserPool") | .Id')

setValue authority "https://cognito-idp.eu-west-2.amazonaws.com/"$USER_POOL_ID

setValue userPoolId $USER_POOL_ID

USER_POOL_CLIENT_ID=$(aws cognito-idp list-user-pool-clients --user-pool-id $USER_POOL_ID | jq -r '.UserPoolClients[] | select(.ClientName == "MushroomUserPoolClient") | .ClientId')

setValue userPoolClientId $USER_POOL_CLIENT_ID

case $ENV in
    prod)
        setValue redirectUri "https://mushrooms.nakomis.com/loggedin"
        setValue logoutUri "https://mushrooms.nakomis.com/logout"
        setValue cognitoDomain "auth.mushrooms.nakomis.com"
        ;;
    sandbox)
        setValue redirectUri "https://mushrooms.sandbox.nakomis.com/loggedin"
        setValue logoutUri "https://mushrooms.sandbox.nakomis.com/logout"
        setValue cognitoDomain "auth.mushrooms.sandbox.nakomis.com"
        ;;
    localhost)
        setValue redirectUri "http://localhost:3000/loggedin"
        setValue logoutUri "http://localhost:3000/logout"
        setValue cognitoDomain "auth.mushrooms.sandbox.nakomis.com"
        ;;
    *)
        echo "Unknown environment: $ENV"
        exit 1
        ;;
esac

IDENTITY_POOL_ID=$(aws cognito-identity list-identity-pools --max-results 60 | jq -r '.IdentityPools[] | select(.IdentityPoolName == "MushroomIdentityPool") | .IdentityPoolId')

setValue identityPoolId $IDENTITY_POOL_ID

rm -f $SCRIPT_DIR/../src/config/config.json.bk