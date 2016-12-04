FROM node:7-slim

COPY package.json /code/package.json
WORKDIR /code

RUN npm install --production && \
    chmod 755 -R .

COPY . /code

EXPOSE 3000

CMD ["node", "--harmony", "bin/www"]
