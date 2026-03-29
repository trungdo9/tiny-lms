# Phase 5: Admin Endpoints

## Overview

**Date:** 2026-02-28
**Priority:** Medium
**Status:** Pending

Create admin user management endpoints.

## Context

- Related: `backend/src/modules/users/`
- Dependencies: Phase 2, Phase 3

## Key Insights

- No admin user management currently
- Need CRUD for users
- Need role management

## Requirements

1. Create admin user listing with filters
2. Create admin user update endpoints
3. Create role management
4. Add pagination support

## Architecture

```
Admin Endpoints:
GET    /admin/users          - List all users (paginated)
GET    /admin/users/:id      - Get user by ID
PUT    /admin/users/:id      - Update user (role, status)
DELETE /admin/users/:id      - Deactivate user
GET    /admin/users/:id/login-history - Login history
PUT    /admin/users/:id/role - Change user role
```

## Related Files

- `backend/src/modules/users/users.controller.ts`
- `backend/src/modules/users/users.service.ts`

## Implementation Steps

1. Create admin controller `users-admin.controller.ts`:
   ```typescript
   @Controller('admin/users')
   @UseGuards(SupabaseAuthGuard, RolesGuard)
   @Roles(Role.ADMIN)
   export class UsersAdminController {
     constructor(private usersService: UsersService) {}

     @Get()
     listUsers(@Query() query: UserQueryDto) { ... }

     @Get(':id')
     getUser(@Param('id') id: string) { ... }

     @Put(':id')
     updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) { ... }

     @Delete(':id')
     deactivateUser(@Param('id') id: string) { ... }

     @Get(':id/login-history')
     getLoginHistory(@Param('id') id: string) { ... }

     @Put(':id/role')
     changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto) { ... }
   }
   ```

2. Add admin methods to UsersService:
   - `findAll(query)` - List with pagination, filters
   - `findById(id)` - Get single user
   - `update(id, data)` - Update user
   - `deactivate(id)` - Soft delete
   - `changeRole(id, role)` - Change role

3. Create DTOs:
   - `user-query.dto.ts` - pagination, filters
   - `update-user.dto.ts` - update fields
   - `change-role.dto.ts` - role change

4. Register in module

## Todo List

- [ ] Create admin controller
- [ ] Add admin service methods
- [ ] Create DTOs
- [ ] Register module

## Success Criteria

- [ ] Admin can list users
- [ ] Admin can update user
- [ ] Admin can change roles
- [ ] Pagination works

## Security Considerations

- Only ADMIN role can access
- Audit log admin actions
- Validate update permissions
