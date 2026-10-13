#!/bin/bash

# This script generates the AWS configuration header (include/secrets.h) for the mushroom
# humidor firmware from the deployed MushroomIoTStack. It is the embedded counterpart of
# web/deployscripts/set-config.sh and should be run before building and flashing.
#
# Usage: set-config.sh [sandbox|prod] [--dry-run]
#
#   --dry-run (or DRY_RUN=1)  Do not call AWS; print the header that would be written to
#                             stdout, using placeholder values for anything from AWS.
#
# Wi-Fi credentials are not stored in AWS. They are taken from the WIFI_SSID and
# WIFI_PASSWORD environment variables if set, otherwise kept from an existing secrets.h.

set -euo pipefail

THING_NAME=MushroomThing
# Must match paramPrefix on the ThingWithCert construct in infra/lib/iot-stack.ts
PARAM_PREFIX=Mushroom

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
PROJECT_DIR="$SCRIPT_DIR/../mushroom-humidor"
TEMPLATE="$PROJECT_DIR/include/secrets.h.template"
OUTPUT="$PROJECT_DIR/include/secrets.h"
CA_FILE="$PROJECT_DIR/AmazonRootCA1.pem"

ENV=sandbox
DRY_RUN="${DRY_RUN:-0}"

function usage() {
    echo "Usage: $0 [sandbox|prod] [--dry-run]" >&2
    exit 1
}

for arg in "$@"; do
    case $arg in
        --dry-run) DRY_RUN=1 ;;
        sandbox|prod) ENV=$arg ;;
        -h|--help) usage ;;
        *)
            echo "Unknown argument: $arg" >&2
            usage
            ;;
    esac
done

# Escapes a value for use inside a C string literal
function cEscape() {
    local value="$1"
    value="${value//\\/\\\\}"
    value="${value//\"/\\\"}"
    printf '%s' "$value"
}

# Reads an already-escaped string literal from the existing secrets.h, if there is one
function existingValue() {
    local key="$1"
    [[ -f "$OUTPUT" ]] || return 0
    sed -n "s/^const char $key\[\] = \"\(.*\)\";\$/\1/p" "$OUTPUT" | head -n 1
}

# Status messages go to stderr so that a dry run's stdout is just the header
function log() {
    echo "$@" >&2
}

if [[ -n "${WIFI_SSID+x}" ]]; then
    WIFI_SSID_VALUE="$(cEscape "$WIFI_SSID")"
else
    WIFI_SSID_VALUE="$(existingValue WIFI_SSID)"
fi
if [[ -n "${WIFI_PASSWORD+x}" ]]; then
    WIFI_PASSWORD_VALUE="$(cEscape "$WIFI_PASSWORD")"
else
    WIFI_PASSWORD_VALUE="$(existingValue WIFI_PASSWORD)"
fi
[[ -n "$WIFI_SSID_VALUE" ]] || log "Warning: no Wi-Fi SSID; set WIFI_SSID or edit secrets.h afterwards"

PARAM_PATH="/$PARAM_PREFIX/$THING_NAME"

if [[ $DRY_RUN == 1 ]]; then
    log "Dry run for $ENV: not calling AWS"
    log "Would read: aws iot describe-endpoint --endpoint-type iot:Data-ATS"
    log "Would read: aws iot describe-thing --thing-name $THING_NAME"
    log "Would read: aws ssm get-parameter --name $PARAM_PATH/certPem"
    log "Would read: aws ssm get-parameter --name $PARAM_PATH/privKey"
    IOT_ENDPOINT="example-ats.iot.eu-west-2.amazonaws.com"
    CERT_PEM=$'-----BEGIN CERTIFICATE-----\nDRY-RUN-PLACEHOLDER\n-----END CERTIFICATE-----'
    PRIV_KEY=$'-----BEGIN RSA PRIVATE KEY-----\nDRY-RUN-PLACEHOLDER\n-----END RSA PRIVATE KEY-----'
else
    export AWS_PROFILE="nakom.is-$ENV"
    log "Using AWS profile $AWS_PROFILE ($(aws configure get region))"

    IOT_ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS --query endpointAddress --output text)
    log "Setting AWS_IOT_ENDPOINT to $IOT_ENDPOINT"

    # Fails here if the IoT stack has not been deployed to this account
    aws iot describe-thing --thing-name "$THING_NAME" --query thingName --output text > /dev/null

    CERT_PEM=$(aws ssm get-parameter --name "$PARAM_PATH/certPem" --query Parameter.Value --output text)
    PRIV_KEY=$(aws ssm get-parameter --name "$PARAM_PATH/privKey" --with-decryption --query Parameter.Value --output text)
    log "Read device certificate and private key from $PARAM_PATH"
fi

log "Setting AWS_IOT_THING_NAME to $THING_NAME"
log "Setting AWS_IOT_TOPIC_TELEMETRY to $THING_NAME/telemetry"

# Trailing newlines are trimmed so the PEM sits neatly inside the raw string literal
CA_PEM="$(cat "$CA_FILE")"

# awk does literal substitution of each @@KEY@@; values are passed via the environment so
# that backslashes and newlines are not interpreted
function render() {
    S_WIFI_SSID="$WIFI_SSID_VALUE" \
    S_WIFI_PASSWORD="$WIFI_PASSWORD_VALUE" \
    S_AWS_IOT_ENDPOINT="$(cEscape "$IOT_ENDPOINT")" \
    S_AWS_IOT_THING_NAME="$(cEscape "$THING_NAME")" \
    S_AWS_IOT_TOPIC_TELEMETRY="$(cEscape "$THING_NAME/telemetry")" \
    S_AWS_CERT_CA="$CA_PEM" \
    S_AWS_CERT_CRT="$CERT_PEM" \
    S_AWS_CERT_PRIVATE="$PRIV_KEY" \
    awk '
        {
            line = $0
            out = ""
            while (match(line, /@@[A-Z_]+@@/)) {
                key = substr(line, RSTART + 2, RLENGTH - 4)
                if (!(("S_" key) in ENVIRON)) {
                    print "Unknown placeholder: " key > "/dev/stderr"
                    exit 1
                }
                out = out substr(line, 1, RSTART - 1) ENVIRON["S_" key]
                line = substr(line, RSTART + RLENGTH)
            }
            print out line
        }
    ' "$TEMPLATE"
}

if [[ $DRY_RUN == 1 ]]; then
    log "Would write $(readlink -f "$OUTPUT"):"
    render
    exit 0
fi

TMP_OUTPUT="$(mktemp "$OUTPUT.XXXXXX")"
trap 'rm -f "$TMP_OUTPUT"' EXIT
render > "$TMP_OUTPUT"
# The header contains the device's private key
chmod 600 "$TMP_OUTPUT"
mv "$TMP_OUTPUT" "$OUTPUT"
trap - EXIT
log "Wrote $(readlink -f "$OUTPUT")"
