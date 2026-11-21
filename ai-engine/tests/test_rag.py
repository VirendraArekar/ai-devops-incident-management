from app.rag.vector_store import knowledge_store

def test_rag_semantic_search():
    query = "HikariPool connection timeout and database exhaustion"
    results = knowledge_store.search(query, service_name="payment-service", limit=2)

    assert len(results) > 0
    top = results[0]
    assert "Payment" in top.document_title or "Hikari" in top.content
    assert top.similarity_score > 0.2
