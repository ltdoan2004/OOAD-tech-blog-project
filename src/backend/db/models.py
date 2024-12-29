from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .config import Base

class UserQuery(Base):
    __tablename__ = "user_queries"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False)
    response = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VectorData(Base):
    __tablename__ = "vector_data"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)  # Original content (text/image metadata)
    vector_id = Column(String, nullable=False)  # ID for the vector in the vector DB
    metadata = Column(String, nullable=True)  # Additional metadata
