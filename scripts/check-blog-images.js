const fs = require('fs');
const path = require('path');

const contentDir = path.join(process.cwd(), 'content');
const publicDir = path.join(process.cwd(), 'public');

function checkBlogImages() {
  const blogs = fs.readdirSync(contentDir);
  
  blogs.forEach(blog => {
    const blogPath = path.join(contentDir, blog, 'index.mdx');
    if (fs.existsSync(blogPath)) {
      const content = fs.readFileSync(blogPath, 'utf8');
      const imageMatch = content.match(/image:\s*"([^"]+)"/);
      
      if (imageMatch && imageMatch[1]) {
        const imagePath = imageMatch[1].replace('../../public', '');
        const fullImagePath = path.join(publicDir, imagePath);
        
        if (!fs.existsSync(fullImagePath)) {
          console.error(`Missing image for blog "${blog}": ${imagePath}`);
        }
      }
    }
  });
}

checkBlogImages(); 