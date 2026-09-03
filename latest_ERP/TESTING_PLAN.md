# End-to-End Testing Plan

## Testing Scope
This document outlines the comprehensive end-to-end testing plan for the Hostel ERP application after the bug fixes and enhancements.

## Pre-Testing Requirements
1. **Database Migration**: Apply `20260831000000_add_security_guard_and_kitchen_staff_roles.sql` migration
2. **AI Configuration**: Set `OPENAI_API_KEY` in the server environment or configure via AI Settings page
3. **Dev Server**: Run `npm run dev` to start the application
4. **Test Users**: Ensure test accounts exist for each role

## Test Cases

### 1. Authentication & Login
- [ ] Login page loads successfully
- [ ] Background video plays automatically
- [ ] Video loops and is muted
- [ ] Sign in with valid credentials works
- [ ] Invalid credentials show error message
- [ ] Sign up flow works
- [ ] Password reset flow works
- [ ] Session persists after page refresh

### 2. Role-Based Access Control

#### Super Admin
- [ ] Can access all modules
- [ ] Can assign roles to users
- [ ] Can configure AI settings
- [ ] Can view audit logs

#### Security Guard
- [ ] Can access Security dashboard
- [ ] Can access Visitors module
- [ ] Can access Gate Pass module
- [ ] CANNOT access Students module (restricted)
- [ ] Can create/edit visitors
- [ ] Can approve/reject gate passes
- [ ] Can mark student exit/return

#### Kitchen Staff
- [ ] Can access Kitchen & Mess module
- [ ] Can view other modules (read-only)
- [ ] Can create/edit menus
- [ ] Can manage food stock
- [ ] Can record meal attendance
- [ ] Can view vendors

### 3. Student Management
- [ ] Student list loads correctly
- [ ] Search by name/admission number works
- [ ] Create new student works
- [ ] Edit existing student works
- [ ] **Photo upload works** (5MB limit, image validation)
- [ ] Photo preview displays correctly
- [ ] Photo replacement works
- [ ] Delete student works (with confirmation)
- [ ] Export to PDF works

### 4. Gate Pass Management
- [ ] Gate pass list loads with tabs
- [ ] Dashboard statistics display correctly
- [ ] Create new gate pass works
- [ ] Approval workflow works (pending → approved → out → returned)
- [ ] QR code generation works
- [ ] Search and filter work
- [ ] Late return detection works
- [ ] Status badges display correctly

### 5. Security Dashboard
- [ ] Dashboard loads without null values
- [ ] Today's visitors count displays
- [ ] Students outside count displays
- [ ] Pending approvals count displays
- [ ] Recent visitors list loads
- [ ] Active gate passes list loads
- [ ] Security alerts display
- [ ] Data updates in real-time

### 6. Kitchen & Mess Module
- [ ] Menu planning works
- [ ] Daily menu displays for each meal
- [ ] Food stock management works
- [ ] Low stock alerts display
- [ ] Vendor management works
- [ ] Meal attendance tracking works
- [ ] Statistics display correctly (menus planned, stock items, low stock, vendors)

### 7. Visitors Management
- [ ] Visitor list loads
- [ ] Check-in works
- [ ] Check-out works
- [ ] Search works
- [ ] Status tracking works

### 8. AI Assistance
- [ ] AI assistant page loads
- [ ] Configuration via AI Settings works (super admin)
- [ ] AI responses work when configured
- [ ] Error message displays when not configured

### 9. Navigation
- [ ] Navigation menu displays based on role
- [ ] Security guard sees only relevant modules
- [ ] Kitchen staff sees only relevant modules
- [ ] All other roles see appropriate modules
- [ ] Mobile navigation works

### 10. Data Integrity
- [ ] Branch isolation works (users see only their branch data)
- [ ] Soft delete works (deleted records don't appear)
- [ ] Concurrent edits handle correctly
- [ ] Form validation works (required fields, formats)

### 11. Performance
- [ ] Page load times acceptable (< 3s)
- [ ] Data fetching is efficient
- [ ] Large lists paginate or limit correctly
- [ ] Image loading doesn't block UI

### 12. Error Handling
- [ ] Network errors display user-friendly messages
- [ ] Permission denied errors show appropriate message
- [ ] Validation errors are clear
- [ ] Server errors are logged and reported

## Known Limitations
1. **Database Migration**: Cannot be tested until migration is applied (connection timeout issue)
2. **AI Feature**: Requires actual API key to test end-to-end
3. **Photo Upload**: Requires Supabase storage connection

## Test Environment
- **Browser**: Chrome, Firefox, Safari, Edge
- **Screen Sizes**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Roles**: Test each role with appropriate permissions

## Sign-Off Criteria
- All critical test cases pass
- No console errors in production build
- All roles can access their permitted modules
- Security guard and kitchen staff roles work correctly after migration
- Photo upload works reliably
- Security dashboard shows real data
