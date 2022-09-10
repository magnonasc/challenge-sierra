.DEFAULT_GOAL:=help

INTERACTIVE:=$(shell [ -t 0 ] && echo i || echo d)
APP_DIR=/usr/hu
PWD=$(shell pwd)
APP_NAME?=$(shell pwd | xargs basename)
DOCKER_IMAGE_NAME:=hu/${APP_NAME}
DOCKER_STAGE?=development

setup: check-docker-image ## Install dependencies to run on Docker
ifeq ("$(wildcard ./.env)","")
	@cp .env.example .env
endif
	@make check-dependencies

check-docker-image:
ifeq ($(shell docker images -q ${DOCKER_IMAGE_NAME}-${DOCKER_STAGE} 2> /dev/null | wc -l | bc),0)
	@make build-docker-image
endif

build-docker-image: ## Build docker image if necessary
	@docker build --rm --target ${DOCKER_STAGE} . -t ${DOCKER_IMAGE_NAME}-${DOCKER_STAGE}

check-dependencies: ## Install dependencies if necessary
ifeq ("$(wildcard ./node_modules)","")
	@make docker-run DOCKER_COMMAND="yarn install"
endif

docker-run:
ifneq (${DOCKER_COMMAND},"")
	@DOCKER_COMMAND="sh -c \"${DOCKER_COMMAND}\""
endif
	@docker run -t${INTERACTIVE} --rm \
		--name ${APP_NAME} \
		--security-opt=seccomp:unconfined \
		--env-file .env \
		-v ${PWD}:${APP_DIR}:delegated \
		-w ${APP_DIR} \
		${DOCKER_RUN_ARGS} \
		${DOCKER_IMAGE_NAME}-${DOCKER_STAGE} \
		${DOCKER_COMMAND}

run-dev: setup ## Run project for development purposes
	@make docker-run DOCKER_COMMAND="truffle develop"

help: welcome
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep ^help -v | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'