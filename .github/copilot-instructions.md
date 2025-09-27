# GitHub Copilot Instructions for NestJS Logger Service

## Project Architecture

This is a **NestJS REST API logger service** built with **TypeORM + PostgreSQL**, following **Domain-Driven Design (DDD)** and **Clean Architecture** patterns as part of a microservices ecosystem.

### Core Structure Patterns

- **Domain Layer**: `src/{module}/domain/` - Pure business entities (e.g., `User`, `Role`, `Status`)
- **Infrastructure Layer**: `src/{module}/infrastructure/persistence/relational/` - Database implementations with TypeORM
- **Application Layer**: Controllers, Services, DTOs at module root level
- **Configuration**: Centralized typed config system in `src/config/` using `@nestjs/config`

### Module Organization

Every feature follows this DDD structure:

```
src/users/
  ├── domain/user.ts              # Pure domain entity with business rules
  ├── dto/                        # Request/response DTOs with validation
  ├── infrastructure/
  │   └── persistence/
  │       ├── relational/
  │       │   ├── entities/user.entity.ts     # TypeORM database entity
  │       │   ├── repositories/user.repository.ts  # Repository implementation
  │       │   └── mappers/user.mapper.ts      # Domain ↔ Database mapping
  │       └── user.repository.ts              # Abstract repository interface
  ├── users.controller.ts         # REST API endpoints with Swagger docs
  ├── users.service.ts           # Business logic orchestration
  └── users.module.ts            # NestJS module with dependency injection
```

## Development Workflows

### Database Operations

```bash
# Generate migration after entity changes
npm run migration:generate -- src/database/migrations/FeatureName
npm run migration:run

# Database seeding
npm run seed:run:relational

# Create new resource with full DDD structure
npm run generate:resource:relational
```

### Testing & Docker

```bash
# E2E tests with isolated Docker environment
npm run test:e2e:relational:docker

# Development with Docker Compose
docker compose up -d          # PostgreSQL, Adminer (port 8080), MailDev
npm run start:dev             # Watch mode development

# Production build
npm run build && npm run start:prod
```

## Project-Specific Conventions

### Repository Pattern Implementation

Always use abstract repository interfaces in domain layer:

```typescript
// Abstract interface in domain
export abstract class UserRepository {
  abstract create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<User>;
  abstract findById(id: User['id']): Promise<NullableType<User>>;
}

// Implementation in infrastructure
@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}
  // TypeORM implementation with entity mapping
}
```

### Configuration System

- **Typed configs**: Each module has config in `{module}/config/{module}.config.ts`
- **Environment validation**: Use `registerAs()` with validation schemas
- **Access pattern**: `ConfigService<AllConfigType>` for type safety
- **Registration**: All configs loaded in `app.module.ts` ConfigModule

### Authentication & Authorization

```typescript
// JWT + Refresh token strategy
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@SerializeOptions({ groups: ['me'] })  // Response serialization control

// Role-based access (when needed)
@Roles(RoleEnum.admin)
@UseGuards(RolesGuard)
```

### Entity Mapping Pattern

- **Domain entities**: Pure TypeScript classes with `@ApiProperty()` for Swagger
- **TypeORM entities**: Extend `EntityRelationalHelper`, use `@Index()` for performance
- **Mappers**: Static methods converting between domain and persistence layers
- **Serialization**: `@Expose({ groups: [...] })` and `@Exclude()` for API responses

### File Structure Rules

- **Soft deletes**: Use `@DeleteDateColumn()` on entities, never hard delete
- **Eager loading**: Configure relationships with `{ eager: true }` when appropriate
- **Validation**: DTOs use `class-validator` with custom `validation-options.ts`
- **Error handling**: 422 for validation, consistent error structure

## Integration Points

### Docker Development Environment

- **Database**: PostgreSQL on port 5432 with Adminer UI on 8080
- **Email**: MailDev for development (SMTP: 1025, Web: 1080)
- **Isolation**: E2E tests use separate Docker Compose for clean state

### Configuration Management

```typescript
// Environment-based configuration loading
DATABASE_TYPE=postgres
AUTH_JWT_SECRET=secret
AUTH_JWT_TOKEN_EXPIRES_IN=15m
FILE_DRIVER=local  // Supports "local", "s3", "s3-presigned"
```

### File Upload Strategy

- **Multi-provider**: Local filesystem and S3 via strategy pattern
- **Configuration**: `FILE_DRIVER` environment variable switches implementation
- **Integration**: File entities linked via `OneToOne` relationships

### Internationalization

- **System**: `nestjs-i18n` with header-based language resolution
- **Header**: `x-custom-lang` for language switching
- **Templates**: Handlebars templates in `src/i18n/{locale}/`

### Email System

- **Dual approach**: `MailModule` (templated) and `MailerModule` (simple)
- **Development**: MailDev container for email testing
- **Templates**: Handlebars in `src/mail/mail-templates/`

## Performance & Security Notes

- **Connection pooling**: Configured via `DATABASE_MAX_CONNECTIONS`
- **JWT strategy**: Validates tokens without database lookup (see auth documentation)
- **Pagination**: Use `infinity-pagination.ts` helpers
- **Serialization**: Custom interceptor for promise resolution
- **Password hashing**: bcryptjs with secure defaults

When implementing features, follow the DDD module structure, use the abstract repository pattern, and ensure proper domain/infrastructure separation. The logger service is designed to be a standalone microservice within the larger system architecture.
