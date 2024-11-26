# Use an official Python runtime as the base image
FROM python:3.9-slim

# Install SQLite3
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy the local application files to the container
COPY . .
COPY init_db.py /app/

# Install the dependencies
RUN pip install -r requirements.txt

# Specify the command to run the app
CMD ["python", "app.py"]
