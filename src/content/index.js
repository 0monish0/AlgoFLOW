import { gettingStartedTopics } from './topics/gettingStarted';
import { adtListTopics } from './topics/adtList';
import { singlyLinkedListTopics } from './topics/singlyLinkedList';
import { doublyLinkedListTopics } from './topics/doublyLinkedList';
import { circularLinkedListTopics } from './topics/circularLinkedList';
import { comparisonAndComplexityTopics } from './topics/comparisonAndComplexity';
import { languageImplementationTopics } from './topics/languageImplementations';
import { referenceTopics } from './topics/reference';

export const allTopics = {
  ...gettingStartedTopics,
  ...adtListTopics,
  ...singlyLinkedListTopics,
  ...doublyLinkedListTopics,
  ...circularLinkedListTopics,
  ...comparisonAndComplexityTopics,
  ...languageImplementationTopics,
  ...referenceTopics,
};

export const getTopicBySlug = (slug) => {
  return allTopics[slug] || null;
};

export const getAllTopicSlugs = () => {
  return Object.keys(allTopics);
};

// Build flat search index for cmdk
export const searchIndex = Object.values(allTopics).flatMap((topic) => {
  const items = [
    {
      id: `${topic.slug}-title`,
      slug: topic.slug,
      title: topic.title,
      category: topic.category,
      type: 'Topic',
      description: topic.summary,
    },
  ];

  if (topic.sections) {
    topic.sections.forEach((sec) => {
      items.push({
        id: `${topic.slug}-${sec.id}`,
        slug: topic.slug,
        hash: sec.id,
        title: sec.title,
        category: topic.title,
        type: 'Section',
        description: sec.content.slice(0, 100) + '...',
      });
    });
  }

  return items;
});
