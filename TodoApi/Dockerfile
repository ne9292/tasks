# 1. שלב הבנייה (Build) - משתמשים ב-SDK כדי לקמפל את הקוד
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# העתקת קובץ הפרויקט הספציפי שלך
COPY ["TodoApi.csproj", "./"]

# הרצת Restore להורדת כל חבילות ה-NuGet
RUN dotnet restore "TodoApi.csproj"

# העתקת כל שאר הקבצים (Controllers, Models וכו')
COPY . .

# בנייה ופרסום של האפליקציה לתיקיית publish
RUN dotnet publish "TodoApi.csproj" -c Release -o /app/publish

# 2. שלב ההרצה (Runtime) - משתמשים בסביבה קלה רק להרצה
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /app

# העתקת התוצר המוגמר מהשלב הקודם
COPY --from=build /app/publish .

# הגדרת הפקודה שתפעיל את ה-API כשהמכולה עולה
ENTRYPOINT ["dotnet", "TodoApi.dll"]