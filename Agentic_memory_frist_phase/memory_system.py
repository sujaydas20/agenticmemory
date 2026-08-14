import sqlite3
import re
from datetime import datetime


class MemorySystem:

    def __init__(self, database_name="memory.db"):

        self.connection = sqlite3.connect(database_name)

        self.create_table()


    # ==========================================
    # CREATE DATABASE TABLE
    # ==========================================

    def create_table(self):

        cursor = self.connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS memories (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                memory_key TEXT UNIQUE,

                memory_value TEXT,

                created_at TEXT,

                updated_at TEXT

            )
        """)

        self.connection.commit()


    # ==========================================
    # SAVE / UPDATE MEMORY
    # ==========================================

    def save_memory(self, key, value):

        cursor = self.connection.cursor()

        current_time = datetime.now().isoformat()

        cursor.execute("""
            INSERT INTO memories
            (memory_key, memory_value, created_at, updated_at)

            VALUES (?, ?, ?, ?)

            ON CONFLICT(memory_key)
            DO UPDATE SET

                memory_value = excluded.memory_value,

                updated_at = excluded.updated_at
        """, (
            key,
            value,
            current_time,
            current_time
        ))

        self.connection.commit()


    # ==========================================
    # GET MEMORY
    # ==========================================

    def get_memory(self, key):

        cursor = self.connection.cursor()

        cursor.execute("""
            SELECT memory_value
            FROM memories
            WHERE memory_key = ?
        """, (key,))

        result = cursor.fetchone()

        if result:

            return result[0]

        return None


    # ==========================================
    # GET ALL MEMORIES
    # ==========================================

    def get_all_memories(self):

        cursor = self.connection.cursor()

        cursor.execute("""
            SELECT memory_key, memory_value
            FROM memories
        """)

        return cursor.fetchall()


    # ==========================================
    # UNDERSTAND USER INPUT
    # ==========================================

    def process_input(self, user_input):

        text = user_input.strip()


        # --------------------------------------
        # MY NAME IS ...
        # --------------------------------------

        name_match = re.search(
            r"\bmy name is\s+(.+)",
            text,
            re.IGNORECASE
        )

        if name_match:

            name = name_match.group(1).strip()

            self.save_memory(
                "name",
                name
            )

            return (
                f"Got it. I will remember that "
                f"your name is {name}."
            )


        # --------------------------------------
        # WHAT IS MY NAME?
        # --------------------------------------

        if re.search(
            r"\b(what is|what's|tell me)\s+my\s+name\b",
            text,
            re.IGNORECASE
        ):

            name = self.get_memory("name")

            if name:

                return f"Your name is {name}."

            else:

                return "I don't know your name yet."


        # --------------------------------------
        # SHOW ALL MEMORY
        # --------------------------------------

        if text.lower() in [
            "show my memory",
            "show memories",
            "what do you remember"
        ]:

            memories = self.get_all_memories()

            if not memories:

                return "I don't have any memories yet."

            output = "I remember:\n"

            for key, value in memories:

                output += f"- {key}: {value}\n"

            return output


        # --------------------------------------
        # DEFAULT
        # --------------------------------------

        return (
            "I understood your message, "
            "but I don't know if it should be "
            "stored as a memory yet."
        )


    # ==========================================
    # CLOSE DATABASE
    # ==========================================

    def close(self):

        self.connection.close()


# ==============================================
# MAIN PROGRAM
# ==============================================

print("========================================")
print("       AGENTIC MEMORY SYSTEM")
print("========================================")


memory = MemorySystem()


while True:

    user_input = input(
        "\nYou: "
    )


    # Exit
    if user_input.lower() in [
        "exit",
        "quit"
    ]:

        print("Memory system closed.")

        memory.close()

        break


    # Process input
    response = memory.process_input(
        user_input
    )


    print(
        "Agent:",
        response
    )