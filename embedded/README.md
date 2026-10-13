# Mushroom humidor firmware

PlatformIO project for the ESP32 that reads the BME280, drives the mister and publishes
telemetry to AWS IoT Core.

## Configuration

The firmware reads its AWS IoT settings and Wi-Fi credentials from
`mushroom-humidor/include/secrets.h`, which is git-ignored because it contains the device's
private key. `mushroom-humidor/include/secrets.h.template` shows what it contains.

Generate it from the deployed `MushroomIoTStack` before building:

```bash
WIFI_SSID='my-network' WIFI_PASSWORD='my-password' ./deployscripts/set-config.sh sandbox   # or prod
```

The script uses the `nakom.is-<env>` AWS profile, as `web/deployscripts/set-config.sh` does,
and fills in:

| Value | Source |
| --- | --- |
| `AWS_IOT_ENDPOINT` | `aws iot describe-endpoint --endpoint-type iot:Data-ATS` |
| `AWS_IOT_THING_NAME` | `MushroomThing` (checked with `aws iot describe-thing`) |
| `AWS_IOT_TOPIC_TELEMETRY` | `<thing name>/telemetry`, matching the IoT rule |
| `AWS_CERT_CA` | `mushroom-humidor/AmazonRootCA1.pem` |
| `AWS_CERT_CRT` | SSM parameter `/Mushroom/MushroomThing/certPem` |
| `AWS_CERT_PRIVATE` | SSM parameter `/Mushroom/MushroomThing/privKey` |

If `WIFI_SSID` / `WIFI_PASSWORD` are not set, the values in an existing `secrets.h` are kept.

Use `--dry-run` (or `DRY_RUN=1`) to print the header that would be written, with placeholder
AWS values, without calling AWS or touching `secrets.h`.
