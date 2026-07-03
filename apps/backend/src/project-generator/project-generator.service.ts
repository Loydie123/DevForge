import { Injectable, BadRequestException } from '@nestjs/common';
import JSZip from 'jszip';
import { GeneratorFeatures } from '@devforge/project-generator';

@Injectable()
export class ProjectGeneratorService {
  /**
   * Generates a zip archive containing framework boilerplate templates.
   */
  async generateProject(
    name: string,
    framework: string,
    features: GeneratorFeatures,
  ): Promise<Buffer> {
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-');

    if (!cleanName) {
      throw new BadRequestException('Invalid project name.');
    }

    const zip = new JSZip();
    const files = this.getTemplateFiles(cleanName, framework, features);

    // Populate zip archive
    for (const [filePath, content] of Object.entries(files)) {
      zip.file(`${cleanName}/${filePath}`, content.trim() + '\n');
    }

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  private getTemplateFiles(
    name: string,
    framework: string,
    features: GeneratorFeatures,
  ): Record<string, string> {
    const files: Record<string, string> = {};

    // 1. Core README.md
    files['README.md'] = `
# 🚀 ${name}

This project was bootstrapped using the **DevForge Project Generator**.

## 🛠️ Framework Details
- **Framework**: ${framework.toUpperCase()}
- **Database Integrated**: ${features.database ? 'Yes' : 'No'}
- **JWT Auth & RBAC Setup**: ${features.auth ? 'Yes' : 'No'}
- **Docker Containerized**: ${features.docker ? 'Yes' : 'No'}

## 📦 How to Run

### Local Setup
${this.getLocalRunInstructions(framework)}

${features.docker ? `### Docker Setup\n\`\`\`bash\ndocker-compose up --build\n\`\`\`` : ''}
`;

    // 2. Docker & docker-compose configurations
    if (features.docker) {
      files['docker-compose.yml'] = `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "${this.getFrameworkPort(framework)}:${this.getFrameworkPort(framework)}"
    environment:
      - NODE_ENV=development
      - PORT=${this.getFrameworkPort(framework)}
      - DATABASE_URL=${features.database ? this.getDefaultDbUrl() : ''}
      - JWT_SECRET=devforge_super_secret_key_12345
`;
    }

    // 3. Framework-specific boilerplates
    switch (framework.toLowerCase()) {
      case 'nestjs':
        this.populateNestJs(files, name, features);
        break;
      case 'gofiber':
        this.populateGoFiber(files, name, features);
        break;
      case 'django':
        this.populateDjango(files, name, features);
        break;
      case 'nextjs':
        this.populateNextJs(files, name, features);
        break;
      case 'express':
        this.populateExpress(files, name, features);
        break;
      case 'fastify':
        this.populateFastify(files, name, features);
        break;
      case 'laravel':
        this.populateLaravel(files, name, features);
        break;
      case 'springboot':
        this.populateSpringBoot(files, name, features);
        break;
      case 'aspnet':
        this.populateAspNet(files, name, features);
        break;
      case 'angular':
        this.populateAngular(files, name, features);
        break;
      default:
        throw new BadRequestException(`Unsupported framework: ${framework}`);
    }

    return files;
  }

  private getFrameworkPort(framework: string): string {
    const ports: Record<string, string> = {
      nestjs: '3000',
      gofiber: '8080',
      django: '8000',
      nextjs: '3000',
      express: '3000',
      fastify: '3000',
      laravel: '8000',
      springboot: '8080',
      aspnet: '5000',
      angular: '4200',
    };
    return ports[framework.toLowerCase()] || '3000';
  }

  private getDefaultDbUrl(): string {
    return 'postgresql://postgres:postgres@localhost:5432/devforge_db';
  }

  private getLocalRunInstructions(framework: string): string {
    switch (framework.toLowerCase()) {
      case 'nestjs':
      case 'nextjs':
      case 'express':
      case 'fastify':
      case 'angular':
        return `\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``;
      case 'gofiber':
        return `\`\`\`bash\ngo mod tidy\ngo run main.go\n\`\`\``;
      case 'django':
        return `\`\`\`bash\npip install -r requirements.txt\npython manage.py runserver\n\`\`\``;
      case 'laravel':
        return `\`\`\`bash\ncomposer install\nphp artisan key:generate\nphp artisan serve\n\`\`\``;
      case 'springboot':
        return `\`\`\`bash\n./mvnw spring-boot:run\n\`\`\``;
      case 'aspnet':
        return `\`\`\`bash\ndotnet restore\ndotnet run\n\`\`\``;
      default:
        return `Refer to official documentation.`;
    }
  }

  // --- Framework Builders ---

  private populateNestJs(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['package.json'] = JSON.stringify(
      {
        name,
        version: '1.0.0',
        scripts: {
          build: 'nest build',
          start: 'nest start',
          'start:dev': 'nest start --watch',
        },
        dependencies: {
          '@nestjs/common': '^10.0.0',
          '@nestjs/core': '^10.0.0',
          '@nestjs/platform-express': '^10.0.0',
          'reflect-metadata': '^0.1.13',
          rxjs: '^7.8.1',
          ...(features.auth
            ? { '@nestjs/jwt': '^10.0.0', bcrypt: '^5.1.0' }
            : {}),
        },
        devDependencies: {
          '@nestjs/cli': '^10.0.0',
          typescript: '^5.1.3',
        },
      },
      null,
      2,
    );

    files['tsconfig.json'] = JSON.stringify(
      {
        compilerOptions: {
          module: 'commonjs',
          declaration: true,
          target: 'es2021',
          sourceMap: true,
          outDir: './dist',
          rootDir: './src',
          strict: true,
        },
      },
      null,
      2,
    );

    files['src/main.ts'] = `
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(3000);
  console.log('NestJS server running on http://localhost:3000/api');
}
bootstrap();
`;

    files['src/app.module.ts'] = `
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
${features.auth ? "import { AuthModule } from './auth/auth.module';" : ''}

@Module({
  imports: [
    ${features.auth ? 'AuthModule,' : ''}
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
`;

    files['src/app.controller.ts'] = `
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return { status: 'healthy', timestamp: Date.now() };
  }
}
`;

    files['src/app.service.ts'] = `
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {}
`;

    if (features.auth) {
      files['src/auth/auth.module.ts'] = `
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'devforge_jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
`;

      files['src/auth/auth.controller.ts'] = `
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.username, body.password);
  }
}
`;

      files['src/auth/auth.service.ts'] = `
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(user: string, pass: string) {
    if (user === 'admin' && pass === 'password') {
      const payload = { username: user, role: 'admin' };
      return {
        accessToken: this.jwtService.sign(payload),
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }
}
`;
    }

    if (features.docker) {
      files['Dockerfile'] = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
`;
    }
  }

  private populateGoFiber(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['go.mod'] = `
module ${name}

go 1.20

require (
	github.com/gofiber/fiber/v2 v2.48.0
	${features.auth ? 'github.com/golang-jwt/jwt/v5 v5.0.0' : ''}
)
`;

    files['main.go'] = `
package main

import (
	"log"
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/api/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "healthy",
		})
	})

	${features.auth ? 'setupAuthRoutes(app)' : ''}

	log.Fatal(app.Listen(":8080"))
}
`;

    if (features.auth) {
      files['auth.go'] = `
package main

import (
	"time"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func setupAuthRoutes(app *fiber.App) {
	app.Post("/api/auth/login", func(c *fiber.Ctx) error {
		type LoginRequest struct {
			Username string \`json:"username"\`
			Password string \`json:"password"\`
		}
		var req LoginRequest
		if err := c.BodyParser(&req); err != nil {
			return c.Status(400).SendString("Bad Request")
		}

		if req.Username == "admin" && req.Password == "password" {
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"username": req.Username,
				"role":     "admin",
				"exp":      time.Now().Add(time.Hour * 24).Unix(),
			})
			tokenString, _ := token.SignedString([]byte("devforge_secret"))
			return c.JSON(fiber.Map{"accessToken": tokenString})
		}
		return c.Status(401).SendString("Unauthorized")
	})
}
`;
    }

    if (features.docker) {
      files['Dockerfile'] = `
FROM golang:1.20-alpine
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .
EXPOSE 8080
CMD ["./main"]
`;
    }
  }

  private populateDjango(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['requirements.txt'] = `
django>=4.0
djangorestframework>=3.13
django-cors-headers>=3.11
${features.auth ? 'PyJWT>=2.4.0' : ''}
`;

    files['manage.py'] = `
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError("Couldn't import Django.") from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`;

    files['config/settings.py'] = `
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-devforge-key'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'corsheaders',
    'rest_framework',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'config.urls'
CORS_ALLOW_ALL_ORIGINS = True
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
`;

    files['config/urls.py'] = `
from django.urls import path
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "healthy"})

urlpatterns = [
    path('api/health', health_check),
]
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
`;
    }
  }

  private populateNextJs(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['package.json'] = JSON.stringify(
      {
        name,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
        },
        dependencies: {
          next: '14.0.0',
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          ...(features.auth ? { jose: '^5.0.0' } : {}),
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/node': '^20.0.0',
          '@types/react': '^18.2.0',
        },
      },
      null,
      2,
    );

    files['next.config.js'] = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
module.exports = nextConfig
`;

    files['src/app/layout.tsx'] = `
import React from 'react';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#090d16', color: '#fff', fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
`;

    files['src/app/page.tsx'] = `
import React from 'react';

export default function Home() {
  return (
    <main style={{ padding: '4rem', textAlign: 'center' }}>
      <h1>🚀 Welcome to ${name}!</h1>
      <p>Genererated successfully via DevForge Project Generator</p>
      <div style={{ marginTop: '2rem' }}>
        <a href="/api/health" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 'bold' }}>
          Check Health Endpoint 📡
        </a>
      </div>
    </main>
  );
}
`;

    files['src/app/api/health/route.ts'] = `
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'healthy', timestamp: Date.now() });
}
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
`;
    }
  }

  private populateExpress(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['package.json'] = JSON.stringify(
      {
        name,
        version: '1.0.0',
        main: 'src/index.js',
        scripts: {
          start: 'node src/index.js',
          dev: 'nodemon src/index.js',
        },
        dependencies: {
          express: '^4.18.2',
          cors: '^2.8.5',
          dotenv: '^16.0.3',
          ...(features.auth
            ? { jsonwebtoken: '^9.0.0', bcryptjs: '^2.4.3' }
            : {}),
        },
      },
      null,
      2,
    );

    files['src/index.js'] = `
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: '${name}' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Express server running on port \${PORT}\`);
});
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
`;
    }
  }

  private populateFastify(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['package.json'] = JSON.stringify(
      {
        name,
        version: '1.0.0',
        scripts: {
          start: 'node src/index.js',
        },
        dependencies: {
          fastify: '^4.20.0',
          '@fastify/cors': '^8.3.0',
          ...(features.auth ? { '@fastify/jwt': '^7.2.0' } : {}),
        },
      },
      null,
      2,
    );

    files['src/index.js'] = `
const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/cors'), {});

fastify.get('/api/health', async (request, reply) => {
  return { status: 'healthy' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/index.js"]
`;
    }
  }

  private populateLaravel(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['composer.json'] = JSON.stringify(
      {
        name: `devforge/${name}`,
        type: 'project',
        description: 'The Laravel Framework skeleton.',
        require: {
          php: '^8.1',
          'laravel/framework': '^10.0',
        },
      },
      null,
      2,
    );

    files['routes/api.php'] = `
<?php
use Illuminate\\Support\\Facades\\Route;

Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM php:8.1-fpm-alpine
WORKDIR /var/www
COPY . .
EXPOSE 9000
CMD ["php-fpm"]
`;
    }
  }

  private populateSpringBoot(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['pom.xml'] = `
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>${name}</artifactId>
    <version>1.0.0</version>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.0</version>
    </parent>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
</project>
`;

    files['src/main/java/com/example/demo/DemoApplication.java'] = `
package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class DemoApplication {
    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    @GetMapping("/api/health")
    public String health() {
        return "{\\"status\\":\\"healthy\\"}";
    }
}
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY . .
RUN ./mvnw package -DskipTests
EXPOSE 8080
CMD ["java", "-jar", "target/${name}-1.0.0.jar"]
`;
    }
  }

  private populateAspNet(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files[`${name}.csproj`] = `
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net7.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
`;

    files['Program.cs'] = `
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

app.Run("http://localhost:5000");
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:7.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 5000
ENTRYPOINT ["dotnet", "${name}.dll"]
`;
    }
  }

  private populateAngular(
    files: Record<string, string>,
    name: string,
    features: GeneratorFeatures,
  ) {
    files['package.json'] = JSON.stringify(
      {
        name,
        version: '0.0.0',
        scripts: {
          start: 'ng serve',
          build: 'ng build',
        },
        dependencies: {
          '@angular/common': '^16.0.0',
          '@angular/compiler': '^16.0.0',
          '@angular/core': '^16.0.0',
          '@angular/platform-browser': '^16.0.0',
          rxjs: '~7.8.0',
          tslib: '^2.3.0',
          'zone.js': '~0.13.0',
        },
        devDependencies: {
          '@angular/cli': '^16.0.0',
          typescript: '~5.0.2',
        },
      },
      null,
      2,
    );

    files['src/main.ts'] = `
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent).catch(err => console.error(err));
`;

    files['src/app/app.component.ts'] = `
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: \`
    <div style="text-align:center; padding: 4rem; font-family: sans-serif; background-color: #0b0f19; color: #fff; height: 100vh;">
      <h1>🚀 Welcome to ${name} (Angular)</h1>
      <p>Bostrapped successfully via DevForge Project Generator</p>
    </div>
  \`,
})
export class AppComponent {}
`;

    if (features.docker) {
      files['Dockerfile'] = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4200
CMD ["npx", "http-server", "dist/${name}", "-p", "4200"]
`;
    }
  }
}
