FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

WORKDIR /app


COPY . .
RUN apt-get update -y
RUN apt-get install -y libcairo2
RUN pip3 install --no-cache-dir -r requirements.txt

