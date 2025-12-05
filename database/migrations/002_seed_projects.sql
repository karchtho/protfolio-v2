
-- TODO: move to seeds and figure out how it works
-- Insert sample projects with proper image structure
INSERT INTO projects (
  name, 
  description, 
  url, 
  github_url, 
  thumbnail,
  images,
  tags, 
  status, 
  is_featured
) VALUES 
(
  'Portfolio Website',
  'A modern full-stack portfolio built with Angular and Express. Showcases projects and blog posts.',
  'https://karcherthomas.com',
  'https://github.com/karchtho/portfolio-v2',
  NULL,  -- Add a real image path when you have one
  NULL,  -- Add JSON array when you have multiple images
  JSON_ARRAY('Angular', 'Express', 'MySQL', 'Docker'),
  'active',
  TRUE
),
(
  'Snaposaurus',
  'A dinosaur safari photography game built in 72 hours with a 9-person team. My first Unity project — I worked on UI systems, gameplay mechanics, and team coordination.',
  'https://yvalis-studio.itch.io/snaposaurus',
  'https://github.com/Yvalis-Studio/Snaposaurus',
  'uploads/projects/snaposaurus-main.webp',
  JSON_ARRAY('uploads/projects/snaposaurus-main.webp'),  -- For now, same as thumbnail
  JSON_ARRAY('Unity', 'C#', 'Game Jam', 'UI Design', 'Team Collaboration', 'Git'),
  'active',
  TRUE
),
(
  'Task Manager App',
  'Collaborative task management tool with real-time updates and team features.',
  'https://taskhub.com',
  'https://github.com/thomas/taskhub',
  NULL,  -- Placeholder project without image
  NULL,
  JSON_ARRAY('Vue.js', 'Firebase', 'WebSocket'),
  'archived',
  FALSE
);
