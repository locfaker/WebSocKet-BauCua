# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["src/BauCua.Server/BauCua.Server.csproj", "src/BauCua.Server/"]
COPY ["src/BauCua.Shared/BauCua.Shared.csproj", "src/BauCua.Shared/"]
RUN dotnet restore "src/BauCua.Server/BauCua.Server.csproj"

# Copy the rest of the code
COPY . .
WORKDIR "/src/src/BauCua.Server"
RUN dotnet build "BauCua.Server.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "BauCua.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Render sets the PORT environment variable
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "BauCua.Server.dll"]
