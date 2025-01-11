
# OOAD TechConnect Project

A technology-focused blog platform designed for tech enthusiasts. This project allows users to explore, create, and contribute blog posts on various technological topics. Ideal for developers, tech writers, and anyone passionate about technology.

## Web's Logo
<Image
  className="circular-image"
  src="/public/logo.webp"
  width="405"
  height="405"
  alt="TechConnect Logo"
  sizes="100vw"
/> 

## Home Page
<Image
  className="circular-image"
  src="/demo/homepage.png"
  width="1413"
  height="600"
  alt="TechConnect Logo"
  sizes="100vw"
/> 


## Prerequisites
Before you continue, ensure you meet the following requirements:

- You have installed the latest version of Node.js.

- You have MongoDB installed and running.

- You have a basic understanding of web development and RESTful APIs.

## Installation
*Follow these steps to install and run the project locally:*

**1. Clone the Repository:**
```bash
git clone <repository-url>
cd OOAD-tech-blog-project-main
```
**2. Install Dependencies:**
```bash
npm install

cd src/backend_web
npm install

cd src/backend
pip install -r requirements.txt
```
**3. Set Up Environment Variables:** 🔑🔑🔑

Create a  *.env file*  in the root directory with the following content:
```bash
# NEXT_PUBLIC_OPENAI_API_KEY=*******
# NEXT_PUBLIC_SUPABASE_URL=******
# NEXT_PUBLIC_SUPABASE_ANON_KEY=******
# NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Create a  *.env*  in the root directory with the following content:
```bash
OPENAI_API_KEY
MONGO_URL=mongodb://localhost:27017/blog-db
JWT_SECRET=12345
PORT=5001
```

**📌Note that:** When using, remove all hashtag (#).

**4. Run the Development Server:**
```bash
# run front end
npm i
npm run dev

#run backend web

cd src/backend_web
npm run dev
mongosh

# run backend for chatbot service

cd src/backend
uvicorn main:app --reload

```
Open http://localhost:3000 in your browser to access the application.

## Features in Detail
**1. Login System:**
- **Sign Up:** Go to the registration page and fill in the necessary information, such as your name, email address, and password. Ensure you use a valid email address to receive confirmation.
- **Log In:** Use your registered account information to log into the application.
- JWT-based authentication
- Role-based access control
- User profile management
- Admin privileges

**2. Blog Management:**
- MDX-based content creation
- Image upload and management
- Tag-based organization
- Draft and publish workflow 

**3. Create Blog Posts:**
- **Access the Editor:** Once logged in, navigate to the "Create Post" section in the main menu.
- **Using the Editor:**
+ **Interface:** The editor provides formatting tools such as headings, lists, and links, allowing you to create engaging content.
+ **Insert Images:** You can add images to your post by dragging and dropping them or using the "Insert Image" button.
+ **Publish:** When you're finished writing, click the "Publish" button to share your post with the community.

**4. Explore and Search:**
- **Browse Posts:** Use the navigation bar to access different categories or find posts by topic.
- **Search Functionality:** Enter keywords into the search bar to find related posts. The search results will display the most relevant articles.
- **Utilize Tags:** Click on tags to view other posts related to topics of interest.

**5. Chatbot - Agent Search** 

<p align="center">
  <img src="/demo/chatbot_2.png" alt="Image 1" width="45%">
  <img src="/demo/chatbot.png" alt="Image 2" width="45%">
</p>

- Users can ask questions about any blog content.
- Receive detailed answers based on the information provided in the blogs.
- Obtain direct links to the referenced content within the responses.
<br>

📖 Documentation: For detailed information, please refer to the README.md at: https://github.com/ltdoan2004/OOAD-tech-blog-project/blob/main/src/backend/README.md

**6. Switch Theme** 
- Users can effortlessly switch between two primary color themes: **purple** and **yellow**.
- The purple theme offers a modern and elegant feel.
- The yellow theme provides a warm and vibrant touch, making the content more visually engaging.

## Key Features

### 1. Content Management
- Blog post creation and management through MDX
- Rich text editing with image support
- Tag-based categorization
- Admin dashboard for content management
- Responsive design for all devices

### 2. AI Integration
- AI-powered chatbot (TechBot) for user queries
- Content summarization capabilities
- Related article recommendations
- Built with OpenAI's GPT models
- FAISS vector database for efficient content search

### 3. User Interaction
- Real-time commenting system
- Anonymous and authenticated commenting
- Special highlighting for admin comments
- Comment moderation tools
- User authentication system

### 4. Admin Features
- Secure admin dashboard
- Blog post management (create, edit, delete)
- User management
- Comment moderation
- Analytics and insights

### 5. User Features
- Read blog
- Comment
- Use TechBot
- Give feedback (through Contact Page)

## Tech Stack

### Frontend
- [Next.js 13](https://nextjs.org/) (App Router)
- React 18
- [Tailwind CSS](https://tailwindcss.com/)
- [Contentlayer for MDX](https://www.contentlayer.dev/)
- JWT for authentication

### Backend
- [Jest](https://jestjs.io/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- FastAPI (Python) for AI services
- FAISS for vector similarity search
- OpenAI API integration

### AI/ML
- LangChain for AI chain operations
- OpenAI Embeddings
- FAISS vector database
- Custom prompt engineering

## Project Structure
```
├── src/
│   ├── app/               # Next.js pages
│   ├── components/        # React components
│   ├── backend/           # Python AI backend
│   ├── backend_web/       # Node.js backend
│   ├── context/           # React context
│   ├── utils/             # Utility functions
│   ├── content/           # MDX blog posts
├── public/                # Static assets
└── blog_index.faiss/      # FAISS vector database
```

## Contributing
_**We are very happy and satisfied to receive your comments and contributions!**_

If you have any suggestions that could improve this project, please feel free to fork the repository and create a pull request. Alternatively, you can open an issue with the tag "".

**1.Fork the project**

**2.Create your branch**
```bash
git checkout -b yourBranch-name/OOAD-tech-blog-project
```
**3.Commit your changes**
```bash
git add .
git commit -m"your contents"
```
**4.Push to the branch**

_We will probably review your changes, if they are relevant to the project, it will be merged into the master branch_
```bash
git push origin yourBranch-name/OOAD-tech-blog-project
```
**5. Open a pull request**

**Thanks again for your support!❤️**
## Build with




## Contact
We'd like to thank all contributors who have helped improve this project:
- Project members:

  🐻    **Lê Thiên Doanh** https://github.com/ltdoan2004

  🐻‍❄️  **Hồ Thiên Trường** https://github.com/TruongHo22306

  🐼     **Nguyễn Thành Nam** https://github.com/ctin2004

- Project link: 
https://github.com/ltdoan2004/OOAD-tech-blog-project

If you have any question, please contact to:

   Email: doanh25032004@gmail.com, hothientruongd@gmail.com, or ngthanhnam990@gmail.com

## References
https://learncodewithdurgesh.com/course/ecommerce-project-using-java-servlet-jsp-hibernate-mysql/154

https://www.youtube.com/watch?v=YJZI992FnG0&list=PLeS7aZkL6GOvXE05d_sbTOEMEC_UmEGa7&index=37

https://www.youtube.com/watch?v=1QGLHOaRLwM

https://github.com/letiendat1002/e-commerce/tree/master 

https://liai.app/

Many thanks to CodeBucks : 🔥🔥🔥
https://www.youtube.com/@CodeBucks

https://github.com/codebucks27

https://codebucks.gumroad.com/


## License

This project is licensed under the MIT License - see the LICENSE file for details.


