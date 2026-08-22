from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class ImportanceAnalyzer:

    def __init__(self):

        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        # Examples of important information
        self.important_examples = [
            "I am preparing for GATE.",
            "I prefer simple explanations.",
            "I am working on an AI project.",
            "I am studying Artificial Intelligence.",
            "My goal is to become a data scientist.",
            "I prefer Python programming."
        ]

        self.example_vectors = self.model.encode(
            self.important_examples
        )

    def analyze(self, message):

        # Convert user input into embedding
        message_vector = self.model.encode(
            [message]
        )

        # Calculate semantic similarity
        similarities = cosine_similarity(
            message_vector,
            self.example_vectors
        )[0]

        semantic_score = max(similarities)

        # Important words/signals
        importance_words = [
            "prefer",
            "goal",
            "important",
            "remember",
            "future",
            "working on",
            "studying",
            "learning",
            "preparing"
        ]

        message_lower = message.lower()

        word_score = 0

        for word in importance_words:

            if word in message_lower:
                word_score += 0.10

        word_score = min(word_score, 0.30)

        # Final score
        importance_score = (
            0.7 * semantic_score
            + 0.3 * word_score
        )

        importance_score = min(
            importance_score,
            1.0
        )

        # Decide importance level
        if importance_score >= 0.70:
            level = "HIGH"

        elif importance_score >= 0.40:
            level = "MEDIUM"

        else:
            level = "LOW"

        return importance_score, level


# --------------------------------
# MAIN PROGRAM
# --------------------------------

analyzer = ImportanceAnalyzer()

print("================================")
print("     IMPORTANCE ANALYZER")
print("================================")

while True:

    user_input = input(
        "\nEnter your message (type 'exit' to stop): "
    )

    if user_input.lower() == "exit":
        print("Program stopped.")
        break

    score, level = analyzer.analyze(
        user_input
    )

    print("\nResult")
    print("-----------------------------")
    print("User Input :", user_input)
    print("Importance :", level)
    print("Score      :", round(score, 3))