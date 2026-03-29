# Phase 1: Implementation Steps (Code Reference)

Companion to [phase-01-setup-and-auth.md](./phase-01-setup-and-auth.md).

---

## Step 1 — Install Package

```bash
cd backend
npm install @nestjs/swagger
```

Verify the installed version is ^11.x (compatible with NestJS 11). `swagger-ui-express` is bundled — no separate install needed.

---

## Step 2 — Update `main.ts`

Add after `app.useGlobalPipes(...)`, before `app.listen()`:

```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// inside bootstrap():
if (process.env.NODE_ENV !== 'production') {
  const config = new DocumentBuilder()
    .setTitle('Tiny LMS API')
    .setDescription('REST API for Tiny LMS — NestJS 11 backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```

---

## Step 3 — Create `auth/dto/auth.dto.ts`

New file. Converts 5 inline interfaces to exported classes with `@ApiProperty` and `class-validator` decorators:

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  fullName?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token from reset email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newPassword123', minLength: 6 })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Supabase refresh token' })
  @IsString()
  refreshToken: string;
}
```

---

## Step 4 — Update `auth.controller.ts`

Replace inline interface refs, add Swagger decorators. Key additions per endpoint:

```typescript
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto }
  from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'User registered, returns tokens' })
  @ApiResponse({ status: 400, description: 'Validation error or email already in use' })
  async register(@Body() body: RegisterDto) { ... }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiResponse({ status: 200, description: 'Returns access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) { ... }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate current session (token read from Authorization header)' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Request() req: any) { ... }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Returns new access and refresh tokens' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body() body: RefreshTokenDto) { ... }

  @UseGuards(SupabaseAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async me(@Request() req: any) { ... }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
  async forgotPassword(@Body() body: ForgotPasswordDto) { ... }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email link' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() body: ResetPasswordDto) { ... }
}
```

Note: `...` placeholders represent unchanged method bodies — do not alter service call logic.
