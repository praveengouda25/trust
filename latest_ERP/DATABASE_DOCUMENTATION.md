# Database Schema and Storage Documentation

## Database Provider

- **Provider**: Supabase (PostgreSQL)
- **Project ID**: `giwfrsutprqhrpflbeob`
- **URL**: `https://giwfrsutprqhrpflbeob.supabase.co`
- **Publishable Key**: `sb_publishable_9aVf14GsGKFDlnxSjE2_nQ_iJqImPWn`

## Storage Configuration

### Storage Buckets

#### student-photos

- **Purpose**: Store student profile photos
- **Public**: false (private bucket with signed URLs)
- **File Size Limit**: 5MB (5,242,880 bytes)
- **Allowed MIME Types**:
  - image/jpeg
  - image/png
  - image/gif
  - image/webp
- **RLS Policies**:
  - INSERT: authenticated staff roles only
  - SELECT: Authenticated users
  - UPDATE: authenticated staff roles only
  - DELETE: authenticated staff roles only

### Current official Free-plan limits

The repository identifies the provider/project, but cannot reveal the organization’s
current billing plan. Verify that in Supabase Dashboard → Organization → Billing.
The following are the current published Free-plan quotas:

- **Postgres database size**: 500 MB per project; read-only mode can be triggered above this quota.
- **Provisioned disk**: 1 GB on Free; distinct from the 500 MB database-size quota.
- **File/object storage**: 1 GB.
- **Bandwidth/egress**: 5 GB uncached plus 5 GB cached.
- **API requests**: unlimited on Free; separate service quotas still apply.
- **Auth**: 50,000 monthly active users.
- **Edge Functions**: 500,000 invocations; **Realtime**: 2 million messages and 200 peak connections.
- **Maximum file size**: 50 MB globally on Free; this application limits student photos to 5 MB.
- **Inactivity**: low-activity Free projects may be paused after roughly 7 days; restoration is available for up to one year.
- **Free tier duration**: no scheduled expiration is stated; verify current terms in the billing dashboard.
- **Backups**: downloadable database backups are not available on Free; export Postgres and Storage objects independently.

Sources: [Supabase pricing](https://supabase.com/pricing), [billing quotas](https://supabase.com/docs/guides/platform/billing-on-supabase), [database size](https://supabase.com/docs/guides/platform/database-size), [bandwidth](https://supabase.com/docs/guides/storage/serving/bandwidth), [file limits](https://supabase.com/docs/guides/storage/uploads/file-limits), and [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

## Key Database Tables

### Core Tables

- `profiles` - User profiles with roles
- `trusts` - Trust/organization management
- `branches` - Branch/location management
- `students` - Student records
- `staff` - Staff records
- `hostels` - Hostel/building management
- `rooms` - Room management
- `beds` - Bed allocation
- `bed_allocations` - Student bed assignments

### Operational Tables

- `attendance` - Student attendance
- `leave_requests` - Student leave applications
- `visitors` - Visitor management
- `student_gate_passes` - Gate pass tracking
- `complaints` - Student complaints
- `maintenance` - Maintenance requests
- `medical_records` - Medical history
- `medicines` - Medicine inventory
- `mess_menus` - Daily menu planning
- `food_stock` - Kitchen inventory
- `vendors` - Vendor management
- `meal_attendance` - Meal tracking
- `assets` - Asset management
- `donations` - Donation records
- `expenses` - Expense tracking
- `notifications` - System notifications
- `security_logs` - Security incident logs

### Configuration Tables

- `user_roles` - Role assignments
- `role_permissions` - Permission matrix
- `ai_settings` - AI feature configuration
- `branding` - Brand customization

## Role System

### App Role Enum

- `super_admin` - Full system access
- `trust_admin` - Trust-level administration
- `branch_admin` - Branch-level administration
- `warden` - Hostel management
- `teacher` - Academic staff
- `accountant` - Financial management
- `security_guard` - Security operations
- `inventory_manager` - Inventory management
- `kitchen_staff` - Kitchen operations
- `student` - Student portal access
- `parent` - Parent portal access
- `donor` - Donor portal access

### Permission Modules

- dashboard, students, hostels, allocations, users, branches, branding, audit
- attendance, leave, complaints, maintenance, inventory, issues
- visitors, security, gatepass, medical
- mess, assets
- finance, donations, expenses
- reports, notifications

### Permission Actions

- view, create, edit, delete, manage

## Migration Files

### Role and Permission Migrations

- `20260831000000_add_security_guard_and_kitchen_staff_roles.sql`
  - Adds security_guard, kitchen_staff, inventory_manager to app_role enum
  - Updates is_staff function
  - Inserts default permissions for new roles

### Storage Migrations

- `20260831000001_create_student_photos_storage.sql`
  - Creates student-photos bucket
  - Configures file size limits and MIME types
  - Sets up RLS policies

### AI Configuration

- `20260801000002_ai_settings_table.sql`
  - Creates ai_settings table
  - Configures AI provider and API key storage
  - Sets up RLS policies for admin-only access

## Important Notes

1. **Database Connection**: The migration for adding security_guard and kitchen_staff roles exists in the migrations folder but requires database connection to apply. The connection was timing out during this session.

2. **AI Configuration**: `ai_settings.ai_enabled` is a feature flag. Provider credentials must be server-only environment variables such as `OPENAI_API_KEY`. No API key is accepted from or returned to the browser.

3. **Photo Upload**: Student photos are stored in Supabase Storage with signed URLs. The PhotoField component handles upload, validation, and preview.

4. **Role-Based Access**: All frontend routes have `beforeLoad` permission checks. The database RLS policies enforce backend security.

5. **Storage Limits**: Monitor storage usage to stay within the 1GB free tier limit. Student photos are limited to 5MB each to prevent abuse.
