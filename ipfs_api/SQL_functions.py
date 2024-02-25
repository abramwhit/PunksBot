import sqlite3


def write_to_mpunks_table(db_name: str, table_name: str, mpunk: int, image: str):
    connection = sqlite3.connect(r'data/' + f'{db_name}.db')
    cursor = connection.cursor()
    command1 = f'CREATE TABLE IF NOT EXISTS {table_name}(mpunk NUMBER, image TEXT)'
    cursor.execute(command1)
    cursor.execute(f"INSERT INTO {table_name} VALUES (?,?)",
                   (mpunk, image))
    connection.commit()
    connection.close()


def query_mpunks_table(db_name: str, table_name: str, mpunk: int):
    connection = sqlite3.connect(r'data/' + f'{db_name}.db')
    cursor = connection.cursor()
    sqlite_select_query = f"""SELECT * from {table_name} WHERE mpunk = ?"""
    cursor.execute(sqlite_select_query, (mpunk,))
    results = cursor.fetchone()
    connection.close()
    return results
