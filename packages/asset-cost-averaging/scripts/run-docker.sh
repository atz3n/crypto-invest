#!/bin/bash

# Runs the docker-compose project

###################################################################################################
# CONFIGURATION
###################################################################################################

PROJECT_NAME="asset-cost-averaging"


###################################################################################################
# DEFINES
###################################################################################################

HERE="$(pwd)/$(dirname $0)"


###################################################################################################
# MAIN
###################################################################################################

SUDO=""
if [ $(uname) == Linux ]; then
    SUDO="sudo"
fi

cd ${HERE}/../docker
${SUDO} docker compose -p ${PROJECT_NAME} up -d