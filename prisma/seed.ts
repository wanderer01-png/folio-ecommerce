import { prisma } from "../src/lib/prisma";

const genres = [
  { name: "Fiction", slug: "fiction" },
  { name: "Science Fiction", slug: "science-fiction" },
  { name: "Fantasy", slug: "fantasy" },
  { name: "Mystery & Thriller", slug: "mystery-thriller" },
  { name: "Biography", slug: "biography" },
  { name: "Business", slug: "business" },
  { name: "Self-Help", slug: "self-help" },
] as const;

const PDF_URL = "/sample-books/sample-book.pdf";
const EPUB_URL = "/sample-books/sample-book.epub";

const books = [
  {
    title: "The Glass Orchard",
    slug: "the-glass-orchard",
    author: "Elena Marsh",
    isbn: "978-0-000-00001-1",
    description:
      "A sweeping family saga across three generations of orchard keepers, tracing how one small betrayal ripples through decades of harvests and homecomings.",
    coverImages: ["https://picsum.photos/seed/glassorchard/500/750"],
    ebookPrice: "9.99",
    hardcopyPrice: "18.99",
    hardcopyStock: 40,
    ebookFileUrl: PDF_URL,
    ebookFileType: "PDF" as const,
    genreSlug: "fiction",
  },
  {
    title: "The Quiet Garden",
    slug: "the-quiet-garden",
    author: "Elena Marsh",
    isbn: "978-0-000-00002-8",
    description:
      "A widowed botanist retreats to her late husband's overgrown estate and slowly rebuilds both the garden and her own sense of purpose.",
    coverImages: ["https://picsum.photos/seed/quietgarden/500/750"],
    ebookPrice: "8.99",
    hardcopyPrice: "16.99",
    hardcopyStock: 55,
    ebookFileUrl: EPUB_URL,
    ebookFileType: "EPUB" as const,
    genreSlug: "fiction",
  },
  {
    title: "Midnight in Carraway",
    slug: "midnight-in-carraway",
    author: "Thomas Reyes",
    isbn: "978-0-000-00003-5",
    description:
      "When a detective returns to her hometown to investigate a decades-old disappearance, she finds the whole town has been keeping the same secret.",
    coverImages: ["https://picsum.photos/seed/carraway/500/750"],
    ebookPrice: "10.99",
    hardcopyPrice: "19.99",
    hardcopyStock: 35,
    ebookFileUrl: PDF_URL,
    ebookFileType: "PDF" as const,
    genreSlug: "mystery-thriller",
  },
  {
    title: "The Last Signal",
    slug: "the-last-signal",
    author: "Priya Nair",
    isbn: "978-0-000-00004-2",
    description:
      "A deep-space communications officer picks up a transmission that shouldn't exist — one broadcasting from a colony ship that was never launched.",
    coverImages: ["https://picsum.photos/seed/lastsignal/500/750"],
    ebookPrice: "11.99",
    hardcopyPrice: null,
    hardcopyStock: 0,
    ebookFileUrl: EPUB_URL,
    ebookFileType: "EPUB" as const,
    genreSlug: "science-fiction",
  },
  {
    title: "Silent Mechanics",
    slug: "silent-mechanics",
    author: "Priya Nair",
    isbn: "978-0-000-00005-9",
    description:
      "In a city run by aging automatons, a young engineer discovers the machines have started keeping secrets of their own.",
    coverImages: ["https://picsum.photos/seed/silentmech/500/750"],
    ebookPrice: "10.49",
    hardcopyPrice: "21.99",
    hardcopyStock: 28,
    ebookFileUrl: PDF_URL,
    ebookFileType: "PDF" as const,
    genreSlug: "science-fiction",
  },
  {
    title: "Echoes of Tomorrow",
    slug: "echoes-of-tomorrow",
    author: "Jonas Weber",
    isbn: "978-0-000-00006-6",
    description:
      "A physicist's experiment in memory transfer starts receiving messages from a version of herself that hasn't been born yet.",
    coverImages: ["https://picsum.photos/seed/echoestomorrow/500/750"],
    ebookPrice: "9.49",
    hardcopyPrice: null,
    hardcopyStock: 0,
    ebookFileUrl: EPUB_URL,
    ebookFileType: "EPUB" as const,
    genreSlug: "science-fiction",
  },
  {
    title: "Crown of Embers",
    slug: "crown-of-embers",
    author: "Liam O'Connell",
    isbn: "978-0-000-00007-3",
    description:
      "The exiled heir to a burned kingdom must choose between reclaiming her throne and protecting the rebellion that raised her.",
    coverImages: ["https://picsum.photos/seed/crownembers/500/750"],
    ebookPrice: "10.99",
    hardcopyPrice: "22.99",
    hardcopyStock: 32,
    ebookFileUrl: PDF_URL,
    ebookFileType: "PDF" as const,
    genreSlug: "fantasy",
  },
  {
    title: "The Ledger of Kings",
    slug: "the-ledger-of-kings",
    author: "Liam O'Connell",
    isbn: "978-0-000-00008-0",
    description:
      "A palace accountant discovers the kingdom's entire treasury has been a centuries-long fiction — and the truth could topple the crown.",
    coverImages: ["https://picsum.photos/seed/ledgerkings/500/750"],
    ebookPrice: "11.49",
    hardcopyPrice: "23.99",
    hardcopyStock: 24,
    ebookFileUrl: EPUB_URL,
    ebookFileType: "EPUB" as const,
    genreSlug: "fantasy",
  },
  {
    title: "A Life Rebuilt",
    slug: "a-life-rebuilt",
    author: "Margaret Cole",
    isbn: "978-0-000-00009-7",
    description:
      "The memoir of a surgeon who, after losing her hands in an accident, spent a decade learning to practice medicine again in an entirely new way.",
    coverImages: ["https://picsum.photos/seed/liferebuilt/500/750"],
    ebookPrice: null,
    hardcopyPrice: "24.99",
    hardcopyStock: 20,
    ebookFileUrl: null,
    ebookFileType: null,
    genreSlug: "biography",
  },
  {
    title: "The Founder's Mindset",
    slug: "the-founders-mindset",
    author: "David Kim",
    isbn: "978-0-000-00010-3",
    description:
      "Drawing on interviews with over sixty founders, this book maps the specific decision-making habits that separate durable companies from flame-outs.",
    coverImages: ["https://picsum.photos/seed/foundersmindset/500/750"],
    ebookPrice: "14.99",
    hardcopyPrice: "27.99",
    hardcopyStock: 45,
    ebookFileUrl: PDF_URL,
    ebookFileType: "PDF" as const,
    genreSlug: "business",
  },
  {
    title: "Discipline and Design",
    slug: "discipline-and-design",
    author: "David Kim",
    isbn: "978-0-000-00011-0",
    description:
      "A practical field guide to building operating systems for fast-growing teams, from a former operator at three unicorn startups.",
    coverImages: ["https://picsum.photos/seed/disciplinedesign/500/750"],
    ebookPrice: null,
    hardcopyPrice: "26.99",
    hardcopyStock: 18,
    ebookFileUrl: null,
    ebookFileType: null,
    genreSlug: "business",
  },
  {
    title: "Atomic Focus",
    slug: "atomic-focus",
    author: "Rachel Stone",
    isbn: "978-0-000-00012-7",
    description:
      "A no-nonsense system for reclaiming attention in a distracted world, built around small daily commitments rather than willpower.",
    coverImages: ["https://picsum.photos/seed/atomicfocus/500/750"],
    ebookPrice: "12.99",
    hardcopyPrice: "23.99",
    hardcopyStock: 60,
    ebookFileUrl: EPUB_URL,
    ebookFileType: "EPUB" as const,
    genreSlug: "self-help",
  },
] as const;

async function main() {
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  for (const book of books) {
    const { genreSlug, ...bookData } = book;
    const genre = await prisma.genre.findUniqueOrThrow({
      where: { slug: genreSlug },
    });

    await prisma.book.upsert({
      where: { slug: book.slug },
      update: {},
      create: {
        ...bookData,
        coverImages: [...bookData.coverImages],
        genreId: genre.id,
      },
    });
  }

  console.log(`Seeded ${genres.length} genres and ${books.length} books.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
