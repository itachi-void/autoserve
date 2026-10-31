FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/CargoPulse.Domain/CargoPulse.Domain.csproj", "src/CargoPulse.Domain/"]
COPY ["src/CargoPulse.Application/CargoPulse.Application.csproj", "src/CargoPulse.Application/"]
COPY ["src/CargoPulse.Infrastructure/CargoPulse.Infrastructure.csproj", "src/CargoPulse.Infrastructure/"]
COPY ["src/CargoPulse.Api/CargoPulse.Api.csproj", "src/CargoPulse.Api/"]

RUN dotnet restore "src/CargoPulse.Api/CargoPulse.Api.csproj"

COPY . .
WORKDIR "/src/src/CargoPulse.Api"
RUN dotnet build "CargoPulse.Api.csproj" -c Release -o /app/build
RUN dotnet publish "CargoPulse.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "CargoPulse.Api.dll"]
