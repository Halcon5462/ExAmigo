from django.db import connection

RENAME_TABLES = {
    "taskBank_task": "task_bank_task",
    "taskBank_topic": "task_bank_topic",
    "taskBank_variant": "task_bank_variant",
    "taskBank_taskset": "task_bank_taskset",
    "taskBank_tasksetitem": "task_bank_tasksetitem",
    "taskBank_taskcorrectanswer": "task_bank_taskcorrectanswer",
    "taskBank_examsession": "task_bank_examsession",
    "helpAi_taskhint": "help_ai_taskhint",
}

with connection.cursor() as cursor:
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table';"
    )

    existing_tables = [
        row[0]
        for row in cursor.fetchall()
    ]

    print("\n=== EXISTING TABLES ===")

    for table_name in existing_tables:
        print(table_name)

    print("\n=== RENAME PROCESS ===")

    for old_name, new_name in RENAME_TABLES.items():

        if old_name not in existing_tables:
            print(f"[SKIP] {old_name} not found")
            continue

        if new_name in existing_tables:
            print(f"[SKIP] {new_name} already exists")
            continue

        sql = (
            f"ALTER TABLE {old_name} "
            f"RENAME TO {new_name};"
        )

        cursor.execute(sql)

        print(f"[OK] {old_name} -> {new_name}")

    print("\nDONE")
