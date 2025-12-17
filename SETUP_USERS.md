# User Setup Instructions

This portal requires pre-provisioned user accounts. Follow these steps to create the initial users.

## Step 1: Create Auth Users in Supabase Dashboard

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add user** and create these two users:

### PRS Admin User
- **Email**: `admin@prsindustrial.com`
- **Password**: Choose a secure password
- **Auto Confirm User**: Yes (check this box)

### Nordstrom WCOC Customer User
- **Email**: `wcoc@nordstrom.com`
- **Password**: Choose a secure password
- **Auto Confirm User**: Yes (check this box)

## Step 2: Get User IDs

After creating the users, note down their User IDs (UUID format) from the Users table.

## Step 3: Create User Profiles

Go to **SQL Editor** in your Supabase Dashboard and run this SQL script:

```sql
-- Replace the UUID values below with the actual user IDs from Step 2

-- Insert PRS Admin profile
INSERT INTO user_profiles (id, email, full_name, role, organization)
VALUES (
  'REPLACE_WITH_ADMIN_USER_ID',
  'admin@prsindustrial.com',
  'PRS Staff Admin',
  'admin',
  'PRS Industrial Inc.'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization;

-- Insert WCOC Customer profile
INSERT INTO user_profiles (id, email, full_name, role, organization)
VALUES (
  'REPLACE_WITH_WCOC_USER_ID',
  'wcoc@nordstrom.com',
  'Nordstrom WCOC',
  'customer',
  'Nordstrom WCOC'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  organization = EXCLUDED.organization;
```

## Step 4: Verify Setup

1. Log in to the portal with one of the created user accounts
2. Verify that:
   - **Admin user** can edit all fields, add assets, upload files
   - **Customer user** can view data and approve/decline repair requests only

## User Roles & Permissions

### Admin Role (PRS Staff)
- View all PM data and schedules
- Edit compliance percentages
- Edit next service due dates
- Change service frequency
- Update annual schedule status
- Add new assets
- Create work orders
- Upload attachments
- Full system access

### Customer Role (e.g., Nordstrom WCOC)
- View all PM data and schedules (read-only)
- View assets and their history
- View work orders and attachments
- Approve or decline pending repair requests
- Cannot edit any PM data or schedules
- Cannot add assets or upload files

## Security Notes

- Public sign-up is completely disabled
- Only admin-created accounts can access the portal
- All users must be created manually through the Supabase Dashboard
- Contact PRS Industrial IT if additional users need to be created
