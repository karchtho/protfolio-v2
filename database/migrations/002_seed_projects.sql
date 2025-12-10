-- TODO: move to seeds and figure out how it works
-- Insert sample projects with proper image structure
INSERT INTO
  projects (
    name,
    description,
    url,
    github_url,
    thumbnail,
    images,
    tags,
    status,
    is_featured
  )
VALUES
  (
    'Portfolio',
    'A modern personal portfolio built with Angular and Node.js/Express, deployed on a secured OVH VPS with Docker and Nginx reverse proxy. This project marks my transition from PHP to a TypeScript-focused stack, with an emphasis on security-first infrastructure.',
    'https://karcherthomas.com',
    'https://github.com/karchtho/portfolio-v2',
    'uploads/projects/portfolio-main.webp',
    NULL, -- Add JSON array when you have multiple images
    JSON_ARRAY (
      'Angular',
      'Typescript',
      'Node.js',
      'Nginx',
      'Express',
      'MySQL',
      'Docker'
    ),
    'active',
    TRUE
  ),
  (
    'Snaposaurus',
    'A dinosaur safari photography game built in 72 hours with a 9-person team. My first Unity project. I worked on UI systems, gameplay mechanics, and team coordination.',
    'https://yvalis-studio.itch.io/snaposaurus',
    'https://github.com/Yvalis-Studio/Snaposaurus',
    'uploads/projects/snaposaurus-main.webp',
    JSON_ARRAY ('uploads/projects/snaposaurus-main.webp'), -- For now, same as thumbnail
    JSON_ARRAY (
      'Unity',
      'C#',
      'Game Jam',
      'UI Design',
      'Team Collaboration',
      'Git'
    ),
    'active',
    TRUE
  ),
  (
    'MCP Course Repository System',
    'An educational course management system that integrates Claude AI with a MySQL database through the Model Context Protocol (MCP). Enables AI-powered course search and management via multiple interfaces: MCP tools for Claude, Flask web UI, and REST API.',
    '',
    'https://github.com/karchtho/mcp-test',
    'uploads/projects/mcp-main.avif',
    JSON_ARRAY ('uploads/projects/mcp-main.avif'), -- For now, same as thumbnail
    JSON_ARRAY (
      'Python',
      'MCP',
      'Flask',
      'Asyncios',
      'MYSQL',
      'Claude AI'
    ),
    'active',
    TRUE
  );