# שלב 1: בנייה (Build)
FROM node:18-alpine AS build

# הגדרת תיקיית העבודה בתוך המכולה
WORKDIR /app

# העתקת קבצי ההגדרות והתקנת חבילות
COPY package*.json ./
RUN npm install

# העתקת שאר קבצי הפרויקט ובנייה
COPY . .
RUN npm run build

# שלב 2: הגשת הקבצים (Serving) בעזרת שרת קל
FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build ./build

# חשיפת הפורט והרצה
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]