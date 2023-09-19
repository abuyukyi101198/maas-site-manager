define PACKAGES
yarnpkg \
npm \
libasound2 \
libdbus-glib-1-2 \
libnss3 \
libnspr4 \
libgbm1 \
libatk1.0-0 \
libatk-bridge2.0-0 \
libcups2 \
libxkbcommon0 \
libatspi2.0-0 \
libxdamage1 \
libpango-1.0-0 \
libcairo2 \
libgtk-3-0 \
libpangocairo-1.0-0\
libcairo-gobject2
endef

FE_TEST_TIMEOUT = 15000
FE_TEST_RETRY = 3


install-dependencies:
	sudo -E DEBIAN_FRONTEND=noninteractive \
		apt -y install $(PACKAGES)
.PHONY: install-dependencies

ci-dep: install-dependencies
	YARN_CACHE_FOLDER=/var/cache/yarn yarnpkg install
	PLAYWRIGHT_BROWSERS_PATH=/var/cache/playwright-browsers npx --yes playwright install
.PHONY: ci-dep

ci-build:
	yarnpkg run build
.PHONY: ci-build

ci-lint:
	yarnpkg run lint
.PHONY: ci-lint

ci-test: unit-test e2e-test
.PHONY: ci-test

unit-test:
	VITEST_JUNIT_SUITE_NAME='maas-site-manager frontend tests' yarnpkg run coverage --test-timeout=$(FE_TEST_TIMEOUT) --retry=$(FE_TEST_RETRY) --silent --reporter=junit --reporter=default --outputFile.junit=../junit-frontend.xml
.PHONY: unit-test

e2e-test:
	PLAYWRIGHT_BROWSERS_PATH=/var/cache/playwright-browsers PLAYWRIGHT_JUNIT_OUTPUT_NAME=../junit-e2e.xml npx playwright test --reporter=junit
.PHONY: e2e-test
