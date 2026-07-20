.PHONY: install serve pdf deploy help

help:
	@echo "  install   → Install Node.js dependencies"
	@echo "  serve     → Start local dev server at :3000"
	@echo "  pdf       → Generate PDF from index.html"
	@echo "  deploy    → Push to GitHub (commit + push)"

install:
	npm install

serve: install
	npm run serve

pdf: install
	npm run pdf

deploy:
	git add -A
	git commit -m "chore: update resume [skip ci]" || true
	git push
