.PHONY: build ci clean cover docs graph image install push test

GIT_ARGS ?=
GIT_HEAD_BRANCH := $(shell git rev-parse --abbrev-ref HEAD)
NODE_ARGS ?=
RELEASE_ARGS ?= --sign

build: ## build the app
build: node_modules
	yarn tsc

ci: build cover

clean: clean-modules clean-target

clean-modules:
	rm -rf node_modules/

clean-target:
	rm -rf out/

docs:
	yarn api-extractor run -c config/api-extractor.json
	yarn api-documenter markdown -i out/temp -o out/docs

install:
	yarn

lint: ## run eslint
lint: node_modules
	yarn eslint src/ --ext .ts,.tsx

node_modules: install

out: build

push: ## push to both github and gitlab
	git push $(GIT_ARGS) github $(GIT_HEAD_BRANCH)
	git push $(GIT_ARGS) gitlab $(GIT_HEAD_BRANCH)

release: ## tag and push a release
release: node_modules
	if [[ "$(GIT_HEAD_BRANCH)" != master ]]; \
	then \
		echo "Please merge to master before releasing."; \
		exit 1; \
	fi
	yarn standard-version $(RELEASE_ARGS)
	GIT_ARGS=--follow-tags $(MAKE) push

MOCHA_ARGS := --async-only \
	--check-leaks \
	--forbid-only \
	--require source-map-support \
	--require out/test/setup.js \
	--recursive \
	--sort

test: ## run tests
test: node_modules out
	yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

COVER_ARGS := --all \
	--check-coverage \
	--exclude ".eslintrc.js" \
	--exclude "bundle/**" \
	--exclude "config/**" \
	--exclude "docs/**" \
	--exclude "out/bundle/**" \
	--exclude "out/coverage/**" \
	--exclude "test/**" \
	--reporter=text-summary \
	--reporter=lcov \
	--report-dir=out/coverage

cover: ## run tests with coverage
cover: node_modules out
	yarn c8 $(COVER_ARGS) yarn mocha $(MOCHA_ARGS) "out/**/Test*.js"

# from https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## print this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort \
		| sed 's/^.*\/\(.*\)/\1/' \
		| awk 'BEGIN {FS = ":[^:]*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

todo:
	@echo "Remaining tasks:"
	@echo ""
	@grep -i "todo" -r docs/ src/ test/ || true
	@echo ""
	@echo "Pending tests:"
	@echo ""
	@grep "[[:space:]]xit" -r test/ || true
	@echo ""
	@echo "Casts to any:"
	@echo ""
	@grep "as any" -r src/ test/ || true
	@echo ""
	@echo "Uses of null:"
	@echo ""
	@grep -P -e "null(?!able)" -r src/ test/ || true
	@echo ""
	@echo "Uses of ==:"
	@echo ""
	@grep -e "[^=!]==[^=]" -r src/ test/ || true
	@echo ""

# from https://gist.github.com/amitchhajer/4461043#gistcomment-2349917
git-stats: ## print git contributor line counts (approx, for fun)
	git ls-files | while read f; do git blame -w -M -C -C --line-porcelain "$$f" |\
		grep -I '^author '; done | sort -f | uniq -ic | sort -n

upload-climate:
	cc-test-reporter format-coverage -t lcov -o out/coverage/codeclimate.json -p . out/coverage/lcov.info
	cc-test-reporter upload-coverage --debug -i out/coverage/codeclimate.json -r "$(shell echo "${CODECLIMATE_SECRET}" | base64 -d)"
