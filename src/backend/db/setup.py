from .config import engine, Base
from .models import UserQuery, VectorData

# Create tables in the database
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database initialized!")

if __name__ == "__main__":
    init_db()
