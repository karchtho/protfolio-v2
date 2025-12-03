INSERT INTO projects (name, description, url, github_url, image_url, tags, status) VALUES
(
  'Portfolio Website',
  'A modern full-stack portfolio built with Angular and Express. Showcases projects and blog posts.',
  'https://thomasportfolio.com',
  'https://github.com/thomas/portfolio',
  'https://picsum.photos/800?random=1',
  JSON_ARRAY('Angular', 'Express', 'MySQL', 'Docker'),
  'active'
),
(
  'E-commerce Platform',
  'Complete e-commerce solution with cart, checkout, and payment integration.',
  'https://shopify-clone.com',
  'https://github.com/thomas/shopify-clone',
  'https://picsum.photos/800?random=2',
  JSON_ARRAY('React', 'Node.js', 'Stripe', 'PostgreSQL'),
  'active'
),
(
  'Task Manager App',
  'Collaborative task management tool with real-time updates and team features.',
  'https://taskhub.com',
  'https://github.com/thomas/taskhub',
  'https://picsum.photos/800?random=3',
  JSON_ARRAY('Vue.js', 'Firebase', 'WebSocket'),
  'archived'
);