#!/bin/bash

curl --silent --show-error --fail --location --request \
POST https://gitlab.com/api/v4/projects/${GITLAB_INFRASTRUCTURE_PROJECT_ID}/trigger/pipeline \
-d "ref=main" \
-d "token=${GITLAB_INFRASTRUCTURE_TRIGGER_TOKEN}" \
-d "variables[NAME]=<your application name>" \
-d "variables[ENVIRONMENT]=development" \
-d "variables[VERSION]=$1"