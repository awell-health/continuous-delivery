#!/bin/bash

API_KEY=$PLATFORM_API_KEY
TAG=$2
ENVIRONMENT=$1
STATUS=$3
isoDate=$(date -Iseconds)

if [[ "$STATUS" == "canceled" ]]; then
    echo "cancelled CI Job - not updating dashboard"
    exit 0
fi

jsonData=$(jq -n \
                  --arg name "awell-platform" \
                  --arg version "$TAG" \
                  --arg date "$isoDate" \
                  --arg environment "$ENVIRONMENT" \
                  --arg status "$STATUS" \
                  '{name: $name, version: $version, date: $date, environment: $environment, status: $status}')

curl --silent --show-error --fail --location --request POST ${PLATFORM_ENDPOINT}/releases \
--header 'Content-Type: application/json' \
--header 'some-api-key-header: '"${API_KEY}"'' \
--data-raw "$jsonData"