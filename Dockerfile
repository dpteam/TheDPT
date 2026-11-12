# TheDPT: собираем кучу внутри контейнера и здороваемся
FROM node:22-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /dpt
COPY . .

RUN node tools/gen/index.mjs

CMD ["node", "dpt/DPT.js"]
