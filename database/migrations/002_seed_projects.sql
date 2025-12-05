
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
  'Portfolio',
  'A modern personal portfolio built with Angular and Node.js/Express, deployed on a secured OVH VPS with Docker and Nginx reverse proxy. This project marks my transition from PHP to a TypeScript-focused stack, with an emphasis on security-first infrastructure.',
  'https://karcherthomas.com',
  'https://github.com/karchtho/portfolio-v2',
  'uploads/projects/portfolio-main.webp', 
  NULL,  -- Add JSON array when you have multiple images
  JSON_ARRAY('Angular', 'Typescript', 'Node.js', 'Nginx', 'Express', 'MySQL', 'Docker'),
  'active',
  TRUE
),
(
  'Snaposaurus',
  'A dinosaur safari photography game built in 72 hours with a 9-person team. My first Unity project. I worked on UI systems, gameplay mechanics, and team coordination.',
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
