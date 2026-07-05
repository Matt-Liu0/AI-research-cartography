import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.paper.deleteMany();

  await prisma.paper.createMany({
    data: [
      {
        filename: "attention-is-all-you-need.pdf",
        storageKey: "seed/attention-is-all-you-need.pdf",
        title: "Attention Is All You Need",
        authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
        year: 2017,
        sourceUrl: "https://arxiv.org/abs/1706.03762",
        status: "extracted",
        sections: ["Introduction", "Background", "Model Architecture", "Results", "Conclusion"],
        extraction: {
          claims: [
            "Recurrence and convolutions can be replaced entirely by attention mechanisms.",
            "The Transformer generalizes well to other tasks with large and limited training data.",
          ],
          methods: ["Multi-head self-attention", "Positional encoding"],
          datasets: ["WMT 2014 English-to-German", "WMT 2014 English-to-French"],
          entities: ["Transformer", "Google Brain"],
        },
      },
      {
        filename: "bert-pretraining.pdf",
        storageKey: "seed/bert-pretraining.pdf",
        title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
        authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"],
        year: 2018,
        sourceUrl: "https://arxiv.org/abs/1810.04805",
        status: "extracted",
        sections: ["Introduction", "Related Work", "BERT", "Experiments", "Conclusion"],
        extraction: {
          claims: [
            "Bidirectional pre-training is critical for many language understanding tasks.",
            "A single pre-trained model can be fine-tuned for a wide range of downstream tasks.",
          ],
          methods: ["Masked language modeling", "Next sentence prediction"],
          datasets: ["BooksCorpus", "English Wikipedia"],
          entities: ["BERT", "Google AI Language"],
        },
      },
      {
        filename: "retrieval-augmented-generation.pdf",
        storageKey: "seed/retrieval-augmented-generation.pdf",
        title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
        authors: ["Patrick Lewis", "Ethan Perez", "Aleksandra Piktus"],
        year: 2020,
        sourceUrl: "https://arxiv.org/abs/2005.11401",
        status: "extracted",
        sections: ["Introduction", "Methods", "Experiments", "Results", "Discussion"],
        extraction: {
          claims: [
            "Combining a parametric model with a non-parametric memory improves factual accuracy.",
            "RAG models produce more specific and factually accurate text than a parametric-only baseline.",
          ],
          methods: ["Dense passage retrieval", "Sequence-to-sequence generation"],
          datasets: ["Natural Questions", "MS-MARCO"],
          entities: ["RAG", "Facebook AI Research"],
        },
      },
      {
        filename: "scanned-thesis-draft.pdf",
        storageKey: "seed/scanned-thesis-draft.pdf",
        title: "Untitled Draft",
        authors: [],
        status: "failed",
        sections: [],
        extraction: { claims: [], methods: [], datasets: [], entities: [] },
      },
      {
        filename: "graph-neural-networks-survey.pdf",
        storageKey: "seed/graph-neural-networks-survey.pdf",
        title: "A Comprehensive Survey on Graph Neural Networks",
        authors: ["Zonghan Wu", "Shirui Pan", "Fengwen Chen"],
        year: 2019,
        sourceUrl: "https://arxiv.org/abs/1901.00596",
        status: "parsing",
        sections: [],
        extraction: { claims: [], methods: [], datasets: [], entities: [] },
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
