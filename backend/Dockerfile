FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY Directory.Build.props FixSys.slnx ./
COPY src/FixSys.Domain/*.csproj src/FixSys.Domain/
COPY src/FixSys.Application/*.csproj src/FixSys.Application/
COPY src/FixSys.Infrastructure/*.csproj src/FixSys.Infrastructure/
COPY src/FixSys.Api/*.csproj src/FixSys.Api/
RUN dotnet restore src/FixSys.Api/FixSys.Api.csproj
COPY src/ src/
RUN dotnet publish src/FixSys.Api/FixSys.Api.csproj -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
ENV ASPNETCORE_URLS=http://+:8080
RUN mkdir -p /app/data && chown "$APP_UID" /app/data
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "FixSys.Api.dll"]
