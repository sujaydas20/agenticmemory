from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


class ContextAnalyzer:

    def __init__(self):
        # Model converts text into semantic vectors
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    def analyze(self, current_message, conversation_history):

        # No previous conversation
        if not conversation_history:
            return {
                "context_available": False,
                "context_score": 0.0,
                "relevant_context": []
            }

        # Convert current message into embedding
        current_vector = self.model.encode([current_message])

        # Convert previous messages into embeddings
        history_vectors = self.model.encode(conversation_history)

        # Compare current message with previous messages
        scores = cosine_similarity(
            current_vector,
            history_vectors
        )[0]

        # Combine messages and scores
        results = []

        for message, score in zip(conversation_history, scores):
            results.append({
                "message": message,
                "score": float(score)
            })

        # Highest similarity first
        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        # Take top 3 relevant messages
        relevant_context = results[:3]

        # Highest context score
        context_score = relevant_context[0]["score"]

        return {
            "context_available": True,
            "context_score": context_score,
            "relevant_context": relevant_context
        }


# ---------------------------------------
# USER INPUT
# ---------------------------------------

analyzer = ContextAnalyzer()

conversation = []

print("======================================")
print("      AGENTIC CONTEXT ANALYZER")
print("======================================")
print("Type 'exit' to stop.\n")


while True:

    # Take message from user
    message = input("You: ")

    # Stop program
    if message.lower() == "exit":
        print("Program stopped.")
        break

    # Analyze context
    result = analyzer.analyze(
        message,
        conversation
    )

    # First message
    if not result["context_available"]:

        print("\nContext: No previous context")
        print("Context Score: 0.0")

    else:

        print("\nContext Score:",
              round(result["context_score"], 3))

        print("\nRelevant Context:")

        for item in result["relevant_context"]:

            print(
                round(item["score"], 3),
                "->",
                item["message"]
            )

    # Store current message
    conversation.append(message)

    print("\n--------------------------------------\n")