---
mode: agent
---

In the data menu / data page, theres a feature for importing and exporting data, the process will be:

## A. Super Admin import excel file:

    1. there will be example template for dummy data
    2. user upload the file
    3. system will validate the file, if valid, it will be processed, if not valid, it will show error message
    4. if valid, system will scan and extract the data from the file
    5. the system will parse those data as a selectable datatable

    Crucial Note: the uploaded excel file is not meant to be stored in database, it only hold data as a temporary storage

## B. Super Admin export data:

    1. user select the row, and the column to export, the example is almost the same as resources/js/pages/user/export.tsx
    2. the system will add a feature to filter out duplicated row data using checkbox
    3. user choose the export format (e.g. excel, csv, pdf)
    4. after choosing, the system will immediately process those requested row and columns and generate the file for download

## C. Import export file storing (C means crucial 😂)

    All imported and exported files will be stored in the storage, plus the filepath is stored in the database
    1. the file should stored in:
        -   import: storage/data/import
        -   export: storage/data/export
    2. the filepath will be stored in a separate table called import_export_files with columns: id, filename, filepath, filetype (enum: export, import), user_id (user who export import file), created_at, updated_at

## D. Dashboard views

    1. SuperAdmin:
        shows uploaded(imported) files, its filename, the user who uploaded it, and the timestamp, and the action to redownload its file
    2. Team:
        shows exported files, its filename, the user who exported it, and the timestamp, and the action to redownload its file
