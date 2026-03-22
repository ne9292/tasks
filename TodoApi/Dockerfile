# שלב 1: בנייה - נשתמש ב-SDK של גרסה 9.0
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# העתקת קובץ הפרויקט
COPY ["TodoApi.csproj", "./"]
RUN dotnet restore "TodoApi.csproj"

# העתקת שאר הקבצים ובנייה
COPY . .
RUN dotnet publish "TodoApi.csproj" -c Release -o /app/publish

# שלב 2: הרצה - נשתמש ב-Runtime של גרסה 9.0
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# חשיפת פורט
EXPOSE 80

ENTRYPOINT ["dotnet", "TodoApi.dll"]