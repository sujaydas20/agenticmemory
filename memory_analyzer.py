from context_analysis import ContextAnalyzer
from importance_analysis import ImportanceAnalyzer
from persistence_analysis import PersistenceAnalyzer


class MemoryAnalyzer:

    def __init__(self):

        print("Loading Memory Analyzer...")

        self.context_analyzer = ContextAnalyzer()
        self.importance_analyzer = ImportanceAnalyzer()
        self.persistence_analyzer = PersistenceAnalyzer()

        print("Memory Analyzer Ready!")


    def analyze(self, user_input, conversation_history):

        # ---------------------------------
        # 1. CONTEXT ANALYSIS
        # ---------------------------------

        context_result = self.context_analyzer.analyze(
            user_input,
            conversation_history
        )


        # ---------------------------------
        # 2. IMPORTANCE ANALYSIS
        # ---------------------------------

        importance_result = self.importance_analyzer.analyze(
            user_input
        )


        # ---------------------------------
        # 3. PERSISTENCE ANALYSIS
        # ---------------------------------

        persistence_result = self.persistence_analyzer.analyze(
            user_input
        )


        # ---------------------------------
        # Combine all results
        # ---------------------------------

        result = {

            "user_input": user_input,

            "context": context_result,

            "importance": importance_result,

            "persistence": persistence_result
        }

        return result


# =========================================
# MAIN PROGRAM
# =========================================

print("======================================")
print("       HYBRID MEMORY ANALYZER")
print("======================================")


# Create Memory Analyzer
analyzer = MemoryAnalyzer()


# Store current conversation
conversation_history = []


while True:

    user_input = input(
        "\nEnter your message (type 'exit' to stop): "
    )


    if user_input.lower() == "exit":

        print("\nProgram stopped.")
        break


    # Run all three analyses
    result = analyzer.analyze(
        user_input,
        conversation_history
    )


    # Add user message to conversation
    conversation_history.append(
        user_input
    )


    # =================================
    # DISPLAY RESULTS
    # =================================

    print("\n======================================")
    print("             ANALYSIS")
    print("======================================")


    print("\nUser Input:")
    print(user_input)


    # Context
    context_score = result["context"]["context_score"]

    print("\n--- Context Analysis ---")
    print(
        "Context Score:",
        round(context_score, 3)
    )


    if result["context"]["relevant_context"]:

        print("Relevant Previous Context:")

        for item in result["context"]["relevant_context"]:

            print(
                round(item["score"], 3),
                "->",
                item["message"]
            )

    else:

        print("No previous context available.")


    # Importance
    print("\n--- Importance Analysis ---")

    print(
        "Importance Score:",
        round(
            result["importance"]["importance_score"],
            3
        )
    )

    print(
        "Importance Level:",
        result["importance"]["importance_level"]
    )


    # Persistence
    print("\n--- Persistence Analysis ---")

    print(
        "Persistence Score:",
        round(
            result["persistence"]["persistence_score"],
            3
        )
    )

    print(
        "Persistence Level:",
        result["persistence"]["persistence_level"]
    )


    print("\n======================================")