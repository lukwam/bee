#!/bin/bash

docker run -it --rm \
    -e GOOGLE_CLOUD_PROJECT="lukwam-bee" \
    -e GOOGLE_APPLICATION_CREDENTIALS="/workspace/etc/service_account.json" \
    -v "$(pwd)":/workspace \
    -w /workspace \
    bee