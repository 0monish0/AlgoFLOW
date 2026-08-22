import { whyDataStructuresTopics } from './topics/whyDataStructures';
import { gettingStartedTopics } from './topics/gettingStarted';
import { listAdtTopics } from './topics/listAdt';
import { linkedListTopics } from './topics/linkedList';

export const allTopics = {
  ...whyDataStructuresTopics,
  ...gettingStartedTopics,
  ...listAdtTopics,
  ...linkedListTopics,
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
        description: sec.content ? sec.content.slice(0, 100) + '...' : '',
      });
    });
  }

  return items;
});
