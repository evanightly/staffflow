# project-name-tba

## Description

This is laravel 12 project using inertiajs with reactjs as its frontend framework, shadcn and magicui as its component libraries, the main business project is:

1. RBAC, Role: Super Admin and Team using Spatie Permission (Already Installed)
2. (Super Admin) Manage User Roles
3. (Super Admin) Import User data:
    1. Upload CSV/Excel file of user list
    2. Store the user data in the database
    3. View list of user as a datatable
4. (Super Admin) Export Selected User list
    1. Add a page that show check-able datatable of users
    2. The page should have a button to export the selected users (Excel, PDF), the selection should be which column and users the superadmin want to export
    3. Implement the export functionality in the backend
5. (Super Admin) Import data template
6. (Team) Only login (for now)
7. (Super Admin, Team) Dashboard, show user analytics

## Rules

1. All code must be clean, you can use laravel Form Request, Resource Collection
2. All typescript model interfaces should be defined in index.d.ts file to ensure type safety and consistency across the application.
3. UI/UX should be consistent and follow the design system guidelines.
