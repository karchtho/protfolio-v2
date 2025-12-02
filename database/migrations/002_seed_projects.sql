INSERT INTO projects (name, description, url, github_url, image_url, tags, status) VALUES
(
  'Portfolio Website',
  'A modern full-stack portfolio built with Angular and Express. Showcases projects and blog posts.',
  'https://thomasportfolio.com',
  'https://github.com/thomas/portfolio',
  'https://thomasportfolio.com/images/portfolio.jpg',
  JSON_ARRAY('Angular', 'Express', 'MySQL', 'Docker'),
  'active'
),
(
  'E-commerce Platform',
  'Complete e-commerce solution with cart, checkout, and payment integration.',
  'https://shopify-clone.com',
  'https://github.com/thomas/shopify-clone',
  'https://shopify-clone.com/images/shop.jpg',
  JSON_ARRAY('React', 'Node.js', 'Stripe', 'PostgreSQL'),
  'active'
),
(
  'Task Manager App',
  'Collaborative task management tool with real-time updates and team features.',
  'https://taskhub.com',
  'https://github.com/thomas/taskhub',
  'https://taskhub.com/images/tasks.jpg',
  JSON_ARRAY('Vue.js', 'Firebase', 'WebSocket'),
  'archived'
);