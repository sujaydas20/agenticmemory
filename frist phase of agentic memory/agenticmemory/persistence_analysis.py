from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class PersistenceAnalyzer:

    def __init__(self):

        # Load embedding model
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )

        # Information that is usually long-term
        self.long_term_examples = [
            "I prefer simple explanations.",
            "I am preparing for GATE.",
            "I am studying Artificial Intelligence.",
            "I am learning Python.",
            "My goal is to become a data scientist.",
            "I am working on an AI project.",
            "I usually prefer Python.",
            "I want to learn machine learning."
        ]

        # Information that is usually short-term
        self.short_term_examples = [
            "I am solving this question right now.",
            "I am working on this problem.",
            "I need help with this question.",
            "I am doing this task today.",
            "Give me an example.",
            "Explain this question.",
            "What is the answer to this problem?",
            "Help me solve this question."
        ]

        # Convert examples into embeddings
        self.long_vectors = self.model.encode(
            self.long_term_examples
        )

        self.short_vectors = self.model.encode(
            self.short_term_examples
        )

    def analyze(self, message):

        # Convert user input into embedding
        message_vector = self.model.encode(
            [message]
        )

        # Compare with long-term examples
        long_scores = cosine_similarity(
            message_vector,
            self.long_vectors
        )[0]

        # Compare with short-term examples
        short_scores = cosine_similarity(
            message_vector,
            self.short_vectors
        )[0]

        # Get highest similarity
        long_score = max(long_scores)
        short_score = max(short_scores)

        # Calculate persistence score
        persistence_score = (
            long_score /
            (long_score + short_score)
        )

        # Classify persistence
        if persistence_score >= 0.65:

            level = "HIGH"

        elif persistence_score >= 0.40:

            level = "MEDIUM"

        else:

            level = "LOW"

        return persistence_score, level


# ==================================================
# MAIN PROGRAM
# ==================================================

print("======================================")
print("       PERSISTENCE ANALYZER")
print("======================================")

# Create analyzer
analyzer = PersistenceAnalyzer()


# Take input from user
while True:

    user_input = input(
        "\nEnter your message (type 'exit' to stop): "
    )

    # Stop program
    if user_input.lower() == "exit":

        print("\nProgram stopped.")
        break

    # Analyze user input
    score, level = analyzer.analyze(
        user_input
    )

    # Display result
    print("\n--------------------------------------")
    print("User Input :", user_input)
    print("Persistence:", level)
    print("Score      :", round(score, 3))
    print("--------------------------------------")