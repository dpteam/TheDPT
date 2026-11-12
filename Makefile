# TheDPT — всё собирается одной командой

NODE ?= node
FFMPEG ?= ffmpeg

.PHONY: all gen icon verify clean dpt count

all: icon gen verify

icon:
	$(NODE) tools/icon.mjs

gen:
	$(NODE) tools/gen/index.mjs

verify:
	$(NODE) tools/verify.mjs

# просто поздороваться
dpt:
	@$(NODE) dpt/DPT.js

count:
	@ls dpt | wc -l

clean:
	rm -rf dpt assets/icon*.png assets/favicon.ico assets/banner.png
