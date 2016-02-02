ISTANBUL = ./node_modules/.bin/istanbul
ESLINT = ./node_modules/.bin/eslint
MOCHA = ./node_modules/.bin/mocha

all: lint test coverage

# Tests
test:
	@$(ISTANBUL) cover --report text --report html _mocha

# Check code style
lint:
	@$(ESLINT) lib/**/*.js test/**/*.js

# Check coverage levels
coverage:
	@$(ISTANBUL) check-coverage --statement 45 --branch 45 --function 45

# Clean up
clean: clean-cov

clean-cov:
	@rm -rf coverage

.PHONY: all test lint coverage clean clean-cov

