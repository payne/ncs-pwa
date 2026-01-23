# NCS PWA User Manual

## Overview

NCS PWA (Net Control Station Progressive Web Application) is a web-based tool for managing NET assignments, personnel, locations, and duties. The application works offline and can be installed on your device for quick access.

## Getting Started

### Logging In

1. Navigate to the application URL
2. Click "Sign in with Google" to authenticate
3. Use your Google account credentials to log in

### First-Time Users

When you first log in, your user account is created automatically. However, **new users are not assigned to any groups by default**. You must be added to a group by an administrator before you can access most features.

If you see a message stating "No Group Membership," contact an administrator to be added to a group.

---

## User Roles and Permissions

The application uses a group-based permission system. Your access to features depends on which groups you belong to.

### Group Membership

- Users can belong to one or more groups
- Groups are managed by administrators in the Settings page
- Your group membership determines what NETs you can access and edit

### Special Group: DCARES

The **DCARES** group has administrative privileges. Members of this group can:

- Access the Settings page
- Manage groups (create, edit, delete)
- Add/remove users from groups
- Add, edit, and delete people in the People directory
- Access all NETs regardless of which group created them

### Special User

The user `matt.n3pay@gmail.com` is automatically treated as a member of the DCARES group, regardless of explicit group assignments.

---

## Permission Summary by Feature

| Feature | Requirement |
|---------|-------------|
| Login | Google account |
| Profile | Must be logged in |
| Select NET | Must be in at least one group |
| View NETs in list | Must be in the same group as NET creator (or DCARES) |
| Create NET | Must be in at least one group |
| View NET Assignments (read-only) | Any logged-in user can view NETs they can access |
| Edit NET Assignments (add/edit/delete) | Must be in the same group as NET creator (or DCARES) |
| View People | Must be in at least one group |
| Add/Edit/Delete People | Must be in DCARES group |
| View Locations | Must be logged in |
| View Duties | Must be logged in |
| Access Settings | Must be in DCARES group |
| View About | Must be logged in |

---

## Features

### Select NET

**Location:** Menu > Select NET

**Purpose:** Choose which NET to work with or create a new NET.

**How to use:**
1. Select an existing NET from the dropdown
2. Or click "Create New NET" to start a new one

**Permissions:**
- You must be in at least one group to access this page
- You can only see NETs created by members of your group(s)
- DCARES members can see all NETs
- Legacy NETs (created before the permission system) are visible to all group members

**Creating a New NET:**
- If you belong to multiple groups, select which group the NET will belong to
- If you belong to one group, the NET is automatically assigned to that group
- The NET will only be accessible to members of the selected group (and DCARES)

---

### NET Assignments

**Location:** Menu > NET Assignments

**Purpose:** Manage operator assignments for the current NET.

**How to use:**
1. First select a NET from the Select NET page
2. Add entries for operators checking into the NET
3. Record time in/out, duties, mileage, and other information

**Permissions:**
- **View (read-only):** Any user who can access the NET can view its assignments
- **Edit (add/edit/delete):** Must be in the same group as the NET creator (or DCARES)
- If you don't have edit permission, the page displays "(Read Only)" in the header
- The add row and action buttons are hidden in read-only mode

---

### View 2

**Location:** Menu > View 2

**Purpose:** Alternative view for NET data with additional fields.

**Permissions:**
- Same as NET Assignments:
  - **View (read-only):** Any user who can access the NET
  - **Edit (add/edit/delete):** Must be in the same group as the NET creator (or DCARES)
- Read-only mode displays "(Read Only)" in the header

---

### People

**Location:** Menu > People

**Purpose:** Manage the directory of operators/personnel.

**How to use:**
- View the list of all people in the system
- Use the filter box to search by callsign, name, or clubs
- Click on a field to edit (if you have permission)

**Permissions:**
- **View:** Must be in at least one group
- **Add/Edit/Delete:** Must be in DCARES group

For non-DCARES users, the People page is read-only.

---

### Locations

**Location:** Menu > Locations

**Purpose:** Manage location information.

**Permissions:**
- Must be logged in

---

### Duties

**Location:** Menu > Duties

**Purpose:** Manage duty types and assignments.

**Permissions:**
- Must be logged in

---

### Profile

**Location:** Click your name/avatar in the upper right corner > Profile

**Purpose:** View and edit your personal profile information and see your group memberships.

**How to use:**

1. **View Profile:**
   - Click on your name or avatar in the top-right corner
   - Select "Profile" from the dropdown menu

2. **Edit Your Information:**
   - **Display Name:** Enter a custom name to use instead of your Google account name
   - **Callsign:** Enter your amateur radio callsign (will be stored in uppercase)
   - Click "Save Profile" to save your changes

3. **View Group Membership:**
   - Your current group memberships are displayed as chips
   - If you're not in any groups, you'll see a message indicating this

**Permissions:**
- Must be logged in
- All users can view and edit their own profile

---

### Settings (Admin Only)

**Location:** Menu > Settings

**Purpose:** Manage groups and group membership.

**Permissions:**
- **Only DCARES members can access this page**
- The Settings menu item is hidden for non-DCARES users

#### Managing Groups

1. **Create a Group:**
   - Enter a name and description in the first row
   - Click the "+" button to add
   - Group names must be unique

2. **Edit a Group:**
   - Click on the name or description field
   - Make your changes
   - Changes save automatically when you click away

3. **Delete a Group:**
   - Click the three-dot menu on the group row
   - Select "Delete"
   - This also removes all members from the group

#### Managing Group Members

1. **Select a Group:**
   - Click the group icon on any group row
   - The right panel will show members of that group

2. **Add a Member:**
   - Type an email address in the input field
   - Known users will appear in autocomplete suggestions
   - Click "Add" or press Enter

3. **Remove a Member:**
   - Click the remove icon next to the member's email

#### Data Backup

DCARES administrators can download a complete backup of all application data.

1. **Choose Format:**
   - **JSON:** Best for data restoration or programmatic use. Preserves all data types and nested structures.
   - **CSV:** Best for viewing in spreadsheet applications (Excel, Google Sheets). Each data collection is saved as a separate file.

2. **Download Backup:**
   - Select your preferred format from the dropdown
   - Click "Download Backup"
   - A ZIP file will be downloaded containing all data files

**Backup includes:**
- NETs (including all entries for each NET)
- People directory
- Groups
- Group memberships
- Users
- Duties
- Locations

#### Data Reset

DCARES administrators can reset all application data to its initial state.

1. **Click "Reset All Data"** button in the danger zone section
2. **Review the warning** - this action cannot be undone
3. **Confirm the reset** by clicking "Yes, Delete Everything"

**After reset, the database will contain:**
- **Users:** Only matt.n3pay@gmail.com
- **Groups:** Only DCARES
- **Group Members:** matt.n3pay@gmail.com in DCARES
- **People:** Restored from members.json file
- **NETs, Duties, Locations:** Empty

**Important:** Always download a backup before resetting data.

---

### About

**Location:** Menu > About

**Purpose:** View application information, version, and license details.

**Permissions:**
- Must be logged in

---

## Understanding Access Denied Messages

### "No Group Membership"

You see this when you're not a member of any group. Contact an administrator to be added to a group.

### "You don't have access to the previously selected NET"

This appears when:
- You were removed from a group that owned the NET
- The NET belongs to a group you're not a member of

Select a different NET that belongs to your group.

---

## Offline Support

As a Progressive Web Application, NCS PWA can work offline:

1. The app caches resources for offline use
2. You can install it on your device (look for "Add to Home Screen" or install prompt)
3. Data changes made offline will sync when you reconnect

---

## Troubleshooting

### Can't see the Settings menu

You're not a member of the DCARES group. Contact an administrator.

### Can't create a NET

You must be a member of at least one group. Contact an administrator to be added to a group.

### Can't edit people

Only DCARES members can add, edit, or delete people. Other users have read-only access.

### Can't access a NET I could access before

Your group membership may have changed, or the NET may have been reassigned to a different group. Contact an administrator.

---

## Contact

For issues or feature requests, visit: https://github.com/payne/ncs-pwa

---

## License

This application is licensed under the Apache 2.0 License.
