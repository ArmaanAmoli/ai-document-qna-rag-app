"""
RAGAS Evaluation Pipeline for AI Document Q&A RAG App

This module provides evaluation capabilities using RAGAS metrics:
- Faithfulness: Whether the answer is grounded in the retrieved context
- Answer Relevance: Whether the answer addresses the user's question
- Context Precision: Whether the retrieved chunks are relevant
- Context Recall: Whether all relevant chunks were retrieved
"""

import os
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from langchain_openai import ChatOpenAI, OpenAIEmbeddings


@dataclass
class EvaluationResult:
    """Container for evaluation results"""
    faithfulness: float
    answer_relevancy: float
    context_precision: float
    context_recall: float
    timestamp: str
    num_samples: int


def get_llm_and_embeddings():
    """Initialize LLM and embeddings for RAGAS evaluation"""
    llm = ChatOpenAI(
        model="gpt-4o-mini",  # Cheaper model for evaluation
        temperature=0,
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-small",
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    return LangchainLLMWrapper(llm), LangchainEmbeddingsWrapper(embeddings)


def prepare_evaluation_dataset(
    questions: List[str],
    answers: List[str],
    contexts: List[List[str]],
    ground_truths: List[str],
) -> Dataset:
    """Prepare dataset in RAGAS format"""
    data = {
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths,
    }
    return Dataset.from_dict(data)


def run_evaluation(
    questions: List[str],
    answers: List[str],
    contexts: List[List[str]],
    ground_truths: List[str],
) -> EvaluationResult:
    """Run RAGAS evaluation on a test set"""
    
    llm, embeddings = get_llm_and_embeddings()
    
    dataset = prepare_evaluation_dataset(
        questions=questions,
        answers=answers,
        contexts=contexts,
        ground_truths=ground_truths,
    )

    # Run evaluation with all metrics
    result = evaluate(
        dataset,
        metrics=[
            faithfulness,
            answer_relevancy,
            context_precision,
            context_recall,
        ],
        llm=llm,
        embeddings=embeddings,
    )

    return EvaluationResult(
        faithfulness=result["faithfulness"],
        answer_relevancy=result["answer_relevancy"],
        context_precision=result["context_precision"],
        context_recall=result["context_recall"],
        timestamp=datetime.now().isoformat(),
        num_samples=len(questions),
    )


def load_golden_set(filepath: str) -> Dict[str, List]:
    """Load golden test set from JSON file"""
    with open(filepath, 'r') as f:
        return json.load(f)


def save_evaluation_result(result: EvaluationResult, filepath: str):
    """Save evaluation result to JSON file"""
    data = {
        "faithfulness": result.faithfulness,
        "answer_relevancy": result.answer_relevancy,
        "context_precision": result.context_precision,
        "context_recall": result.context_recall,
        "timestamp": result.timestamp,
        "num_samples": result.num_samples,
    }
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


if __name__ == "__main__":
    # Example usage
    print("RAGAS Evaluation Pipeline")
    print("Set OPENAI_API_KEY environment variable to run evaluation")
    print("Golden set format:")
    print(json.dumps({
        "questions": ["What is the refund policy?"],
        "answers": ["The refund policy allows returns within 30 days..."],
        "contexts": [["Refund policy: Items can be returned within 30 days of purchase..."]],
        "ground_truths": ["Refunds are allowed within 30 days of purchase with receipt."]
    }, indent=2))
