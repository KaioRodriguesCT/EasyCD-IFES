FROM node:alpine

#Set which folder will be used inside the container 
WORKDIR /usr/src/app

#Copy all the others files to the WORKDIR, using the .dockerignore to say which file or folder should not be copy
COPY . .

#Install all dependencies
RUN yarn install

#ENV variables
ENV ENVIRONMENT=development

#Start the application
CMD ["yarn","dev"]