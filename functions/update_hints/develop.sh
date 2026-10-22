#!/bin/bash

SERVICE_ACCOUNT="bee-hints@lukwam-bee.iam.gserviceaccount.com"

# keep bee's impersonated credentials apart from the default gcloud ADC
BEE_GCLOUD_CONFIG="${HOME}/.config/gcloud-bee"
ADC="${BEE_GCLOUD_CONFIG}/application_default_credentials.json"

if [ ! -f "${ADC}" ]; then
    CLOUDSDK_CONFIG="${BEE_GCLOUD_CONFIG}" gcloud auth application-default login \
        --impersonate-service-account="${SERVICE_ACCOUNT}" || exit 1
fi

docker run -it --rm \
    -e GOOGLE_CLOUD_PROJECT="lukwam-bee" \
    -e GOOGLE_APPLICATION_CREDENTIALS="/etc/gcloud/adc.json" \
    -e ZYTE_API_KEY="$(gcloud secrets versions access latest --secret=zyte-api-key --project=lukwam-bee)" \
    -v "${ADC}":/etc/gcloud/adc.json:ro \
    -v "$(pwd)":/workspace \
    -w /workspace \
    bee
