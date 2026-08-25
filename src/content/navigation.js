export const navigationTree = {
  root: 'dsa-for-everyone',
  sections: [
    {
      id: '00-why-data-structures',
      title: '00-why-data-structures',
      items: [
        { slug: 'is-there-even-a-need', title: 'is-there-even-a-need' },
        { slug: 'data-structures-as-decisions-not-recipes', title: 'data-structures-as-decisions-not-recipes' },
        { slug: 'what-being-good-at-dsa-actually-means', title: 'what-being-good-at-dsa-actually-means' },
      ],
    },
    {
      id: '01-getting-started',
      title: '01-getting-started',
      items: [
        { slug: 'stack-heap-and-where-data-lives', title: 'stack-heap-and-where-data-lives' },
        { slug: 'manual-vs-managed-memory', title: 'manual-vs-managed-memory' },
        { slug: 'structs-classes-grouping-data', title: 'structs-classes-grouping-data' },
        { slug: 'pointers-references-and-address', title: 'pointers-references-and-address' },
        { slug: 'why-we-measure-cost-time-complexity', title: 'why-we-measure-cost-time-complexity' },
        { slug: 'why-we-measure-cost-space-complexity', title: 'why-we-measure-cost-space-complexity' },
        { slug: 'reading-big-o-like-a-sentence', title: 'reading-big-o-like-a-sentence' },
      ],
    },
    {
      id: '02-list-adt',
      title: '02-list-adt',
      items: [
        { slug: 'what-is-an-abstract-data-type', title: 'what-is-an-abstract-data-type' },
        { slug: 'the-list-adt-defining-behavior', title: 'the-list-adt-defining-behavior' },
        { slug: 'operations-every-list-must-support', title: 'operations-every-list-must-support' },
        { slug: 'adt-vs-implementation', title: 'adt-vs-implementation' },
        { slug: 'implementations-of-the-list-adt', title: 'implementations-of-the-list-adt' },
        { slug: 'array-list-and-amortized-growth', title: 'array-list-and-amortized-growth' },
      ],
    },
    {
      id: '03-linked-list',
      title: '03-linked-list',
      items: [
        { slug: 'why-a-linked-list', title: 'why-a-linked-list' },
        { slug: 'anatomy-of-a-node', title: 'anatomy-of-a-node' },
        { slug: 'traversal', title: 'traversal' },
        { slug: 'insertion-head-middle-tail', title: 'insertion-head-middle-tail' },
        { slug: 'deletion-why-you-need-previous', title: 'deletion-why-you-need-previous' },
        { slug: 'types-doubly-and-circular', title: 'types-doubly-and-circular' },
        { slug: 'insertion-deletion-doubly-circular', title: 'insertion-deletion-doubly-circular' },
        { slug: 'fast-and-slow-pointers-the-essence', title: 'fast-and-slow-pointers-the-essence' },
        { slug: 'array-vs-linked-list-side-by-side', title: 'array-vs-linked-list-side-by-side' },
        { slug: 'cache-locality-why-arrays-win-in-practice', title: 'cache-locality-why-arrays-win-in-practice' },
        { slug: 'same-structure-different-skin', title: 'same-structure-different-skin' },
        { slug: 'build-it-yourself-sandbox', title: 'build-it-yourself-sandbox' },
        { slug: 'how-to-approach-any-problem', title: 'how-to-approach-any-problem' },
      ],
    },
    {
      id: 'problems',
      title: 'problems',
      items: [
        { slug: 'reversing-a-linked-list', title: 'reversing-a-linked-list' },
        { slug: 'merging-two-sorted-lists', title: 'merging-two-sorted-lists' },
        { slug: 'sorting-a-linked-list', title: 'sorting-a-linked-list' },
        { slug: 'finding-the-middle-in-one-pass', title: 'finding-the-middle-in-one-pass' },
        { slug: 'detecting-removing-cycles', title: 'detecting-removing-cycles' },
      ],
    },
  ],
};

export const navigationSections = navigationTree.sections;
