FROM node:23-alpine

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY build/ .
#COPY package.json package-lock.json .
#RUN apt update && apt-get upgrade -y && apt install -y nodejs npm
RUN npm install


EXPOSE 3200
ENV PORT=3200
ENV BODY_SIZE_LIMIT=Infinity
ENV ORIGIN=https://account.partnerportal.me
CMD ["node","index.js"]
