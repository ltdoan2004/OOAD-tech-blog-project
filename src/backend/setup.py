from setuptools import setup, find_packages

setup(
    name="tech-blog-backend",
    version="1.0.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "langchain",
        "openai",
        "python-dotenv",
    ],
)